# Project Plan — LuckyPool

## What We're Building

A prize-linked savings protocol on Stellar. Users deposit USDC, yield is generated via Blend, and that yield funds a weekly prize draw. Principal is always withdrawable. One winner per week selected via verifiable on-chain randomness.

Two products from one protocol:
- **Consumer layer** — prize-linked savings for individuals
- **Infrastructure layer** — DrawEngine SDK for protocols to build draws on top

---

## Current State (July 2026)

| Component | Status |
|---|---|
| Soroban contract (core) | ✅ Written, 20 unit tests passing |
| Typed events (`#[contractevent]`) | ✅ Implemented |
| Frontend landing page | ✅ Live locally, deposit form wired to wallet + contract |
| Dashboard UI (all tabs) | ✅ Wired to live contract reads; falls back gracefully when unconfigured |
| Freighter wallet integration | ✅ Connect / disconnect working |
| DrawEngine SDK | ✅ Real Soroban RPC wiring (`sdk/src/DrawEngine.ts`) |
| x402 payment session reference | ✅ Slot machine demo in `x402-session-app/` |
| Blend integration | ✅ `deposit`/`withdraw`/`harvest_yield` call the real Blend v2 interface (verified against blend-contracts-v2 source); untested against an actual deployed Blend pool |
| VRF oracle integration | 🔧 Scaffolding only — `request_draw`/`execute_draw` + weighted winner selection are real and tested, but proof verification is a TODO: no VRF provider with a verifiable on-chain interface has been confirmed (Oracle Shield doesn't appear to exist; Acurast's Soroban VRF interface isn't publicly documented) |
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

### Active Build — Step by Step (July 2026)

Working sequentially through four workstreams. Order matters: SDK RPC wiring
comes first because the frontend contract client reuses the same
build/sign/submit/poll pattern; Blend/VRF come last because they're the
deepest and most security-sensitive changes and shouldn't block UI progress.

| # | Step | Files | Status |
|---|---|---|---|
| 1 | Save this plan | `docs/plan.md` | ✅ |
| 2 | SDK: real Soroban RPC wiring in `DrawEngine` (`addEntrants`, `draw`, `getResult`) | `sdk/src/DrawEngine.ts`, `sdk/src/types.ts` | ✅ |
| 3 | Frontend: `lucky_pool` contract client (deposit/withdraw/get_position/get_pool_state/get_round_result/get_user_history) | `frontend/lib/luckyPool.ts` | ✅ |
| 4 | Frontend: wire live deposit/withdraw flow into UI, replace mocked stats | `frontend/components/DepositSection.tsx` (now mounted on landing page), `frontend/app/dashboard/page.tsx`, `frontend/lib/useLuckyPoolAccount.ts` | ✅ |
| 5 | Frontend: replace `WINNERS`/`TX_HISTORY` mocks with on-chain round results + events | `frontend/app/dashboard/page.tsx` | ✅ |
| 6 | Contract: Blend integration in `deposit`/`withdraw`/`harvest_yield` | `contracts/lucky_pool/src/blend.rs`, `contracts/lucky_pool/src/lib.rs` | ✅ |
| 7 | Contract: VRF-backed `execute_draw` (`request_draw`, weighted winner selection) | `contracts/lucky_pool/src/lib.rs` | ✅ scaffolding — proof verification still open, see below |

Notes on steps 2–5 (buildable now, no external dependency):
- Env-driven contract ID (`NEXT_PUBLIC_LUCKYPOOL_CONTRACT_ID`) — UI shows an
  explicit "not deployed yet" state instead of silently falling back to mocks
  when unset.
- SDK stays generic (works with any contract exposing the same shape) since
  it's meant to be extracted as a standalone package per Phase 3.
- All reads use `rpc.Server.simulateTransaction` (no signature required);
  writes (`deposit`, `withdraw`) build → simulate → sign via the injected
  wallet signer → submit → poll `getTransaction` until `SUCCESS`/`FAILED`.

Notes on steps 6–7:
- Step 6: pulled the real Blend v2 pool interface (`submit`/`submit_with_allowance`,
  `Request`/`RequestType`, `Positions`, `Reserve`/`b_rate`) directly from the
  `blend-capital/blend-contracts-v2` GitHub source and mirrored it locally in
  `blend.rs` (not a dependency on `blend-contract-sdk`, which pins soroban-sdk
  25.x against our 26.x). Uses non-collateralized `Supply`/`Withdraw` — never
  `SupplyCollateral`, since this product never borrows and shouldn't carry
  liquidation exposure. `deposit`/`withdraw`/`harvest_yield` are unit-tested
  against a mock Blend pool (`test_blend.rs`) but **not yet exercised against
  a real deployed Blend pool** — that's still an open risk before testnet
  deployment.
- Step 7: **"Stellar Oracle Shield" does not appear to be a real, documented
  product** — no repo, no docs, no mentions anywhere findable. Acurast is
  real but has no publicly documented, concrete Soroban VRF contract
  interface (function names, addresses, proof format) to verify against.
  Rather than fabricate a fake `oracle.verify(...)` call, `execute_draw` now
  takes `vrf_output`/`vrf_proof` and does real, tested weighted winner
  selection — but proof verification is an explicit TODO and the function
  stays admin-gated until a real provider is confirmed and verified the same
  way Blend was. Treat `vrf_output` as admin-supplied, not yet provably fair.
  **The "Randomness" choice in Key Decisions below needs to be revisited.**

### Phase 2 — Blend + VRF (Month 2–4)

**Blend integration**
- [x] Research Blend v2 contract ABI (pulled from blend-contracts-v2 source directly)
- [x] Implement `blend::PoolClient.submit_with_allowance()` supply path in `deposit()`
- [x] Implement the withdraw path in `withdraw()`
- [x] Implement `harvest_yield()` — reads b_rate-converted supply value, withdraws the delta only
- [ ] Confirm a real Blend testnet pool address for USDC and re-test against it (only a mock pool is tested so far)
- [ ] End-to-end test: real yield accruing and harvested to prize pool

**VRF integration**
- [ ] Evaluate Stellar Oracle Shield vs Acurast for testnet — Oracle Shield could not be
      found/verified as a real product; Acurast has no documented Soroban VRF interface either.
      **Needs a real decision with a verifiable contract to integrate against.**
- [x] Implement `request_draw()` — computes and emits the public `round_seed`
- [x] Update `execute_draw()` to accept `vrf_output + vrf_proof`
- [ ] On-chain proof verification before winner computation (currently a TODO — see Active Build notes above)
- [x] Weighted winner selection implemented and unit-tested (not yet "verified randomness" until proof verification lands)

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
| Randomness | VRF — provider **TBD, was Oracle Shield** | Verifiable, tamper-proof, on-chain proof. Oracle Shield could not be verified as a real product (July 2026) — this row needs a real decision before proof verification can be implemented. |
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
