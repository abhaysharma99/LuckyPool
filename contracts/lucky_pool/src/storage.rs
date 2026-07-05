use soroban_sdk::{contracttype, Address, BytesN, Env, Vec};

// ─── Data types ─────────────────────────────────────────────────────────────

/// Per-user state: principal deposited, tickets earned, round joined.
#[derive(Clone, Debug)]
#[contracttype]
pub struct UserPosition {
    /// USDC deposited in stroops (7 decimals — 1 USDC = 10_000_000).
    pub principal: i128,
    /// Lottery tickets: 1 USDC deposited = 1 ticket.
    pub tickets: i128,
    /// Round number when the user first deposited.
    pub round_joined: u64,
}

/// Global contract state stored in instance storage.
#[derive(Clone, Debug)]
#[contracttype]
pub struct PoolState {
    pub admin: Address,
    /// USDC token contract (SAC on testnet).
    pub usdc: Address,
    /// Blend lending-pool contract — yield source.
    pub blend_pool: Address,
    /// VRF oracle contract — randomness source for draws.
    pub oracle: Address,
    /// Sum of all user principals (stroops).
    pub total_deposits: i128,
    /// Accumulated yield available to award (stroops).
    pub prize_pool: i128,
    /// Current lottery round (increments after each draw).
    pub current_round: u64,
    /// Ledger sequence of the most recent draw.
    pub last_draw_ledger: u32,
    /// Protocol fee in basis points — capped at 1 000 (10 %) at init.
    pub protocol_fee_bps: u32,
    /// When paused, new deposits are blocked; withdrawals always open.
    pub paused: bool,
    /// True between `request_draw()` and `execute_draw()` for the current round.
    pub draw_requested: bool,
    /// Public input the VRF output for the pending draw must correspond to.
    /// Only meaningful while `draw_requested` is true.
    pub round_seed: BytesN<32>,
}

/// Immutable record written after each draw.
#[derive(Clone, Debug)]
#[contracttype]
pub struct RoundResult {
    pub round: u64,
    pub winner: Address,
    pub prize: i128,
    pub total_tickets: i128,
    pub draw_ledger: u32,
}

// ─── Storage keys ────────────────────────────────────────────────────────────

#[contracttype]
pub enum DataKey {
    PoolState,
    Position(Address),
    Round(u64),
    /// Ordered list of all addresses that have ever deposited (for draw).
    Depositors,
}

// ─── TTL constants ────────────────────────────────────────────────────────────

const LEDGERS_PER_DAY: u32 = 17_280; // ~5 s / ledger
const BUMP_AMOUNT: u32 = 30 * LEDGERS_PER_DAY;
const MIN_TTL: u32 = 20 * LEDGERS_PER_DAY;

// ─── Helpers ─────────────────────────────────────────────────────────────────

pub fn write_pool_state(env: &Env, state: &PoolState) {
    env.storage().instance().set(&DataKey::PoolState, state);
}

pub fn read_pool_state(env: &Env) -> PoolState {
    env.storage()
        .instance()
        .get(&DataKey::PoolState)
        .expect("pool not initialised")
}

pub fn pool_is_initialised(env: &Env) -> bool {
    env.storage().instance().has(&DataKey::PoolState)
}

pub fn write_position(env: &Env, user: &Address, pos: &UserPosition) {
    let key = DataKey::Position(user.clone());
    env.storage().persistent().set(&key, pos);
    env.storage()
        .persistent()
        .extend_ttl(&key, MIN_TTL, BUMP_AMOUNT);
}

pub fn read_position(env: &Env, user: &Address) -> UserPosition {
    let key = DataKey::Position(user.clone());
    if let Some(pos) = env.storage().persistent().get::<DataKey, UserPosition>(&key) {
        env.storage()
            .persistent()
            .extend_ttl(&key, MIN_TTL, BUMP_AMOUNT);
        pos
    } else {
        UserPosition { principal: 0, tickets: 0, round_joined: 0 }
    }
}

pub fn write_round_result(env: &Env, result: &RoundResult) {
    let key = DataKey::Round(result.round);
    env.storage().persistent().set(&key, result);
    env.storage()
        .persistent()
        .extend_ttl(&key, MIN_TTL, BUMP_AMOUNT);
}

pub fn read_round_result(env: &Env, round: u64) -> Option<RoundResult> {
    env.storage()
        .persistent()
        .get(&DataKey::Round(round))
}

pub fn write_depositors(env: &Env, depositors: &Vec<Address>) {
    env.storage()
        .instance()
        .set(&DataKey::Depositors, depositors);
}

pub fn read_depositors(env: &Env) -> Vec<Address> {
    env.storage()
        .instance()
        .get(&DataKey::Depositors)
        .unwrap_or_else(|| Vec::new(env))
}
