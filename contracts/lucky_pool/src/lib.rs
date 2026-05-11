//! LuckyPool — prize-savings protocol on Stellar / Soroban.
//!
//! Users deposit USDC. Deposits are routed to Blend for yield.
//! Weekly, yield is harvested into a prize pool and one depositor wins it.
//! Principal is always withdrawable; only yield is ever at risk.

#![no_std]

mod errors;
mod storage;

#[cfg(test)]
mod test;

use errors::LuckyPoolError;
use soroban_sdk::{
    contract, contractevent, contractimpl, contractmeta, panic_with_error, token, Address, Env,
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
        token_client.transfer(&user, &env.current_contract_address(), &amount);

        // TODO (Blend integration): forward `amount` into blend_pool for yield.
        // blend_client::deposit(&env, &state.blend_pool, &state.usdc, amount);

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

        // TODO (Blend integration): withdraw `amount` from blend_pool first.
        // blend_client::withdraw(&env, &state.blend_pool, &state.usdc, amount);

        // Return USDC to user.
        let token_client = token::Client::new(&env, &state.usdc);
        token_client.transfer(&env.current_contract_address(), &user, &amount);

        pos.principal -= amount;
        pos.tickets = pos.tickets.saturating_sub(amount / STROOP);

        if pos.principal == 0 {
            // Remove from depositors list so they aren't eligible this round.
            let mut depositors = read_depositors(&env);
            if let Some(idx) = depositors.first_index_of(&user) {
                depositors.remove(idx as u32);
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
        let state = read_pool_state(&env);
        if state.paused {
            panic_with_error!(&env, LuckyPoolError::Paused);
        }

        // TODO (Blend integration):
        // 1. Call blend_pool to redeem yield (principal stays in Blend).
        // 2. Receive USDC yield into this contract.
        // 3. Add to state.prize_pool and write_pool_state.
        //
        // let yield_amount = blend_client::claim_yield(&env, &state.blend_pool);
        // state.prize_pool += yield_amount;
        // write_pool_state(&env, &state);
        // env.events().publish((symbol_short!("harvest"),), (yield_amount,));
    }

    /// Manually fund the prize pool — useful for sponsor top-ups and testing.
    pub fn fund_prize_pool(env: Env, from: Address, amount: i128) {
        from.require_auth();

        if amount <= 0 {
            panic_with_error!(&env, LuckyPoolError::InvalidAmount);
        }

        let mut state = read_pool_state(&env);
        let token_client = token::Client::new(&env, &state.usdc);
        token_client.transfer(&from, &env.current_contract_address(), &amount);

        state.prize_pool += amount;
        write_pool_state(&env, &state);

        PrizeFunded { from, amount }.publish(&env);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DRAW
    // ─────────────────────────────────────────────────────────────────────────

    /// Admin executes the draw, specifying the winner address.
    ///
    /// In production this will be replaced by a VRF-backed call where the
    /// winner is derived from `vrf_output` + `vrf_proof` verified on-chain
    /// (Acurast / Oracle Shield).  For now the admin supplies the winner so
    /// the rest of the prize flow can be tested end-to-end.
    pub fn execute_draw(env: Env, winner: Address) {
        let mut state = read_pool_state(&env);
        state.admin.require_auth();

        if state.prize_pool == 0 {
            panic_with_error!(&env, LuckyPoolError::InsufficientPrize);
        }

        let depositors = read_depositors(&env);
        if depositors.is_empty() {
            panic_with_error!(&env, LuckyPoolError::NoDepositors);
        }

        // Deduct protocol fee (hardcoded max 10 % at init — not upgradeable).
        let fee = state.prize_pool * state.protocol_fee_bps as i128 / 10_000;
        let prize = state.prize_pool - fee;

        // Pay winner.
        let token_client = token::Client::new(&env, &state.usdc);
        token_client.transfer(&env.current_contract_address(), &winner, &prize);

        // Persist round history.
        let total_tickets = state.total_deposits / STROOP;
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
        write_pool_state(&env, &state);
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
