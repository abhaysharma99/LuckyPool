//! LuckyPool — prize-savings protocol on Stellar / Soroban.
//!
//! Users deposit USDC. Deposits are routed to Blend for yield.
//! Weekly, yield is harvested into a prize pool and one depositor wins it.
//! Principal is always withdrawable; only yield is ever at risk.

#![no_std]

mod blend;
mod errors;
mod storage;

#[cfg(test)]
mod test;
#[cfg(test)]
mod test_blend;

use errors::LuckyPoolError;
use soroban_sdk::{
    contract, contractevent, contractimpl, contractmeta, panic_with_error, token, vec, Address,
    Bytes, BytesN, Env,
};

// ── Typed events ─────────────────────────────────────────────────────────────

#[contractevent(topics = ["LuckyPool", "deposit"], data_format = "map")]
struct Deposited { user: Address, amount: i128, round: u64 }

#[contractevent(topics = ["LuckyPool", "withdraw"], data_format = "map")]
struct Withdrawn { user: Address, amount: i128 }

#[contractevent(topics = ["LuckyPool", "fund"], data_format = "map")]
struct PrizeFunded { from: Address, amount: i128 }

#[contractevent(topics = ["LuckyPool", "draw"], data_format = "map")]
struct DrawCompleted { round: u64, winner: Address, prize: i128 }

#[contractevent(topics = ["LuckyPool", "request_draw"], data_format = "map")]
struct DrawRequested { round: u64, round_seed: BytesN<32> }

#[contractevent(topics = ["LuckyPool", "harvest"], data_format = "map")]
struct YieldHarvested { amount: i128 }
use storage::{
    pool_is_initialised, read_depositors, read_pool_state, read_position, read_round_result,
    write_depositors, write_pool_state, write_position, write_round_result, PoolState,
    RoundResult, UserPosition,
};

/// 1 USDC expressed in stroops (7 decimal places).
const STROOP: i128 = 10_000_000;

contractmeta!(
    key = "Description",
    val = "LuckyPool — no-loss prize savings on Stellar"
);
contractmeta!(key = "Version", val = "0.1.0");

#[contract]
pub struct LuckyPool;

#[contractimpl]
impl LuckyPool {
    // ─────────────────────────────────────────────────────────────────────────
    // INITIALISE
    // ─────────────────────────────────────────────────────────────────────────

