//! Minimal client bindings for the Blend v2 Pool contract — only the subset
//! of its public interface LuckyPool calls (supply/withdraw underlying, read
//! back the accrued value). Mirrored locally rather than depending on the
//! published `blend-contract-sdk` crate, which currently pins `soroban-sdk
//! 25.x` while this contract requires `26.x` for `#[contractevent]`.
//!
//! Verified field-for-field against blend-contracts-v2 @ main:
//! - pool/src/contract.rs   (submit / get_positions / get_reserve signatures)
//! - pool/src/pool/actions.rs (Request, RequestType)
//! - pool/src/pool/user.rs  (Positions)
//! - pool/src/pool/reserve.rs (Reserve, to_asset_from_b_token)
//! - pool/src/storage.rs    (ReserveConfig, ReserveData)
//! - pool/src/constants.rs  (SCALAR_12)

use soroban_sdk::{
    auth::{ContractContext, InvokerContractAuthEntry, SubContractInvocation},
    contractclient, contracttype, Address, Env, IntoVal, Map, Symbol, Vec,
};

/// LuckyPool never borrows against its deposits, so it always uses the
/// non-collateralized Supply/Withdraw request types (0/1) rather than
/// SupplyCollateral/WithdrawCollateral (2/3) — collateral positions exist to
/// let the depositor borrow against them, which is exposure this "principal
/// never at risk" product must never take on.
pub const REQUEST_TYPE_SUPPLY: u32 = 0;
pub const REQUEST_TYPE_WITHDRAW: u32 = 1;

/// Fixed-point scalar for b_rate/d_rate conversions (12 decimals).
pub const SCALAR_12: i128 = 1_000_000_000_000;

#[derive(Clone)]
#[contracttype]
pub struct Request {
    pub request_type: u32,
    pub address: Address,
    pub amount: i128,
}

#[derive(Clone)]
#[contracttype]
pub struct Positions {
    pub liabilities: Map<u32, i128>,
    pub collateral: Map<u32, i128>,
    pub supply: Map<u32, i128>,
}

#[derive(Clone)]
#[contracttype]
pub struct ReserveConfig {
    pub index: u32,
    pub decimals: u32,
    pub c_factor: u32,
    pub l_factor: u32,
    pub util: u32,
    pub max_util: u32,
    pub r_base: u32,
    pub r_one: u32,
    pub r_two: u32,
    pub r_three: u32,
    pub reactivity: u32,
    pub supply_cap: i128,
    pub enabled: bool,
}

#[derive(Clone)]
#[contracttype]
pub struct ReserveData {
    pub d_rate: i128,
    pub b_rate: i128,
    pub ir_mod: i128,
    pub b_supply: i128,
    pub d_supply: i128,
    pub backstop_credit: i128,
    pub last_time: u64,
}

#[derive(Clone)]
#[contracttype]
pub struct Reserve {
    pub asset: Address,
    pub config: ReserveConfig,
    pub data: ReserveData,
    pub scalar: i128,
}

// Only used to generate `PoolClient` below and (in tests) to type-check
// `test_blend::MockBlendPool`'s implementation against it.
#[allow(dead_code)]
#[contractclient(name = "PoolClient")]
pub trait Pool {
    fn submit(
        e: Env,
        from: Address,
        spender: Address,
        to: Address,
        requests: Vec<Request>,
    ) -> Positions;
    fn submit_with_allowance(
        e: Env,
        from: Address,
        spender: Address,
        to: Address,
        requests: Vec<Request>,
    ) -> Positions;
    fn get_positions(e: Env, address: Address) -> Positions;
    fn get_reserve(e: Env, asset: Address) -> Reserve;
}

/// underlying = b_tokens * b_rate / SCALAR_12 (floor) — mirrors
/// `Reserve::to_asset_from_b_token` in blend-contracts-v2.
pub fn to_asset_from_b_token(b_tokens: i128, b_rate: i128) -> i128 {
    (b_tokens * b_rate) / SCALAR_12
}

/// Builds the pre-authorization entry a contract must pass to
/// `env.authorize_as_current_contract` before calling `token.approve(...)`
/// directly on its own behalf — Soroban never auto-satisfies a contract's
/// own `require_auth()`, even for calls it makes itself; it must always be
/// explicitly authorized this way. Verified against the working pattern in
/// https://github.com/jamesbachini/Blend-Vault (contracts/src/lib.rs).
pub fn approve_auth_entry(
    env: &Env,
    token: &Address,
    from: &Address,
    spender: &Address,
    amount: i128,
    expiration_ledger: u32,
) -> InvokerContractAuthEntry {
    InvokerContractAuthEntry::Contract(SubContractInvocation {
        context: ContractContext {
            contract: token.clone(),
            fn_name: Symbol::new(env, "approve"),
            args: (from.clone(), spender.clone(), amount, expiration_ledger).into_val(env),
        },
        sub_invocations: Vec::new(env),
    })
}
