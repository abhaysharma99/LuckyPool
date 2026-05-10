# Architecture — LuckyPool

## Overview

LuckyPool is a prize-linked savings protocol. Users deposit USDC into a single Soroban smart contract. The contract routes funds to Blend for yield. Each week the accumulated yield is drawn as a prize — one depositor wins it, everyone else keeps their principal intact.

There is no governance token, no lock-up period, and no concept of "losing" for depositors.

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        User (browser)                       │
│              Freighter wallet · @stellar/freighter-api      │
└──────────────────────────┬──────────────────────────────────┘
                           │  deposit / withdraw / view
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   LuckyPool Contract                        │
│                  (Soroban / Stellar)                        │
│                                                             │
│  deposit()    → records position, mints tickets             │
│  withdraw()   → returns principal, burns tickets            │
│  harvest_yield() → pulls yield from Blend → prize pool      │
│  execute_draw()  → pays winner, advances round              │
│                                                             │
│  Storage:                                                   │
│    Instance  → PoolState, Depositors list                   │
│    Persistent→ UserPosition(addr), RoundResult(round)       │
└──────┬───────────────────────────────────────┬──────────────┘
       │ supply / withdraw principal            │ VRF request / proof
       ▼                                        ▼
┌──────────────┐                    ┌───────────────────────┐
│ Blend Pool   │                    │  VRF Oracle            │
│ (lending)    │                    │  (Stellar Oracle       │
│              │                    │   Shield / Acurast)    │
│ Earns 6–8%   │                    │                        │
│ APY on USDC  │                    │  Publishes vrf_output  │
│              │                    │  + vrf_proof on-chain  │
└──────────────┘                    └───────────────────────┘
```

---

## Contract Components

### 1. Deposit / Withdraw

- `deposit(user, amount)` — transfers USDC from user to contract, allocates tickets (1 USDC = 1 ticket)
- `withdraw(user, amount)` — returns principal, proportionally removes tickets, always available
- Withdrawals remain open even during pause — the pause flag only blocks new deposits
- Tickets are non-transferable and reset when a user withdraws completely

### 2. Yield Routing (Blend Integration)

- On `deposit`: principal is forwarded to Blend's USDC lending pool
- Blend issues receipt tokens (bTokens) representing the depositor's share
- Yield accrues continuously in Blend; the contract's bToken balance grows over time
- On `harvest_yield()`: contract redeems bTokens, withdraws accumulated yield (not principal), adds to prize pool
- `harvest_yield` is **permissionless** — anyone can call it, preventing admin from withholding yield

### 3. Prize Draw

- `fund_prize_pool(from, amount)` — manual prize funding for testing / sponsor top-ups
- `execute_draw(winner)` — admin-specified winner for v0.1; replaced by VRF callback in v0.2
- Winner receives prize pool minus protocol fee (hardcoded at init, max 10%)
- Protocol fee is collected in-contract (not configurable post-deploy)
- After draw: `prize_pool → 0`, `current_round += 1`

### 4. Admin

- `initialize` — one-time setup, sets admin, USDC address, Blend pool, oracle, fee bps
- `pause` / `unpause` — emergency pause of new deposits only
- `set_admin` — two-party key rotation (both old and new admin must sign)

---

## Data Model

```rust
// Per-user: persistent storage, keyed by wallet address
struct UserPosition {
    principal:    i128,  // USDC deposited in stroops (7 decimals)
                         // 1 USDC = 10_000_000 stroops
    tickets:      i128,  // = principal / 10_000_000; 1 USDC = 1 ticket
    round_joined: u64,   // round number when first deposited
}

// Global: instance storage (one per contract)
struct PoolState {
    admin:             Address,
    usdc:              Address,  // USDC SAC contract address
    blend_pool:        Address,  // Blend lending pool
    oracle:            Address,  // VRF oracle
    total_deposits:    i128,     // sum of all principals
    prize_pool:        i128,     // yield accumulated for current draw
    current_round:     u64,      // increments after each draw
    last_draw_ledger:  u32,
    protocol_fee_bps:  u32,      // e.g. 500 = 5%; max 1000 at init
    paused:            bool,
}

