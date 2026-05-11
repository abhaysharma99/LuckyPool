# LuckyPool — Soroban Contracts

**No-loss prize savings on Stellar.**

Users deposit USDC. Deposits earn yield via Blend. Each week the yield is drawn as a prize — one depositor wins it all. Every depositor keeps their principal, no matter what.

---

## How It Works

```
User deposits USDC
        ↓
LuckyPool Contract  →  routes principal to Blend for yield
        ↓
Blend Protocol      →  earns 6–8 % APY on deposited USDC
        ↓
harvest_yield()     →  pulls accrued yield into prize pool (permissionless)
        ↓
execute_draw()      →  admin (→ VRF oracle in v2) selects winner
        ↓
Winner receives prize USDC · Everyone else: principal untouched
```

---

## Contract

| File | Description |
|---|---|
| `lucky_pool/src/lib.rs` | Contract entry point — all public functions |
| `lucky_pool/src/storage.rs` | Data types (`UserPosition`, `PoolState`, `RoundResult`) and read/write helpers |
| `lucky_pool/src/errors.rs` | Typed contract errors via `#[contracterror]` |
| `lucky_pool/src/test.rs` | 17 unit tests covering all flows |

---

## Public Interface

### User actions

| Function | Auth | Description |
|---|---|---|
| `deposit(user, amount)` | user | Transfer USDC in, earn 1 ticket per USDC |
| `withdraw(user, amount)` | user | Return principal — always open, even when paused |

### Protocol actions (permissionless)

| Function | Auth | Description |
|---|---|---|
| `harvest_yield()` | anyone | Pull accrued yield from Blend into prize pool |
| `fund_prize_pool(from, amount)` | from | Sponsor top-up or manual test funding |

### Draw

| Function | Auth | Description |
|---|---|---|
| `execute_draw(winner)` | admin | Pay winner minus fee, advance round. Will be VRF-backed in v2 |

### Admin

| Function | Auth | Description |
|---|---|---|
| `initialize(admin, usdc, blend_pool, oracle, fee_bps)` | admin | One-time setup — fee capped at 10 % in code |
| `pause()` / `unpause()` | admin | Block new deposits; withdrawals always remain open |
| `set_admin(new_admin)` | old + new admin | Two-party key rotation |

### Views (no auth)

`get_position(user)` · `get_pool_state()` · `get_round_result(round)`

---

## Data Model

```rust
struct UserPosition {
    principal:   i128,  // USDC deposited in stroops (1 USDC = 10_000_000)
    tickets:     i128,  // = principal / STROOP; 1 USDC = 1 ticket
    round_joined: u64,
}

struct PoolState {
    admin:            Address,
    usdc:             Address,  // USDC SAC
    blend_pool:       Address,  // yield source — Blend lending pool
    oracle:           Address,  // VRF oracle — randomness for draws
    total_deposits:   i128,
    prize_pool:       i128,     // accumulated yield ready to award
    current_round:    u64,
    last_draw_ledger: u32,
    protocol_fee_bps: u32,      // hardcoded max 1 000 (10 %) at init
    paused:           bool,
}

struct RoundResult {
    round:         u64,
    winner:        Address,
    prize:         i128,
    total_tickets: i128,
    draw_ledger:   u32,
}
```

Storage layout:

| Key | Type | Storage |
|---|---|---|
| `PoolState` | `PoolState` | Instance (cheap, per-call bump) |
| `Position(Address)` | `UserPosition` | Persistent (30-day TTL, auto-bumped) |
| `Round(u64)` | `RoundResult` | Persistent (30-day TTL) |
| `Depositors` | `Vec<Address>` | Instance (used for draw eligibility) |

---

## Events

All events are typed via `#[contractevent]` (soroban-sdk 26+).

| Event | Topics | Data |
|---|---|---|
| `Deposited` | `["LuckyPool", "deposit"]` | `{ user, amount, round }` |
| `Withdrawn` | `["LuckyPool", "withdraw"]` | `{ user, amount }` |
| `PrizeFunded` | `["LuckyPool", "fund"]` | `{ from, amount }` |
| `DrawCompleted` | `["LuckyPool", "draw"]` | `{ round, winner, prize }` |

---

## Prerequisites

```bash
# Rust (stable) + WASM target
rustup target add wasm32-unknown-unknown

# Stellar CLI (for build / deploy)
cargo install --locked stellar-cli
```

---

## Build & Test

```bash
cd contracts

# Run unit tests (native — no WASM required)
make test

# Build optimised WASM
make build      # uses: stellar contract build
make optimize   # further shrinks WASM with stellar contract optimize

# Lint
make fmt
make clippy
```

---

## Deploy (testnet)

```bash
# Set these before running make deploy / make initialize
export SOURCE=alice                        # stellar CLI identity
export ADMIN=G...                          # admin public key
export USDC_ID=CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA
export BLEND_ID=C...                       # Blend pool contract
export ORACLE_ID=C...                      # VRF oracle (placeholder for now)
export FEE_BPS=500                         # 5 %

make deploy       # prints CONTRACT_ID
export CONTRACT_ID=C...

make initialize   # calls initialize() on-chain
make state        # verifies PoolState was written
```

---

## Roadmap

| Version | What changes |
|---|---|
| **v0.1 (current)** | Core deposit / withdraw / draw flow. Admin specifies winner manually. Blend integration stubbed. |
| **v0.2** | Blend cross-contract calls wired — `deposit` routes to Blend, `harvest_yield` pulls real yield |
| **v0.3** | VRF oracle integration — `execute_draw` verifies a VRF proof on-chain before paying winner |
| **v1.0** | Audit complete, mainnet deploy |

---

## Security Notes

- Protocol fee is hardcoded at `initialize` time and **not upgradeable** — capped at 10 %.
- Withdrawals are always open — `pause()` only blocks new deposits.
- `harvest_yield` is permissionless — no admin can withhold yield from the pool.
- Soroban's execution model prevents reentrancy.
- `set_admin` requires both current and new admin to sign — prevents unilateral key rotation.
- Overflow is impossible — Soroban panics on `i128` overflow in checked arithmetic.
