# Smart Contracts — Soroban on Stellar

## Overview

LuckyPool is a single Soroban contract written in Rust. The contract manages deposits, tracks user positions, accumulates yield, and executes weekly draws. It is deployed on Stellar's native smart contract platform.

- **SDK:** `soroban-sdk 26` with `#[contractevent]` typed events
- **Language:** Rust (stable), compiled to WASM32
- **Network:** Stellar Testnet → Mainnet
- **Tests:** 17 unit tests, all passing

---

## Prerequisites

```bash
# Rust (stable)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# WASM build target — soroban-sdk 26 requires wasm32v1-none on Rust 1.84+,
# not wasm32-unknown-unknown
rustup target add wasm32v1-none

# Stellar CLI (build, optimize, deploy)
cargo install --locked stellar-cli

# Verify
stellar --version
rustc --version
```

---

## Contract Interface

### Initialization

```rust
fn initialize(
    env:              Env,
    admin:            Address,  // deployer / operator key
    usdc:             Address,  // USDC SAC contract address
    blend_pool:       Address,  // Blend lending pool (yield source)
    oracle:           Address,  // VRF oracle (randomness for draws)
    protocol_fee_bps: u32,      // fee at draw time; max 1000 (10%)
)
```

Must be called once after deploy. Panics if called a second time. Fee is hardcoded at init — not configurable post-deploy.

### User Actions

```rust
// Deposit USDC. Grants 1 lottery ticket per USDC.
// user must sign; token transfer is authorized through Soroban auth propagation.
fn deposit(env: Env, user: Address, amount: i128)

// Withdraw principal. Always available — even when contract is paused.
fn withdraw(env: Env, user: Address, amount: i128)
```

`amount` is in **stroops** (1 USDC = 10,000,000 stroops).

### Protocol Actions

```rust
// Pull accrued yield from Blend into prize pool.
// Permissionless — anyone can call. Prevents admin from withholding yield.
fn harvest_yield(env: Env)

// Add USDC to the prize pool directly.
// Used for sponsor top-ups and testing without Blend integration.
fn fund_prize_pool(env: Env, from: Address, amount: i128)
```

### Draw

```rust
// Execute draw and pay winner.
// Auth: admin must sign.
// v0.1: admin specifies winner directly.
// v0.2+: winner is derived from vrf_output verified on-chain.
fn execute_draw(env: Env, winner: Address)
```

### Admin

```rust
fn pause(env: Env)                          // block new deposits; auth: admin
fn unpause(env: Env)                        // re-enable deposits; auth: admin
fn set_admin(env: Env, new_admin: Address)  // two-party rotation; auth: old + new admin
```

### Views

```rust
fn get_position(env: Env, user: Address) -> UserPosition
fn get_pool_state(env: Env) -> PoolState
fn get_round_result(env: Env, round: u64) -> Option<RoundResult>
```

---

## Data Types

```rust
pub struct UserPosition {
    pub principal:    i128,  // USDC deposited in stroops
    pub tickets:      i128,  // = principal / 10_000_000
    pub round_joined: u64,
}

pub struct PoolState {
    pub admin:             Address,
    pub usdc:              Address,
    pub blend_pool:        Address,
    pub oracle:            Address,
    pub total_deposits:    i128,
    pub prize_pool:        i128,
    pub current_round:     u64,
    pub last_draw_ledger:  u32,
    pub protocol_fee_bps:  u32,
    pub paused:            bool,
}

pub struct RoundResult {
    pub round:         u64,
    pub winner:        Address,
    pub prize:         i128,
    pub total_tickets: i128,
    pub draw_ledger:   u32,
}
```

---

## Events

Typed events via `#[contractevent]` — queryable from Horizon's events stream.

| Event struct | Topics | Data |
|---|---|---|
| `Deposited` | `["LuckyPool", "deposit"]` | `{ user: Address, amount: i128, round: u64 }` |
| `Withdrawn` | `["LuckyPool", "withdraw"]` | `{ user: Address, amount: i128 }` |
| `PrizeFunded` | `["LuckyPool", "fund"]` | `{ from: Address, amount: i128 }` |
| `DrawCompleted` | `["LuckyPool", "draw"]` | `{ round: u64, winner: Address, prize: i128 }` |

Subscribe via Horizon:
```
GET /accounts/{contract_id}/effects
GET /ledgers/{seq}/effects
```

Or filter by topic prefix `LuckyPool` in the events stream.

---

## Error Codes

```rust
pub enum LuckyPoolError {
    AlreadyInitialized  = 1,
    NotInitialized      = 2,
    Paused              = 3,
    Unauthorized        = 4,
    InsufficientBalance = 5,
    InsufficientPrize   = 6,
    InvalidAmount       = 7,
    NoDepositors        = 8,
    FeeTooHigh          = 9,
}
```

