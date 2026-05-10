# LuckyPool

**No-loss prize savings on Stellar. Deposit USDC, earn yield, win weekly.**

Every depositor earns real yield via Blend. Every week, all the yield goes to one winner. Your principal is never at risk — no loss, ever. One lucky depositor wins it all.

---

## What It Does

| Layer | Description |
|---|---|
| **Soroban Contract** | Accepts USDC deposits, tracks positions, manages prize pool, executes draws |
| **Blend Integration** | Routes deposited USDC into Blend lending pools for 6–8% APY |
| **Prize Draw** | Accumulated yield distributed weekly to one winner, weighted by deposit size |
| **Freighter Wallet** | Browser wallet connection via `@stellar/freighter-api` |
| **Next.js Frontend** | Landing page + dashboard for deposit, withdraw, and lottery tracking |

---

## The Problem

Savings products are boring. Lotteries are predatory. DeFi is intimidating.

- Traditional savings accounts in most markets pay under 2% APY in real terms
- Lotteries extract 50%+ of every dollar played — the worst financial product for ordinary people
- DeFi yield is real but complex, high-risk, and gas-expensive on most chains

**On Stellar, sub-cent fees make something new possible:** a savings product where the yield — not the principal — funds prizes. Depositors can't lose. Yield goes to one winner. Everyone else keeps everything and tries again next week.

This model already exists in the physical world. The UK's Premium Bonds product holds £125B from 24 million savers. No DeFi version exists on Stellar. LuckyPool is that.

---

## How It Works

```
User deposits USDC
        ↓
LuckyPool Soroban contract records position
Tickets allocated: 1 USDC = 1 ticket
        ↓
USDC routed to Blend lending pool
Earns 6–8% APY continuously
        ↓
harvest_yield() called each week (permissionless)
Yield moves from Blend → Prize Pool
        ↓
execute_draw() selects winner by VRF
Winner receives full prize pool minus 5% protocol fee
Everyone else: principal untouched, tickets reset for next round
```

---

## Repository Structure

```
LuckyPool/
├── README.md
├── contracts/               Soroban smart contracts (Rust)
│   ├── Cargo.toml           Workspace
│   ├── Makefile             Build / test / deploy helpers
│   ├── README.md            Contract-specific docs
│   └── lucky_pool/
│       └── src/
│           ├── lib.rs       Contract entry point
│           ├── storage.rs   Data types + storage helpers
│           ├── errors.rs    Typed contract errors
│           └── test.rs      17 unit tests
├── frontend/                Next.js application
│   ├── app/
│   │   ├── page.tsx         Landing page
│   │   └── dashboard/       User dashboard (deposit, yield, lottery, history)
│   ├── components/          UI components
│   └── lib/
│       └── wallet.ts        Freighter wallet helpers
├── x402-session-app/        x402 payment session demo (reference)
└── docs/                    Design and planning docs
    ├── architecture.md
    ├── smart-contracts.md
    ├── yield-integration.md
    ├── randomness.md
    ├── go-to-market.md
    ├── pitch.md
    └── plan.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart contracts | Rust + Soroban SDK 26, deployed on Stellar |
| Yield | Blend Protocol (lending pools on Stellar) |
| Randomness | VRF oracle (Stellar Oracle Shield / Acurast) |
| Wallet | Freighter (`@stellar/freighter-api ^6`) |
| Frontend | Next.js 16, Tailwind CSS 4, Framer Motion |
| Payments | x402 session payments (reference integration) |
| Network | Stellar Testnet → Mainnet |

---

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

Install [Freighter](https://freighter.app) browser extension to connect a wallet.

### Contracts

```bash
cd contracts

# Run unit tests (native — no WASM needed)
make test

# Build WASM (requires Stellar CLI)
cargo install --locked stellar-cli
make build

# Deploy to testnet
export SOURCE=alice ADMIN=G... USDC_ID=C... BLEND_ID=C... ORACLE_ID=C... FEE_BPS=500
make deploy && make initialize
```

See [`contracts/README.md`](contracts/README.md) for the full contract interface and deploy guide.

---

## Current Status

| Component | Status |
|---|---|
| Soroban contract — core flow | ✅ Built and tested (17/17 tests pass) |
| Typed events (`#[contractevent]`) | ✅ Implemented |
| Frontend landing page | ✅ Live |
| Dashboard (deposit / withdraw / lottery) | ✅ UI complete, mocked data |
| Freighter wallet integration | ✅ Connect / disconnect wired |
| Blend yield integration | 🔧 Stubbed — cross-contract calls next |
| VRF oracle integration | 🔧 Stubbed — admin draw until VRF is wired |
| Testnet deployment | 📋 Pending |
| Security audit | 📋 Pre-mainnet |

---

## Docs

| Document | What's in it |
|---|---|
| [`docs/architecture.md`](docs/architecture.md) | System design, data model, contract interaction flow |
| [`docs/smart-contracts.md`](docs/smart-contracts.md) | Contract interface, build, deploy, events |
| [`docs/yield-integration.md`](docs/yield-integration.md) | Blend integration — how yield is generated and harvested |
| [`docs/randomness.md`](docs/randomness.md) | VRF design, winner selection algorithm, manipulation resistance |
| [`docs/plan.md`](docs/plan.md) | Phases, milestones, risks |
| [`docs/go-to-market.md`](docs/go-to-market.md) | Partners, launch sequence, growth flywheel |
| [`docs/pitch.md`](docs/pitch.md) | Investor pitch deck |