// Per-round: persistent storage, keyed by round number
struct RoundResult {
    round:         u64,
    winner:        Address,
    prize:         i128,
    total_tickets: i128,
    draw_ledger:   u32,
}
```

---

## Storage Layout

| Key | Value type | Storage tier | TTL policy |
|---|---|---|---|
| `PoolState` | `PoolState` | Instance | Bumped on every write |
| `Depositors` | `Vec<Address>` | Instance | Bumped on every write |
| `Position(Address)` | `UserPosition` | Persistent | 30-day TTL, auto-bumped on read/write |
| `Round(u64)` | `RoundResult` | Persistent | 30-day TTL, written once per draw |

**Why Instance for PoolState and Depositors?**
These are read on every contract call. Instance storage has lower per-read cost. The Depositors list could grow large for very popular pools — a future version should move to a trie or off-chain index.

**Why Persistent for positions?**
User positions must survive across sessions without the user calling the contract to keep them alive. Persistent storage allows 30-day TTLs that auto-extend on access.

---

## Ticket Weighting

Tickets are proportional to deposit size. The probability of winning for a depositor is:

```
P(win) = user_tickets / total_tickets
       = user_deposit_in_USDC / total_deposits_in_USDC
```

Example: if Alice deposits 500 USDC and the total pool is 10,000 USDC, Alice holds 5% of all tickets and has a 5% chance of winning each draw.

---

## Weekly Draw Flow

```
Friday midnight UTC
        │
        ▼
1. harvest_yield()        ← anyone calls; pulls yield from Blend → prize_pool
        │
        ▼
2. VRF request sent       ← contract calls oracle contract (v0.2+)
        │
        ▼
3. Oracle posts proof     ← 1–2 min; vrf_output + vrf_proof written on-chain
        │
        ▼
4. execute_draw()         ← anyone calls; contract verifies proof, computes winner
        │
        ├── winning_ticket = vrf_output % total_tickets
        ├── walks depositor list to find ticket holder
        ├── transfers prize (minus fee) to winner
        ├── emits DrawCompleted event
        └── round += 1, prize_pool = 0
```

---

## Events

All events use Soroban's `#[contractevent]` typed macro (SDK 26+).

| Event | Topics | Data fields |
|---|---|---|
| `Deposited` | `["LuckyPool", "deposit"]` | `user`, `amount`, `round` |
| `Withdrawn` | `["LuckyPool", "withdraw"]` | `user`, `amount` |
| `PrizeFunded` | `["LuckyPool", "fund"]` | `from`, `amount` |
| `DrawCompleted` | `["LuckyPool", "draw"]` | `round`, `winner`, `prize` |

Events are indexed by Stellar Horizon and can be consumed by any frontend via `GET /accounts/{address}/effects` or the events stream.

---

## Security Design

| Property | How it's enforced |
|---|---|
| Admin can't drain user principal | Principal only leaves via `withdraw()`, which requires the user's auth |
| Fee is not upgradeable | `protocol_fee_bps` is written once at `initialize()` with a max of 1000 (10%) |
| Yield can't be withheld | `harvest_yield` is permissionless — anyone can call it |
| No reentrancy | Soroban's execution model has no re-entrancy by design |
| Withdrawals always work | `pause()` only blocks `deposit()`, never `withdraw()` |
| Admin rotation requires consent | `set_admin` requires both current and new admin to `require_auth()` |
| Overflow impossible | Soroban panics on `i128` arithmetic overflow |

---

## Roadmap

| Version | Key change |
|---|---|
| **v0.1** | Core deposit/withdraw/draw. Admin specifies winner manually. Prize pool funded manually for testing. |
| **v0.2** | Blend cross-contract calls — `deposit` forwards to Blend, `harvest_yield` pulls real yield |
| **v0.3** | VRF oracle — `execute_draw` verifies proof on-chain, winner derived from `vrf_output % total_tickets` |
| **v1.0** | Audit complete, mainnet deployment |
