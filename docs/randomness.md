# On-Chain Randomness — Fair Winner Selection

## The Problem

Smart contracts are deterministic. Every node executing the contract must arrive at the same result — which means you can't generate true randomness inside the contract itself.

A naive approach (using block hash, ledger sequence, or timestamp) is manipulable:
- A validator who is also a large depositor can see upcoming block data before it's finalised
- They can choose to withhold a block that wouldn't make them win
- This is the "miner/validator extractable value" (MEV) attack on lotteries

LuckyPool requires randomness that is:
- **Unpredictable** before the draw closes
- **Verifiable** after the draw — anyone can confirm the output is legitimate
- **Manipulation-resistant** — no one, including the team, can influence the winner

---

## Solution: Verifiable Random Function (VRF)

A VRF takes a private key and a public input (e.g. the round number) and produces:
1. A **random output** — unpredictable without the private key
2. A **cryptographic proof** — anyone can verify the output is correct given the public key

The contract receives both, verifies the proof on-chain, and uses the output as the random seed. The VRF operator cannot manipulate the output without invalidating the proof.

---

## VRF Options

### Option A — Stellar Oracle Shield (Recommended)

- Native to the Stellar ecosystem
- Provides VRF-as-a-service via oracle contract calls
- Proof is posted on-chain and verifiable inside the Soroban contract
- Low latency (~1–2 ledger confirmations, ~5–10 seconds)

Integration:
1. LuckyPool calls `oracle.request_vrf(round_seed)` on the Oracle Shield contract
2. Oracle Shield off-chain node generates VRF output + proof
3. Oracle posts both back to Stellar in a separate transaction
4. LuckyPool's `execute_draw()` reads the VRF response, verifies the proof, computes winner

### Option B — Acurast

- Decentralised compute network with Trusted Execution Environments (TEEs)
- Cross-chain VRF service with Stellar integration
- Higher decentralisation — no single oracle operator
- Slightly higher latency than Oracle Shield

### Option C — Commit-Reveal (Fallback — no external oracle needed)

A multi-party randomness scheme using depositors themselves as entropy sources:

1. **Commit phase** (round open): every depositor submits `hash(secret_number || address)` on-chain
2. **Reveal phase** (after draw deadline): every depositor reveals their secret
3. **Seed** = XOR of all revealed secrets → fed into winner selection

Downsides:
- **Last-revealer attack** — a depositor who will lose can refuse to reveal, preventing the draw. Mitigation: non-revealers forfeit a deposit, or the round is extended.
- Requires depositor participation — bad UX

This is a fallback only. VRF (Option A) is the production target.

---

## Winner Selection Algorithm

Once a random seed is available (from VRF output), the winner is selected proportionally to ticket count:

```rust
fn select_winner(env: &Env, vrf_output: &BytesN<32>) -> Address {
    let state = read_pool_state(env);
    let depositors = read_depositors(env);

    // Use first 8 bytes of VRF output as u64 seed
    let seed = u64::from_be_bytes(vrf_output.to_array()[0..8].try_into().unwrap());

    // Total tickets = total USDC deposited in USDC (not stroops)
    let total_tickets = state.total_deposits / STROOP;
    let winning_ticket = (seed % total_tickets as u64) as i128;

    // Walk depositors in deterministic insertion order
    // The winner is the depositor whose cumulative ticket range covers winning_ticket
    let mut cumulative: i128 = 0;
    for addr in depositors.iter() {
        let pos = read_position(env, &addr);
        cumulative += pos.tickets;
        if cumulative > winning_ticket {
            return addr;
        }
    }

    panic!("winner not found — should never happen if depositors list is consistent")
}
```

**Probability:** each depositor's chance equals their share of total tickets:

```
P(Alice wins) = alice_tickets / total_tickets
              = alice_USDC / total_USDC
```

1,000 USDC deposited gives 10× the chance of 100 USDC.

---

## Draw Flow with VRF (v0.2)

```
Friday midnight UTC
        │
        ▼
harvest_yield()          ← anyone calls; yield → prize_pool
        │
        ▼
request_draw()           ← anyone calls; emits VRF request to oracle
  └── contract writes:
       pending_round = current_round
       vrf_request_id = oracle.request(round_seed)
        │
        ▼
Oracle Shield responds   ← 1–2 ledgers (~5–10 seconds)
  └── posts vrf_output + vrf_proof on-chain
        │
        ▼
execute_draw(vrf_output, vrf_proof)   ← anyone calls
  └── contract verifies proof:
       assert oracle.verify(vrf_proof, vrf_output, round_seed)
  └── computes winner:
       winning_ticket = vrf_output[:8] as u64 % total_tickets
  └── walks depositor list → finds winner
  └── transfers prize_pool × (1 - fee_bps/10000) to winner
  └── emits DrawCompleted { round, winner, prize, vrf_output }
  └── round += 1, prize_pool = 0
```

---

## Verifiability

After every draw, the `DrawCompleted` event contains all data needed for independent verification:

```
DrawCompleted {
    round:      u64,      // which round was drawn
    winner:     Address,  // who won
    prize:      i128,     // how much they received
}
```

In v0.2+, the event will also include:
```
    vrf_output: BytesN<32>,  // the random number used
    vrf_proof:  Bytes,       // cryptographic proof it's valid
    winning_ticket: u64,     // vrf_output % total_tickets
    total_tickets:  u64,     // denominator
```

**Independent verification process:**
1. Fetch the VRF public key from the oracle contract
2. Verify: `oracle_pubkey.verify(vrf_proof, round_seed) == vrf_output` — confirms the output is authentic
3. Verify: `vrf_output[:8] as u64 % total_tickets == winning_ticket` — confirms the arithmetic
4. Verify: wallet holding ticket #`winning_ticket` == `winner` — confirms the correct depositor won

All of this is checkable by anyone with access to Stellar's ledger history.

---

## Why Not Block Hash?

Stellar validators produce blocks. A validator who holds a large LuckyPool position could:

1. See that the upcoming block hash would produce a losing ticket for them
2. Withhold that block (accept the slash risk) and wait for a block hash that makes them win

VRF eliminates this because:
- The random output is committed before the validator knows the block hash
- The proof ties the output to the oracle's private key, not to any block data
- No validator can predict or influence the VRF output

---

## Current Status (v0.1)

In v0.1, `execute_draw(winner)` takes the winner address as a parameter specified by the admin. This is intentionally a placeholder:

- It allows the full deposit → harvest → draw → payout flow to be tested end-to-end
- The admin is a trusted key during testnet phase
- VRF will replace this before any mainnet deployment

The contract is designed so replacing the admin-specified winner with a VRF-derived winner is a localised change to `execute_draw` — no other contract logic needs to change.