Errors surface as `HostError: Error(Contract, #N)` in the Stellar CLI and as structured errors in the JS SDK.

---

## Build

```bash
cd contracts

# Unit tests (native, fast — no WASM)
make test
# or: cargo test

# Build WASM
make build
# equivalent: stellar contract build

# Build + optimize (shrinks WASM for cheaper deploy)
make optimize

# Lint
make fmt && make clippy
```

**Output:** `target/wasm32v1-none/release/lucky_pool.wasm` (~23KB unoptimized)

---

## Deploy to Testnet

### 1. Set up Stellar CLI identity

```bash
stellar keys generate alice --network testnet
stellar keys address alice
# Fund via Friendbot: https://friendbot.stellar.org/?addr=<address>
```

### 2. Set environment variables

```bash
export SOURCE=alice
export ADMIN=$(stellar keys address alice)
export NETWORK=testnet

# Testnet USDC SAC (Stellar Asset Contract for USDC)
export USDC_ID=CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA

# Blend testnet pool address (check Blend docs for current address)
export BLEND_ID=C...

# Oracle — use a placeholder address until VRF is wired
export ORACLE_ID=$(stellar keys address alice)

export FEE_BPS=500   # 5%
```

### 3. Deploy and initialize

```bash
make deploy
# Prints: CONTRACT_ID=C...
export CONTRACT_ID=C...

make initialize
# Calls initialize() on-chain

make state
# Reads and prints PoolState — verify setup
```

### 4. Test a deposit

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source-account alice \
  --network testnet \
  -- deposit \
  --user $(stellar keys address alice) \
  --amount 10000000    # 1 USDC
```

### 5. Fund prize pool and run a draw (testnet only)

```bash
# Add 5 USDC to prize pool
stellar contract invoke \
  --id $CONTRACT_ID \
  --source-account alice \
  --network testnet \
  -- fund_prize_pool \
  --from $(stellar keys address alice) \
  --amount 50000000    # 5 USDC

# Execute draw — admin picks winner manually for now
stellar contract invoke \
  --id $CONTRACT_ID \
  --source-account alice \
  --network testnet \
  -- execute_draw \
  --winner $(stellar keys address alice)
```

---

## Contract Addresses

| Network | Address |
|---|---|
| Testnet | TBD — deploy and fill in |
| Mainnet | TBD — post-audit |

---

## Soroban Auth Model

When a user calls `deposit(user, amount)`:

1. The user signs a transaction invoking `deposit` on the LuckyPool contract
2. Inside `deposit`, the contract calls `user.require_auth()` — verifying the user consented
3. The contract then calls `token::Client::transfer(&user, &contract, &amount)`
4. The token contract checks auth: because the user authorized the outer `deposit` invocation, Soroban's auth propagation covers the inner transfer automatically

**No separate token approval is needed** — unlike ERC-20's `approve` + `transferFrom` pattern, Soroban auth is flow-based.

---

## Testing

17 unit tests covering:

| Test category | Tests |
|---|---|
| Initialization | `initialise_stores_state`, `initialise_twice_panics` |
| Deposit | `deposit_updates_position_and_pool`, `deposit_moves_usdc_into_contract`, `second_deposit_accumulates`, `deposit_zero_panics`, `deposit_while_paused_panics` |
| Withdraw | `withdraw_returns_usdc_and_burns_tickets`, `full_withdraw_clears_position`, `withdraw_more_than_balance_panics` |
| Draw | `draw_pays_winner_minus_fee`, `round_result_is_persisted`, `draw_with_empty_prize_pool_panics`, `draw_with_no_depositors_panics` |
| Admin | `pause_blocks_deposits_not_withdrawals`, `unpause_re_enables_deposits` |
| Multi-round | `multiple_rounds_accumulate_correctly` |

All tests use `env.mock_all_auths()` and a real Stellar Asset Contract mock for USDC — no external dependencies required.

---

## Security Checklist

- [x] Admin cannot drain user principal — `withdraw()` requires user auth
- [x] Protocol fee hardcoded at init — not upgradeable post-deploy
- [x] Reentrancy impossible — Soroban execution model
- [x] Overflow checked — Soroban panics on `i128` overflow
- [x] Withdrawals always open — `pause()` never blocks `withdraw()`
- [x] Admin rotation requires both parties — `set_admin` uses double auth
- [x] `harvest_yield` permissionless — yield can't be withheld by admin
- [ ] VRF proof verified on-chain — pending v0.2
- [ ] Blend integration audited — pending v0.2
- [ ] Full security audit — pre-mainnet
