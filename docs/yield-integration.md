# Yield Integration — Blend on Stellar

## What is Blend?

Blend is a permissionless lending protocol native to Stellar. Suppliers deposit assets into pools and earn interest from borrowers. Rates are determined algorithmically based on pool utilisation. LuckyPool uses Blend as its sole yield source — user USDC is deposited into Blend, earns interest, and that interest funds the weekly prize pool.

Blend docs: https://docs.blend.capital

---

## Why Blend?

| Property | Why it matters for LuckyPool |
|---|---|
| Already live on Stellar | No infrastructure to build or trust |
| USDC pool with real liquidity | Stable yield in a stable asset |
| Permissionless supply | No whitelist or approval needed |
| 6–8% APY historically | Meaningful prizes even at moderate TVL |
| Open-source, audited | Reduces security risk in the integration layer |

---

## How the Integration Works

### On `deposit(user, amount)`

```rust
// 1. Pull USDC from user into the LuckyPool contract
let token = token::Client::new(&env, &state.usdc);
token.transfer(&user, &env.current_contract_address(), &amount);

// 2. [v0.2] Approve Blend to spend our USDC
token.approve(
    &env.current_contract_address(),
    &state.blend_pool,
    &amount,
    &(env.ledger().sequence() + 1000),
);

// 3. [v0.2] Supply to Blend — receive bTokens (yield-bearing receipt tokens)
let blend = blend_pool::Client::new(&env, &state.blend_pool);
blend.supply(&env.current_contract_address(), &state.usdc, &amount);

// 4. Record user position (always)
// tickets = amount / STROOP  →  1 USDC = 1 ticket
```

In v0.1, steps 2–3 are stubbed with a `// TODO` comment. USDC sits in the contract until Blend is wired.

### On `harvest_yield()` (weekly, permissionless)

```rust
// 1. [v0.2] Ask Blend how many bTokens we hold and their current value
let blend = blend_pool::Client::new(&env, &state.blend_pool);
let b_token_balance = blend.b_token_balance(&env.current_contract_address(), &state.usdc);
let total_value = blend.b_tokens_to_underlying(&b_token_balance, &state.usdc);

// 2. [v0.2] The difference between total_value and total_deposits is yield
let yield_amount = total_value - state.total_deposits;

// 3. [v0.2] Withdraw only the yield from Blend — principal stays earning
blend.withdraw(&env.current_contract_address(), &state.usdc, &yield_amount);

// 4. Credit to prize pool
state.prize_pool += yield_amount;
write_pool_state(&env, &state);
```

**Key design:** only yield is harvested each week, not principal. This means user funds compound fully inside Blend between draws.

### On `withdraw(user, amount)`

```rust
// 1. Verify user has sufficient balance (always done)
if pos.principal < amount { panic }

// 2. [v0.2] Redeem exact principal from Blend
let blend = blend_pool::Client::new(&env, &state.blend_pool);
blend.withdraw(&env.current_contract_address(), &state.usdc, &amount);

// 3. Return USDC to user (always done)
let token = token::Client::new(&env, &state.usdc);
token.transfer(&env.current_contract_address(), &user, &amount);
```

Blend redeems the exact amount requested. If Blend's pool is temporarily illiquid (high utilisation), the withdrawal may fail — handled as an edge case below.

---

## Prize Pool Economics

At different TVL levels with 6% APY:

| Total Deposits | Annual Yield | Weekly Prize |
|---|---|---|
| $10,000 | $600 | ~$11.50 |
| $100,000 | $6,000 | ~$115 |
| $1,000,000 | $60,000 | ~$1,150 |
| $10,000,000 | $600,000 | ~$11,540 |
| $100,000,000 | $6,000,000 | ~$115,385 |

A $10,000 weekly prize is a press moment. A $100,000 weekly prize is viral.

Protocol fee of 5% is deducted from each prize before payment to the winner:

```
prize_paid = prize_pool × (1 - fee_bps / 10_000)
           = prize_pool × 0.95   (at 500 bps)
```

---

## Blend Interface (v0.2 Target)

The LuckyPool contract will import Blend's published contract interface. Key functions:

```rust
// Supply USDC to Blend pool, receive bTokens
fn supply(from: Address, asset: Address, amount: i128) -> i128

// Withdraw underlying asset by burning bTokens
fn withdraw(from: Address, asset: Address, amount: i128) -> i128

// Read current bToken balance for a supplier
fn b_token_balance(supplier: Address, asset: Address) -> i128

// Convert bToken balance to current underlying value (includes accrued interest)
fn b_tokens_to_underlying(b_tokens: i128, asset: Address) -> i128
```

Blend's contract ABI is available in their [GitHub repo](https://github.com/blend-capital/blend-contracts).

---

## Edge Cases

| Scenario | Handling |
|---|---|
| Blend APY = 0% | `prize_pool` stays 0; draw is skipped until yield accumulates |
| Blend pool at 100% utilisation | `withdraw` may revert; contract retries next block or queues withdrawal |
| Blend is paused or exploited | Emergency `withdraw_all_from_blend()` function (admin-only) returns USDC directly to contract; users can then withdraw principal normally |
| User withdraws mid-round | Tickets removed immediately; no eligibility for current round |
| Partial withdrawal | Remaining USDC stays in Blend, keeps generating yield; tickets reduced proportionally |
| Protocol fee set to 0 | 100% of prize goes to winner; valid configuration |

---

## Testnet Setup

Blend is live on Stellar testnet. To run the full yield cycle end-to-end:

```bash
# 1. Fund a test account
stellar keys generate alice --network testnet
curl "https://friendbot.stellar.org/?addr=$(stellar keys address alice)"

# 2. Get testnet USDC
# Testnet USDC SAC: CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA
# Mint via the SAC admin or use the Stellar testnet faucet

# 3. Deploy LuckyPool with Blend testnet pool address
export BLEND_ID=C...  # from Blend testnet docs
make deploy && make initialize

# 4. Deposit
stellar contract invoke --id $CONTRACT_ID \
  -- deposit --user $(stellar keys address alice) --amount 10000000

# 5. Wait for yield to accrue (or fast-forward by funding prize pool manually)
stellar contract invoke --id $CONTRACT_ID \
  -- fund_prize_pool --from $(stellar keys address alice) --amount 50000000

# 6. Harvest and draw
stellar contract invoke --id $CONTRACT_ID -- harvest_yield
stellar contract invoke --id $CONTRACT_ID \
  -- execute_draw --winner $(stellar keys address alice)
```

---

## USDC Contract Addresses

| Network | USDC SAC Address |
|---|---|
| Testnet | `CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA` |
| Mainnet | `CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75` |
