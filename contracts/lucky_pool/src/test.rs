#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token::{Client as TokenClient, StellarAssetClient},
    Address, Env,
};

const STROOP: i128 = 10_000_000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

struct Setup {
    env:      Env,
    contract: Address,
    admin:    Address,
    alice:    Address,
    bob:      Address,
    usdc:     Address,
}

fn setup() -> Setup {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob   = Address::generate(&env);

    // Deploy a Stellar Asset Contract as USDC mock.
    let usdc = env.register_stellar_asset_contract_v2(admin.clone()).address();
    let sac  = StellarAssetClient::new(&env, &usdc);
    sac.mint(&admin, &(1_000 * STROOP)); // admin funds prize pool in tests
    sac.mint(&alice, &(1_000 * STROOP));
    sac.mint(&bob,   &(1_000 * STROOP));

    let blend_pool = Address::generate(&env);
    let oracle     = Address::generate(&env);

    let contract = env.register(LuckyPool, ());
    let client   = LuckyPoolClient::new(&env, &contract);
    client.initialize(&admin, &usdc, &blend_pool, &oracle, &500); // 5 % fee

    Setup { env, contract, admin, alice, bob, usdc }
}

fn client<'a>(env: &'a Env, contract: &'a Address) -> LuckyPoolClient<'a> {
    LuckyPoolClient::new(env, contract)
}

fn token<'a>(env: &'a Env, usdc: &'a Address) -> TokenClient<'a> {
    TokenClient::new(env, usdc)
}

// ─── initialise ──────────────────────────────────────────────────────────────

#[test]
fn initialise_stores_state() {
    let s  = setup();
    let cl = client(&s.env, &s.contract);
    let st = cl.get_pool_state();
    assert_eq!(st.total_deposits,   0);
    assert_eq!(st.prize_pool,       0);
    assert_eq!(st.current_round,    1);
    assert_eq!(st.protocol_fee_bps, 500);
    assert!(!st.paused);
}

#[test]
#[should_panic]
fn initialise_twice_panics() {
    let s  = setup();
    let cl = client(&s.env, &s.contract);
    let dummy = Address::generate(&s.env);
    cl.initialize(&s.admin, &s.usdc, &dummy, &dummy, &500);
}

// ─── deposit ─────────────────────────────────────────────────────────────────

#[test]
fn deposit_updates_position_and_pool() {
    let s  = setup();
    let cl = client(&s.env, &s.contract);

    cl.deposit(&s.alice, &(100 * STROOP));

    let pos = cl.get_position(&s.alice);
    assert_eq!(pos.principal,   100 * STROOP);
    assert_eq!(pos.tickets,     100);
    assert_eq!(pos.round_joined, 1);

    let st = cl.get_pool_state();
    assert_eq!(st.total_deposits, 100 * STROOP);
}

#[test]
fn deposit_moves_usdc_into_contract() {
    let s  = setup();
    let cl = client(&s.env, &s.contract);
    let tk = token(&s.env, &s.usdc);

    let alice_before    = tk.balance(&s.alice);
    let contract_before = tk.balance(&s.contract);

    cl.deposit(&s.alice, &(200 * STROOP));

    assert_eq!(tk.balance(&s.alice),    alice_before    - 200 * STROOP);
    assert_eq!(tk.balance(&s.contract), contract_before + 200 * STROOP);
}

#[test]
fn second_deposit_accumulates() {
    let s  = setup();
    let cl = client(&s.env, &s.contract);

    cl.deposit(&s.alice, &(100 * STROOP));
    cl.deposit(&s.alice, &(50  * STROOP));

    let pos = cl.get_position(&s.alice);
    assert_eq!(pos.principal, 150 * STROOP);
    assert_eq!(pos.tickets,   150);
}

#[test]
#[should_panic]
fn deposit_zero_panics() {
    let s  = setup();
    client(&s.env, &s.contract).deposit(&s.alice, &0);
}

#[test]
#[should_panic]
fn deposit_while_paused_panics() {
    let s  = setup();
    let cl = client(&s.env, &s.contract);
    cl.pause();
    cl.deposit(&s.alice, &(10 * STROOP));
}

// ─── withdraw ────────────────────────────────────────────────────────────────

#[test]
fn withdraw_returns_usdc_and_burns_tickets() {
    let s  = setup();
    let cl = client(&s.env, &s.contract);
    let tk = token(&s.env, &s.usdc);

    cl.deposit(&s.alice, &(100 * STROOP));
    let before = tk.balance(&s.alice);
    cl.withdraw(&s.alice, &(40 * STROOP));

    assert_eq!(tk.balance(&s.alice), before + 40 * STROOP);
    let pos = cl.get_position(&s.alice);
    assert_eq!(pos.principal, 60 * STROOP);
    assert_eq!(pos.tickets,   60);
}

