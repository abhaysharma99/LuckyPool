# LuckyPool — Investor Pitch

*Pre-seed · Built on Stellar · No token · Confidential*

---

## The Problem

**Saving is broken. Lotteries are predatory. Protocols lack primitives.**

**For consumers:**

- Traditional savings accounts pay near-zero real yield in most markets
- Lotteries extract 50%+ of every dollar played — the worst financial product for ordinary people, disproportionately affecting lower-income earners
- DeFi yield is real but opaque, risky, and gas-expensive — inaccessible to most

**For protocols and DAOs:**

- No plug-and-play on-chain draw or raffle primitive exists
- Running a verifiable, tamper-proof draw requires weeks of Soroban engineering
- NFT raffles, DAO grant draws, and liquidity mining events are rebuilt from scratch every time

**The gap:** A savings product people actually want to use — plus infrastructure protocols can build on.

---

## The Solution

**Two products. One protocol.**

### Consumer — Prize-Linked Savings

- Deposit USDC, earn 6.8% APY via Blend on Stellar
- Yield pools weekly and goes to one winner every Friday
- Principal is 100% protected — no loss, ever
- 1 USDC deposited = 1 lottery ticket; more savings = better odds

### B2B — DrawEngine

- General-purpose on-chain draw primitive, exposed as an SDK
- Any protocol can integrate verifiable random winner selection in under a day
- Bring your own pool, set ticket weights, trigger draws, receive on-chain VRF proof

**Core insight:** The same yield-pooling + random-selection mechanism powering our consumer product is a reusable primitive. Every protocol building a raffle or reward draw is a customer.

---

## How It Works

```
User deposits USDC via Freighter wallet on Stellar
        ↓
USDC routes into Blend lending pools — earns 6.8% APY daily
        ↓
Smart contract issues lottery tickets proportional to deposit
        ↓
Every Friday: accumulated yield → distributed to one winner via VRF
        ↓
Principal stays untouched — always 100% withdrawable instantly
```

---

## Market Opportunity

### Three overlapping, underserved markets

**Prize-Linked Savings — $800B+ AUM globally**
- The UK's Premium Bonds alone holds £125B from 24 million savers at near-zero real yield
- No DeFi-native PLS product exists with real yield at low fees
- Proven consumer demand across UK, India, Pakistan, Mexico, Brazil, Nigeria

**Global Lottery Market — $450B annually**
- Entire model is wealth extraction from lower-income earners
- No-loss alternative with real expected value competes on the same emotional appeal
- Lottery players are the most natural LuckyPool convert — they already accept that they might not win; now they keep their money

**DeFi Developer Tooling — $12B+ and growing**
- Every protocol building incentives, raffles, or draws is a potential DrawEngine customer
- PoolTogether proved the demand — reached $800M TVL at peak as a single product on Ethereum
- We add a B2B layer and Stellar's fee advantage for micro-deposits

**Why now:** Stellar's Soroban smart contract layer is mature enough to build on and early enough to lead.

---

## Competitive Landscape

|  | LuckyPool | PoolTogether | Traditional PLS | Regular Lottery |
|--|-----------|-------------|-----------------|-----------------|
| Principal safe | ✅ | ✅ | ✅ | ❌ |
| Real DeFi yield | ✅ | ✅ | Low | N/A |
| Sub-cent fees | ✅ Stellar | ❌ ETH gas | ❌ | ❌ |
| B2B Draw SDK | ✅ | ❌ | ❌ | ❌ |
| Verifiable draw | ✅ VRF | ✅ | ❌ | Partial |
| Micro-deposits ($5–$50) | ✅ | ❌ (gas) | Limited | N/A |

**Our moat:**
- First prize-linked savings protocol with a B2B draw SDK — no direct competitor owns both
- Stellar's fee structure makes micro-deposits economically viable — impossible on Ethereum
- Compliance-friendly PLS structure opens regulated markets (EU, LATAM, Africa) that gambling-adjacent products can't access

---

## Revenue Model

**Three streams, all scaling with usage**

### 1. Yield Spread (Consumer)

Blend pays the protocol ~6.8% APY on deposited USDC.
We pass 6.0% to depositors and keep 0.8%.

| TVL | Annual Revenue |
|---|---|
| $1M | $8,000 |
| $10M | $80,000 |
| $100M | $800,000 |

### 2. DrawEngine Fees (B2B)

- Per-draw fee: $50–$500 depending on pool size
- Percentage of pool per draw: 0.5–2%
- Monthly subscription for high-volume protocols: $500–$2,000/month

### 3. Premium Consumer Features (Future)

- Boosted ticket multipliers for power depositors
- Early access draws, multi-asset pools, referral bonuses

**Unit economics at $10M TVL + 10 B2B draws/month:**
- Yield spread: ~$80,000/year
- DrawEngine fees: ~$36,000/year
- **Total ARR: ~$116,000** — growing non-linearly as both sides scale

---

## Roadmap

### Q3 2026 — Launch

- Mainnet consumer PLS product on Stellar
- Blend integration live, weekly draws running
- First 3 B2B DrawEngine pilot partners onboarded

### Q4 2026 — Scale

- DrawEngine SDK public beta
- $1M TVL target
- DAO tooling and NFT platform integrations

### Q1 2027 — Expand

- Multi-asset pools (USDC, EURC, XLM)
- $5M TVL target
- Regulated market expansion — EU, LATAM

### Q2 2027 — Series A

- $10M TVL
- 25+ active B2B integrations
- Series A raise off proven dual-revenue model

---

## Current Traction

- Soroban smart contract written and tested (17/17 unit tests passing)
- Frontend complete — landing page, dashboard, Freighter wallet integration live
- x402 payment session integration prototyped
- 500+ waitlist signups pre-launch
- Partner conversations underway with Sava and SeevCash

---

## The Ask

**Pre-seed round**

**Raising:** $500K – $800K
**Structure:** SAFE at $4M pre-money cap · pro-rata rights in seed

**Use of funds:**

| Allocation | Amount | Purpose |
|---|---|---|
| Engineering | 40% | Soroban contracts, VRF, Blend integration, DrawEngine SDK |
| Security audits | 25% | Two full audits before mainnet |
| Growth & B2B | 20% | First 10 protocol partners, marketing, waitlist conversion |
| Operations | 15% | Legal, compliance, infrastructure |

**Target close:** August 2026

**What we're looking for in investors:**
- DeFi / Stellar ecosystem experience
- B2B SaaS or developer tooling background
- Fintech / regulatory network in EU or LATAM

---

*LuckyPool · luckypool.xyz · Pre-seed 2026*
