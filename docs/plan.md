# Project Plan — LuckyPool

## What We're Building

A prize-linked savings protocol on Stellar. Users deposit USDC, yield is generated via Blend, and that yield funds a weekly prize draw. Principal is always withdrawable. One winner per week selected via verifiable on-chain randomness.

Two products from one protocol:
- **Consumer layer** — prize-linked savings for individuals
- **Infrastructure layer** — DrawEngine SDK for protocols to build draws on top

---

## Current State (June 2026)

| Component | Status |
|---|---|
| Soroban contract (core) | ✅ Written, 17 unit tests passing |
| Typed events (`#[contractevent]`) | ✅ Implemented |
| Frontend landing page | ✅ Live locally |
| Dashboard UI (all tabs) | ✅ Complete with mocked data |
| Freighter wallet integration | ✅ Connect / disconnect working |
| x402 payment session reference | ✅ Slot machine demo in `x402-session-app/` |
| Blend integration | 🔧 Stubbed — `// TODO` comments in `deposit` and `harvest_yield` |
| VRF oracle integration | 🔧 Stubbed — admin manually picks winner |
| Testnet deployment | 📋 Pending Stellar CLI setup |
| Security audit | 📋 Pre-mainnet |

---

## Phases

### Phase 1 — Testnet MVP (Month 1–2)

**Contracts**
- [x] Soroban contract: deposit USDC, track balances, withdraw
- [x] Prize pool accumulation via `fund_prize_pool`
- [x] Admin draw flow with winner payout
- [x] Typed events, error codes, unit tests
- [ ] Deploy to Stellar testnet
- [ ] Integration test: deposit → fund → draw → payout cycle on testnet

**Frontend**
- [x] Landing page with hero, stats, FAQ, how-it-works
- [x] Dashboard: overview, yield, lottery, history, settings tabs
- [x] Freighter wallet connect / disconnect
- [ ] Wire dashboard to live testnet contract (replace mocked data)
- [ ] Real-time prize pool and ticket count from on-chain state

### Phase 2 — Blend + VRF (Month 2–4)

**Blend integration**
- [ ] Research Blend v2 contract ABI and testnet pool addresses
- [ ] Implement `blend_client::supply()` in `deposit()`
- [ ] Implement `blend_client::withdraw()` in `withdraw()`
- [ ] Implement `harvest_yield()` — query bToken balance, withdraw yield only
- [ ] End-to-end test: real yield accruing and harvested to prize pool

**VRF integration**
- [ ] Evaluate Stellar Oracle Shield vs Acurast for testnet
- [ ] Implement `request_draw()` — sends VRF request to oracle
- [ ] Update `execute_draw()` to accept `vrf_output + vrf_proof`
- [ ] On-chain proof verification before winner computation
- [ ] Test: full draw cycle with verified randomness

### Phase 3 — Mainnet Prep (Month 4–5)

- [ ] Security audit — full contract audit by reputable auditor
- [ ] Audit remediation and re-audit if needed
- [ ] Frontend polish and performance optimisation
- [ ] DrawEngine SDK — extract draw primitive as standalone package
- [ ] First partner integration (Sava or SeevCash) agreed
- [ ] Legal review — confirm PLS structure is compliant in target markets
- [ ] Seed prize pool with $5,000 USDC from treasury for first 4 draws

### Phase 4 — Mainnet Launch (Month 5–6)

- [ ] Mainnet contract deployed and initialized
- [ ] Frontend live at luckypool.xyz
- [ ] First weekly draw with real USDC
- [ ] Sava integration live
- [ ] SCF grant application submitted
- [ ] Press: Stellar community post, Twitter thread, partner announcements

---

## Key Decisions

| Decision | Choice | Reason |
|---|---|---|
| Yield source | Blend | Already live on Stellar, audited, real liquidity |
| Deposit token | USDC | Stable, liquid, widest reach on Stellar |
| Randomness | VRF (Oracle Shield) | Verifiable, tamper-proof, on-chain proof |
| Contract language | Soroban (Rust) | Only option for Stellar smart contracts |
| SDK version | soroban-sdk 26 | Required for `#[contractevent]` typed events |
| Frontend | Next.js + Freighter | Fast iteration, ecosystem standard |
| Fee model | 5% of prize pool | Low enough to not deter depositors |
| Principal protection | Enforced in contract | Never configurable — core product promise |

---

## Risks and Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Blend yield drops to near-zero | Medium | Floor prize from protocol reserve; communicate to users in advance |
| Blend integration bugs | Medium | Extensive testnet testing; two audits before mainnet |
| VRF oracle downtime | Low | Retry logic; fallback to delayed draw; eventually commit-reveal as emergency |
| Randomness manipulation | Low (with VRF) | On-chain proof verification; audit of selection algorithm |
| Regulatory classification as lottery | Medium | PLS structure — no consideration, no tickets purchased; legal review pre-launch |
| Low initial TVL → small prizes | High | Seed pool from treasury; partner referrals; waitlist pre-launch to drive day-1 deposits |
| Soroban ecosystem immaturity | Medium | Build minimal surface area; avoid complex cross-contract deps until stable |
| Competitor (PoolTogether migrates to Stellar) | Low | First-mover advantage + Stellar fee advantage + DrawEngine B2B moat |

---

## Success Metrics

| Milestone | Target |
|---|---|
| Testnet deployment | Month 2 |
| First real on-chain draw (testnet) | Month 3 |
| Blend integration live | Month 3 |
| VRF integration live | Month 4 |
| Audit complete | Month 4–5 |
| Mainnet launch | Month 5 |
| TVL at Day 30 | $100K |
| TVL at Day 90 | $500K |
| TVL at Day 180 | $1M |
| Partner integrations at Day 90 | 1 live |
| Partner integrations at Day 180 | 3 live |