    /// Deploy-time setup.  Must be called once by `admin`.
    ///
    /// * `usdc`            — USDC Stellar Asset Contract address
    /// * `blend_pool`      — Blend lending-pool contract (yield source)
    /// * `oracle`          — VRF oracle contract (randomness for draws)
    /// * `protocol_fee_bps`— fee taken from prize at each draw (max 1 000 = 10 %)
    pub fn initialize(
        env: Env,
        admin: Address,
        usdc: Address,
        blend_pool: Address,
        oracle: Address,
        protocol_fee_bps: u32,
    ) {
        if pool_is_initialised(&env) {
            panic_with_error!(&env, LuckyPoolError::AlreadyInitialized);
        }
        if protocol_fee_bps > 1_000 {
            panic_with_error!(&env, LuckyPoolError::FeeTooHigh);
        }

        admin.require_auth();

        write_pool_state(
            &env,
            &PoolState {
                admin,
                usdc,
                blend_pool,
                oracle,
                total_deposits: 0,
                prize_pool: 0,
                current_round: 1,
                last_draw_ledger: env.ledger().sequence(),
                protocol_fee_bps,
                paused: false,
                draw_requested: false,
                round_seed: BytesN::from_array(&env, &[0u8; 32]),
            },
        );

        write_depositors(&env, &soroban_sdk::Vec::new(&env));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // USER ACTIONS
    // ─────────────────────────────────────────────────────────────────────────

    /// Deposit `amount` USDC stroops.  Grants 1 lottery ticket per USDC deposited.
    ///
    /// Auth: `user` must sign this invocation (and the inner token transfer).
    pub fn deposit(env: Env, user: Address, amount: i128) {
        user.require_auth();

        if amount <= 0 {
            panic_with_error!(&env, LuckyPoolError::InvalidAmount);
        }

        let mut state = read_pool_state(&env);
        if state.paused {
            panic_with_error!(&env, LuckyPoolError::Paused);
        }

        // Pull USDC from user → contract.
        let token_client = token::Client::new(&env, &state.usdc);
        token_client.transfer(&user, env.current_contract_address(), &amount);

        // Forward into Blend for yield: approve the pool to pull `amount`,
        // then submit_with_allowance so Blend uses transfer_from against
        // that allowance rather than requiring a nested transfer auth.
        let this = env.current_contract_address();
        let expiration_ledger = env.ledger().sequence() + 1000;
        env.authorize_as_current_contract(soroban_sdk::vec![
            &env,
            blend::approve_auth_entry(
                &env,
                &state.usdc,
                &this,
                &state.blend_pool,
                amount,
                expiration_ledger,
            ),
        ]);
        token_client.approve(&this, &state.blend_pool, &amount, &expiration_ledger);

        let pool_client = blend::PoolClient::new(&env, &state.blend_pool);
        pool_client.submit_with_allowance(
            &this,
            &this,
            &this,
            &vec![
                &env,
                blend::Request {
                    request_type: blend::REQUEST_TYPE_SUPPLY,
                    address: state.usdc.clone(),
                    amount,
                },
            ],
        );

        // Update or create user position.
        let mut pos = read_position(&env, &user);
        if pos.principal == 0 {
            // First deposit: register as a depositor.
            let mut depositors = read_depositors(&env);
            depositors.push_back(user.clone());
            write_depositors(&env, &depositors);
            pos.round_joined = state.current_round;
        }
        pos.principal += amount;
        pos.tickets += amount / STROOP; // 1 USDC = 1 ticket
        write_position(&env, &user, &pos);

        state.total_deposits += amount;
        write_pool_state(&env, &state);

        Deposited { user, amount, round: state.current_round }.publish(&env);
    }

    /// Withdraw `amount` USDC stroops.  Principal is always accessible.
    ///
    /// Withdrawing to zero removes the user from the lottery for this round.
    pub fn withdraw(env: Env, user: Address, amount: i128) {
        user.require_auth();

        if amount <= 0 {
            panic_with_error!(&env, LuckyPoolError::InvalidAmount);
        }

        let mut state = read_pool_state(&env);
        let mut pos = read_position(&env, &user);

        if pos.principal < amount {
            panic_with_error!(&env, LuckyPoolError::InsufficientBalance);
        }

        // Pull `amount` back out of Blend into this contract before paying
        // the user. No approval needed — Blend pays out directly, it never
        // needs to pull tokens from us to do this.
        let pool_client = blend::PoolClient::new(&env, &state.blend_pool);
        let this = env.current_contract_address();
        pool_client.submit_with_allowance(
            &this,
            &this,
            &this,
            &vec![
                &env,
                blend::Request {
                    request_type: blend::REQUEST_TYPE_WITHDRAW,
                    address: state.usdc.clone(),
                    amount,
                },
            ],
        );

        // Return USDC to user.
        let token_client = token::Client::new(&env, &state.usdc);
        token_client.transfer(&env.current_contract_address(), &user, &amount);

        pos.principal -= amount;
        pos.tickets = pos.tickets.saturating_sub(amount / STROOP);

        if pos.principal == 0 {
            // Remove from depositors list so they aren't eligible this round.
            let mut depositors = read_depositors(&env);
            if let Some(idx) = depositors.first_index_of(&user) {
                depositors.remove(idx);
            }
            write_depositors(&env, &depositors);
        }

        write_position(&env, &user, &pos);
        state.total_deposits -= amount;
        write_pool_state(&env, &state);

        Withdrawn { user, amount }.publish(&env);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PROTOCOL ACTIONS
    // ─────────────────────────────────────────────────────────────────────────

    /// Harvest accrued yield from Blend into the prize pool.
    /// Permissionless — anyone can call to prevent admin from capturing yield.
    pub fn harvest_yield(env: Env) {
        let mut state = read_pool_state(&env);
        if state.paused {
            panic_with_error!(&env, LuckyPoolError::Paused);
        }

        let pool_client = blend::PoolClient::new(&env, &state.blend_pool);
        let this = env.current_contract_address();

        let positions = pool_client.get_positions(&this);
        let reserve = pool_client.get_reserve(&state.usdc);
        let b_tokens = positions.supply.get(reserve.config.index).unwrap_or(0);
        let underlying_value = blend::to_asset_from_b_token(b_tokens, reserve.data.b_rate);

        // Yield is whatever Blend now values our supply position at, above
        // the principal we've deposited (which never itself changes here).
        let yield_amount = underlying_value - state.total_deposits;
        if yield_amount <= 0 {
            return;
        }

        pool_client.submit_with_allowance(
            &this,
            &this,
            &this,
            &vec![
                &env,
                blend::Request {
                    request_type: blend::REQUEST_TYPE_WITHDRAW,
                    address: state.usdc.clone(),
                    amount: yield_amount,
                },
            ],
        );

        state.prize_pool += yield_amount;
        write_pool_state(&env, &state);

        YieldHarvested { amount: yield_amount }.publish(&env);
    }

    /// Manually fund the prize pool — useful for sponsor top-ups and testing.
    pub fn fund_prize_pool(env: Env, from: Address, amount: i128) {
        from.require_auth();

        if amount <= 0 {
            panic_with_error!(&env, LuckyPoolError::InvalidAmount);
        }

        let mut state = read_pool_state(&env);
        let token_client = token::Client::new(&env, &state.usdc);
        token_client.transfer(&from, env.current_contract_address(), &amount);

        state.prize_pool += amount;
        write_pool_state(&env, &state);

        PrizeFunded { from, amount }.publish(&env);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DRAW
    // ─────────────────────────────────────────────────────────────────────────

    /// Permissionless: opens the draw for the current round once the prize
    /// pool is funded and there's at least one depositor. Computes the
    /// public seed (sha256 of the round number) the VRF output must
    /// correspond to and emits it for an oracle to respond to.
    ///
    /// See docs/randomness.md for the full VRF design.
    pub fn request_draw(env: Env) {
        let mut state = read_pool_state(&env);

        if state.draw_requested {
            panic_with_error!(&env, LuckyPoolError::DrawAlreadyRequested);
        }
        if state.prize_pool == 0 {
            panic_with_error!(&env, LuckyPoolError::InsufficientPrize);
        }
        if read_depositors(&env).is_empty() {
            panic_with_error!(&env, LuckyPoolError::NoDepositors);
        }

        let seed_input = Bytes::from_array(&env, &state.current_round.to_be_bytes());
        let round_seed: BytesN<32> = env.crypto().sha256(&seed_input).into();

        state.draw_requested = true;
        state.round_seed = round_seed.clone();
        write_pool_state(&env, &state);

        DrawRequested { round: state.current_round, round_seed }.publish(&env);
    }

    /// Executes a previously-requested draw, selecting the winner from
    /// `vrf_output` weighted by ticket count (see docs/randomness.md).
    ///
    /// `vrf_proof` is accepted but not yet verified — no VRF oracle with a
    /// concrete, verifiable on-chain interface has been selected yet.
    /// **This makes `vrf_output` effectively admin-supplied randomness, not
    /// yet the provably-fair draw this is designed for.** Admin-gated for
    /// that reason; must be replaced by proof verification (rejecting the
    /// call if `oracle.verify(vrf_proof, vrf_output, round_seed)` fails)
    /// before this can become permissionless or reach mainnet.
    pub fn execute_draw(env: Env, vrf_output: BytesN<32>, vrf_proof: Bytes) {
        let _ = vrf_proof; // TODO: verify against state.round_seed once a VRF oracle is integrated.

        let mut state = read_pool_state(&env);
        state.admin.require_auth();

        if !state.draw_requested {
            panic_with_error!(&env, LuckyPoolError::DrawNotRequested);
        }

        let depositors = read_depositors(&env);
        if depositors.is_empty() {
            panic_with_error!(&env, LuckyPoolError::NoDepositors);
        }

        let total_tickets = state.total_deposits / STROOP;
        if total_tickets == 0 {
            panic_with_error!(&env, LuckyPoolError::NoTickets);
        }
        let winner = Self::select_winner(&env, &vrf_output, &depositors, total_tickets);

        // Deduct protocol fee (hardcoded max 10 % at init — not upgradeable).
        let fee = state.prize_pool * state.protocol_fee_bps as i128 / 10_000;
        let prize = state.prize_pool - fee;

        // Pay winner.
        let token_client = token::Client::new(&env, &state.usdc);
        token_client.transfer(&env.current_contract_address(), &winner, &prize);

        // Persist round history.
        let result = RoundResult {
            round: state.current_round,
            winner: winner.clone(),
            prize,
            total_tickets,
            draw_ledger: env.ledger().sequence(),
        };
        write_round_result(&env, &result);

        DrawCompleted { round: state.current_round, winner, prize }.publish(&env);

        // Advance to the next round.
        state.prize_pool = 0;
        state.current_round += 1;
        state.last_draw_ledger = env.ledger().sequence();
        state.draw_requested = false;
        write_pool_state(&env, &state);
    }

    /// Weighted winner selection: walks depositors in insertion order,
    /// picking whoever's cumulative ticket range covers `vrf_output % total_tickets`.
    fn select_winner(
        env: &Env,
        vrf_output: &BytesN<32>,
        depositors: &soroban_sdk::Vec<Address>,
        total_tickets: i128,
    ) -> Address {
        let bytes = vrf_output.to_array();
        let seed = u64::from_be_bytes(bytes[0..8].try_into().unwrap());
        let winning_ticket = (seed % total_tickets as u64) as i128;

        let mut cumulative: i128 = 0;
        for addr in depositors.iter() {
            let pos = read_position(env, &addr);
            cumulative += pos.tickets;
            if cumulative > winning_ticket {
                return addr;
            }
        }
        panic_with_error!(env, LuckyPoolError::NoTickets)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN
    // ─────────────────────────────────────────────────────────────────────────

    /// Pause new deposits.  Withdrawals always remain open.
    pub fn pause(env: Env) {
        let mut state = read_pool_state(&env);
        state.admin.require_auth();
        state.paused = true;
        write_pool_state(&env, &state);
    }

    /// Resume deposits.
    pub fn unpause(env: Env) {
        let mut state = read_pool_state(&env);
        state.admin.require_auth();
        state.paused = false;
        write_pool_state(&env, &state);
    }

    /// Transfer admin rights.  Both current and new admin must sign.
    pub fn set_admin(env: Env, new_admin: Address) {
        let mut state = read_pool_state(&env);
        state.admin.require_auth();
        new_admin.require_auth();
        state.admin = new_admin;
        write_pool_state(&env, &state);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VIEWS
    // ─────────────────────────────────────────────────────────────────────────

    pub fn get_position(env: Env, user: Address) -> UserPosition {
        read_position(&env, &user)
    }

    pub fn get_pool_state(env: Env) -> PoolState {
        read_pool_state(&env)
    }

    pub fn get_round_result(env: Env, round: u64) -> Option<RoundResult> {
        read_round_result(&env, round)
    }
}