#[test]
fn full_withdraw_clears_position() {
    let s  = setup();
    let cl = client(&s.env, &s.contract);

    cl.deposit(&s.alice, &(100 * STROOP));
    cl.withdraw(&s.alice, &(100 * STROOP));

    let pos = cl.get_position(&s.alice);
    assert_eq!(pos.principal, 0);
    assert_eq!(pos.tickets,   0);

    let st = cl.get_pool_state();
    assert_eq!(st.total_deposits, 0);
}

#[test]
#[should_panic]
fn withdraw_more_than_balance_panics() {
    let s  = setup();
    let cl = client(&s.env, &s.contract);

    cl.deposit(&s.alice, &(50 * STROOP));
    cl.withdraw(&s.alice, &(100 * STROOP));
}

// ─── fund_prize_pool + execute_draw ──────────────────────────────────────────

#[test]
fn draw_pays_winner_minus_fee() {
    let s  = setup();
    let cl = client(&s.env, &s.contract);
    let tk = token(&s.env, &s.usdc);

    cl.deposit(&s.alice, &(100 * STROOP));
    cl.deposit(&s.bob,   &(100 * STROOP));

    // Sponsor adds 100 USDC to prize pool.
    cl.fund_prize_pool(&s.admin, &(100 * STROOP));

    let state = cl.get_pool_state();
    assert_eq!(state.prize_pool, 100 * STROOP);

    let alice_before = tk.balance(&s.alice);
    cl.execute_draw(&s.alice);

    // 5 % fee → winner receives 95 USDC.
    assert_eq!(tk.balance(&s.alice), alice_before + 95 * STROOP);

    let new_state = cl.get_pool_state();
    assert_eq!(new_state.prize_pool,    0);
    assert_eq!(new_state.current_round, 2);
}

#[test]
fn round_result_is_persisted() {
    let s  = setup();
    let cl = client(&s.env, &s.contract);

    cl.deposit(&s.alice, &(100 * STROOP));
    cl.fund_prize_pool(&s.admin, &(50 * STROOP));
    cl.execute_draw(&s.alice);

    let result = cl.get_round_result(&1).expect("round 1 result missing");
    assert_eq!(result.round,  1);
    assert_eq!(result.winner, s.alice);
    assert_eq!(result.prize,  475 * STROOP / 10); // 47.5 USDC
}

#[test]
#[should_panic]
fn draw_with_empty_prize_pool_panics() {
    let s  = setup();
    let cl = client(&s.env, &s.contract);
    cl.deposit(&s.alice, &(100 * STROOP));
    cl.execute_draw(&s.alice);
}

#[test]
#[should_panic]
fn draw_with_no_depositors_panics() {
    let s  = setup();
    let cl = client(&s.env, &s.contract);
    cl.fund_prize_pool(&s.admin, &(50 * STROOP));
    cl.execute_draw(&s.alice);
}

// ─── pause / unpause ─────────────────────────────────────────────────────────

#[test]
fn pause_blocks_deposits_not_withdrawals() {
    let s  = setup();
    let cl = client(&s.env, &s.contract);

    cl.deposit(&s.alice, &(100 * STROOP));
    cl.pause();
    // Withdrawal must still work.
    cl.withdraw(&s.alice, &(100 * STROOP));
}

#[test]
fn unpause_re_enables_deposits() {
    let s  = setup();
    let cl = client(&s.env, &s.contract);

    cl.pause();
    cl.unpause();
    cl.deposit(&s.alice, &(10 * STROOP)); // should not panic
}

// ─── multiple rounds ─────────────────────────────────────────────────────────

#[test]
fn multiple_rounds_accumulate_correctly() {
    let s  = setup();
    let cl = client(&s.env, &s.contract);

    cl.deposit(&s.alice, &(100 * STROOP));
    cl.fund_prize_pool(&s.admin, &(50 * STROOP));
    cl.execute_draw(&s.alice); // round 1

    cl.fund_prize_pool(&s.admin, &(80 * STROOP));
    cl.execute_draw(&s.bob); // round 2

    let r1 = cl.get_round_result(&1).unwrap();
    let r2 = cl.get_round_result(&2).unwrap();
    assert_eq!(r1.round, 1);
    assert_eq!(r2.round, 2);
    assert_eq!(r2.winner, s.bob);

    let st = cl.get_pool_state();
    assert_eq!(st.current_round, 3);
}
