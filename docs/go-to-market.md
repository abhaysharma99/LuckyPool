# Go-to-Market — LuckyPool

## Strategy

LuckyPool does not acquire users through ads. It embeds into apps where users already save, receive remittances, or get paid — and makes prize savings the obvious upgrade.

The core GTM motion: **find the moment a user receives money and offer them a better place to keep it.**

---

## Distribution Channels

### 1. Partner Integrations (Primary)

Each integration is a distribution deal. LuckyPool handles yield, randomness, and draws. The partner handles the user relationship and surfaces the product.

| Partner | User base | Integration mechanic | Revenue share |
|---|---|---|---|
| **Sava** | Stellar savings app users | "Boost your savings with LuckyPool" CTA | 20% of protocol fee per referred user |
| **SeevCash / Fiatsend** | Remittance recipients in Africa, LATAM | "Instead of cashing out, save in LuckyPool" prompt post-receive | 20% of protocol fee |
| **Blockroll** | Payroll recipients on Stellar | "Save X% of each paycheck automatically" | 20% of protocol fee |
| **AQUA / StellarX** | DeFi power users | Yield comparison — LuckyPool USDC pool alongside regular pools | Revenue share TBD |

**Why partners work:**
- They already have KYC'd, active users
- LuckyPool adds an exciting product to their suite
- Revenue share creates alignment — partners earn more as more users deposit
- Integration is lightweight — a single API call or SDK import

### 2. Community / Organic (Secondary)

Winners are our best marketing. A $5,000 prize winner sharing on Twitter is more valuable than any ad. Tactics:

- **Weekly winner spotlight** — tweet the anonymous winner's initial + prize amount
- **Draw stream** — live countdown to draw, posted in Discord and Twitter
- **Leaderboard** — biggest depositors, longest streaks
- **Referral program** — deposit $50, give your referral link, earn 5% of their first deposit's yield

### 3. Stellar Ecosystem (Tertiary)

- SCF (Stellar Community Fund) grant for infrastructure tooling
- Meridian conference presence
- Stellar developer Discord and forums — regular technical updates
- Meridian demo day presentation

---

## Target Users

### Primary — Remittance Receivers in Emerging Markets

- Receive USDC via apps like SeevCash, Bitso, Yellow Card
- Currently cash out immediately or hold in volatile local currency
- LuckyPool offers: keep your USDC, earn 6%+ APY, chance to win weekly
- **Pain point addressed:** local bank savings rates are 0–3% real; LuckyPool beats that AND adds excitement

### Secondary — Crypto-Native DeFi Users

- Already using Blend, AQUA, or StellarX
- Looking for yield opportunities
- LuckyPool competes on: same yield as Blend + weekly prize upside
- **Pain point addressed:** DeFi yield is commoditised; the prize mechanic differentiates

### Tertiary — Traditional Savings Crossover

- Familiar with prize bonds (UK, India, Pakistan have cultural PLS precedent)
- Want savings products, not speculation
- **Pain point addressed:** fiat prize bonds pay near-zero real yield; LuckyPool uses real DeFi yield

---

## Launch Sequence

### Pre-launch (Month 4)

- [ ] Waitlist open at luckypool.xyz — target 500 signups before launch
- [ ] Testnet demo video: record a full deposit → draw → win cycle; post to Stellar forums
- [ ] Reach out to Sava and SeevCash teams for integration MOU
- [ ] Seed prize pool with $5,000 USDC from treasury for first 4 draws post-launch
- [ ] Security audit commissioned
- [ ] Legal review of PLS structure

### Launch Week (Month 5)

- [ ] Mainnet contract deployed
- [ ] Frontend live at luckypool.xyz
- [ ] First deposit open — waitlist users get early access 24h before public
- [ ] Press: Stellar community post, Twitter/X thread, SCF announcement
- [ ] Discord launch channel goes live; team in chat for 48h post-launch

### Week 2 Post-launch

- [ ] First weekly draw — document and post the winner moment (with consent)
- [ ] Sava integration goes live — push notification to Sava user base
- [ ] AMA on Stellar Discord

### Month 2 Post-launch

- [ ] SeevCash integration live
- [ ] Referral program launched
- [ ] DrawEngine SDK private beta with 3 protocol partners

---

## Growth Flywheel

```
Bigger prize pool
        ↑                         ↓
More depositors            More press / word of mouth
        ↑                         ↓
Partner integrations ──→ More deposits ──→ Bigger prize pool
        ↑
Lower fee from scale
(protocol reinvests in prize seeding)
```

The flywheel accelerates nonlinearly. A $1,000 weekly prize is a tweet. A $10,000 weekly prize is a news story. A $100,000 weekly prize writes itself.

---

## DrawEngine B2B

Separate from the consumer product, LuckyPool's draw mechanism is a reusable primitive.

**Target buyers:**
- DeFi protocols doing liquidity mining draws instead of linear emissions
- DAOs running contributor reward draws
- NFT projects doing whitelist raffles with on-chain proof
- GameFi platforms with weekly prize events

**Sales motion:**
1. Identify protocol → check if they're running any draw/raffle manually
2. Offer a paid pilot integration — flat $500 fee for setup + 1% of pool per draw
3. If they want self-serve: charge a monthly subscription ($200–$2,000/month based on draw frequency)

**Why they pay:**
- Building this themselves takes 2–4 weeks of a senior Rust/Soroban engineer
- The randomness security has to be right — delegating to an audited primitive reduces risk
- On-chain proof is a marketing claim ("our raffle is provably fair") — worth paying for

---

## Messaging by Audience

| Audience | Core message |
|---|---|
| Remittance receivers | "Your USDC earns 6% and might win you $1,000 this Friday. You keep your money either way." |
| DeFi users | "Same Blend yield. Plus a weekly prize draw. Zero additional risk." |
| Lottery players | "Keep your money AND have a chance to win. The lottery takes 50 cents of every dollar you play." |
| SCF delegates | "Proven model — UK Premium Bonds. Zero new infra. Real yield from live Blend pools. Partner pipeline ready." |
| B2B / protocols | "Plug-and-play draw primitive. Verifiable, audited, on-chain proof. Integrated in a day." |

---

## Competitive Positioning

| Product | Principal safe | Real yield | Sub-cent fees | B2B SDK | Verifiable draw |
|---|---|---|---|---|---|
| **LuckyPool** | ✅ | ✅ | ✅ Stellar | ✅ | ✅ VRF |
| PoolTogether | ✅ | ✅ | ❌ ETH gas | ❌ | ✅ |
| UK Premium Bonds | ✅ | Low (4%) | N/A | ❌ | Partial |
| Regular lottery | ❌ | ❌ | N/A | ❌ | Partial |
| Blend (pure yield) | ✅ | ✅ | ✅ | ❌ | N/A |

**Key moat:** No competitor offers both a consumer PLS product AND a B2B draw SDK. Stellar's fee structure makes $5 micro-deposits viable — impossible on Ethereum at any meaningful scale. Compliance-friendly PLS structure opens regulated markets that gambling-adjacent products can't access.

---

## KPIs

| Metric | Day 30 | Day 90 | Day 180 |
|---|---|---|---|
| Total USDC deposited | $100K | $500K | $1M |
| Weekly unique active depositors | 200 | 1,000 | 3,000 |
| Weekly prize paid | $100+ | $500+ | $1,000+ |
| Partner integrations live | 1 | 2 | 3 |
| DrawEngine B2B pilots | 0 | 2 | 5 |
| Winner retention rate | — | — | >75% stay after winning |
| Waitlist → depositor conversion | — | >40% | — |
