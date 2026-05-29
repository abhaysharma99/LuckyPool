"use client";

import { motion } from "framer-motion";
import { useState, useCallback, useEffect } from "react";
import { Logo } from "../../components/ui/Logo";

const DISPLAY = { fontFamily: "var(--font-display)" } as const;
const HARD = "8px 8px 0 #15300c";
const HARD_SM = "5px 5px 0 #15300c";

const SECTIONS = [
  { id: "overview",    label: "Overview" },
  { id: "quickstart",  label: "Quickstart" },
  { id: "sdk",         label: "SDK Reference" },
  { id: "draw-types",  label: "Draw Types" },
  { id: "vrf",         label: "VRF & Fairness" },
  { id: "on-chain",    label: "On-chain Records" },
  { id: "contracts",   label: "Contracts" },
  { id: "errors",      label: "Error Codes" },
  { id: "events",      label: "Events" },
  { id: "faq",         label: "FAQ" },
];

/* ── Code block with copy + language label ── */
function CodeBlock({ code, lang = "ts" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div className="relative rounded-[16px] bg-[#0e2008] overflow-hidden" style={{ boxShadow: HARD_SM }}>
      <div className="flex items-center justify-between border-b border-[#CAFFB8]/10 px-5 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#CAFFB8]/40">{lang}</span>
        <button
          onClick={copy}
          title={copied ? "Copied!" : "Copy"}
          className="flex items-center gap-1.5 rounded-[6px] border border-[#CAFFB8]/30 bg-[#CAFFB8]/10 px-2.5 py-1 font-mono text-[10px] text-[#CAFFB8] transition-colors hover:bg-[#CAFFB8]/25"
        >
          {copied ? (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 6.5" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto px-5 py-4">
        <pre className="font-mono text-[13px] leading-[1.8] text-[#CAFFB8] whitespace-pre">{code}</pre>
      </div>
    </div>
  );
}

/* ── Section wrapper ── */
function Section({ id, title, tag, children }: { id: string; title: string; tag?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 mb-20">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-7 w-1 rounded-full bg-[#3d7a29]" />
        <div>
          {tag && <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#3d7a29] mb-0.5">{tag}</div>}
          <h2 className="font-[800] leading-[1] tracking-[-0.02em] text-[#15300c]" style={{ ...DISPLAY, fontSize: "clamp(22px, 2.8vw, 32px)" }}>
            {title}
          </h2>
        </div>
      </div>
      {children}
    </section>
  );
}

/* ── Param row ── */
function Param({ name, type: t, desc }: { name: string; type: string; desc: string }) {
  return (
    <div className="grid grid-cols-[auto_auto_1fr] gap-x-4 gap-y-0.5 items-baseline py-3 border-b border-[#f0f0f0] last:border-0">
      <code className="font-mono text-[13px] font-[700] text-[#15300c]">{name}</code>
      <code className="font-mono text-[11px] rounded-full bg-[#C9B8FF]/40 px-2 py-0.5 text-[#3d7a29]">{t}</code>
      <span className="text-[13px] text-[#15300c]/60">{desc}</span>
    </div>
  );
}

/* ── Callout box ── */
function Callout({ type, children }: { type: "info" | "warning" | "tip"; children: React.ReactNode }) {
  const styles = {
    info:    { bg: "#EBF5E7", border: "#3d7a29", icon: "ℹ", label: "Note" },
    warning: { bg: "#FFF9E6", border: "#D4A017", icon: "⚠", label: "Warning" },
    tip:     { bg: "#F0EBFF", border: "#7A5AF8", icon: "✦", label: "Tip" },
  }[type];
  return (
    <div className="rounded-[14px] p-4 flex gap-3 mb-5" style={{ background: styles.bg, borderLeft: `3px solid ${styles.border}` }}>
      <span className="mt-0.5 text-[14px] shrink-0" style={{ color: styles.border }}>{styles.icon}</span>
      <div>
        <span className="font-mono text-[10px] font-[700] uppercase tracking-[0.16em] mr-2" style={{ color: styles.border }}>{styles.label}</span>
        <span className="text-[13px] leading-[1.6] text-[#15300c]/70">{children}</span>
      </div>
    </div>
  );
}

export default function DocsPage() {
  const [activeId, setActiveId] = useState("overview");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActiveId(e.target.id); });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#fafdf8", fontFamily: "var(--font-sans),system-ui,sans-serif", color: "#15300c" }}>

      {/* header */}
      <header className="sticky top-0 z-20 border-b border-[#CFE7BD] px-6 py-3.5 md:px-10" style={{ background: "#f7fcf2" }}>
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a href="/" style={{ textDecoration: "none" }}><Logo size={22} showText /></a>
            <span className="hidden text-[#CFE7BD] sm:block">/</span>
            <span className="hidden font-mono text-[12px] font-[600] text-[#3d7a29] sm:block">DrawEngine Docs</span>
          </div>
          <span className="rounded-full border border-[#15300c]/15 bg-white px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#15300c]/50">v1.0</span>
        </div>
      </header>

      {/* mobile section pills */}
      <div className="flex lg:hidden overflow-x-auto gap-2 px-4 py-3 border-b border-[#CFE7BD] bg-white">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`shrink-0 rounded-full px-4 py-1.5 font-mono text-[11px] font-[700] transition-all ${activeId === s.id ? "bg-[#15300c] text-[#f7fcf2]" : "border border-[#CFE7BD] text-[#15300c]"}`}
            style={{ textDecoration: "none" }}
          >
            {s.label}
          </a>
        ))}
      </div>

      <div className="mx-auto max-w-[1200px] px-6 py-12 md:px-10 lg:grid lg:grid-cols-[200px_1fr] lg:gap-16">

        {/* sidebar */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24 flex flex-col gap-0.5">
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-[#15300c]/35">On this page</div>
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[13px] font-[600] transition-all ${
                  activeId === s.id
                    ? "bg-[#CAFFB8] text-[#15300c]"
                    : "text-[#15300c]/50 hover:bg-[#15300c]/[0.05] hover:text-[#15300c]"
                }`}
                style={{ textDecoration: "none" }}
              >
                {activeId === s.id && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#3d7a29]" />}
                {s.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* main content */}
        <main>
          {/* hero */}
          <motion.div
            className="mb-16 rounded-[28px] p-8 md:p-10"
            style={{ background: "linear-gradient(135deg,#3d7a29 0%,#1c4513 100%)", boxShadow: HARD }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#CAFFB8]/30 bg-[#CAFFB8]/10 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-[#CAFFB8]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#CAFFB8]" />
              DrawEngine SDK · v1.0
            </div>
            <h1 className="mt-3 font-[800] uppercase leading-[0.9] tracking-[-0.03em] text-white" style={{ ...DISPLAY, fontSize: "clamp(36px, 5vw, 64px)" }}>
              Build with<br />DrawEngine.
            </h1>
            <p className="mt-5 max-w-[480px] text-[16px] leading-[1.6] text-white/65">
              Add provably fair, on-chain draws to your protocol in minutes. No VRF infrastructure, no ticketing logic — just one SDK and a Stellar wallet.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {["Provably fair VRF", "Any ticket weight", "On-chain records", "Stellar native"].map((t) => (
                <span key={t} className="rounded-full bg-[#CAFFB8]/15 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[#CAFFB8]">{t}</span>
              ))}
            </div>
          </motion.div>

          {/* Overview */}
          <Section id="overview" title="Overview" tag="What is DrawEngine">
            <p className="mb-6 text-[15px] leading-[1.7] text-[#15300c]/70">
              DrawEngine is the draw primitive powering LuckyPool&apos;s weekly jackpot. It handles VRF randomness, ticket weighting, winner selection, and on-chain recording — so your team doesn&apos;t have to build any of that from scratch.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
              {[
                { label: "Provably fair", body: "VRF-backed randomness, verifiable by anyone on Stellar.", bg: "#CAFFB8" },
                { label: "Any weight model", body: "Equal odds, proportional tickets, tiered — configure it your way.", bg: "#FFE59E" },
                { label: "Instant recording", body: "Winner and proof written on-chain the moment the draw fires.", bg: "#C9B8FF" },
              ].map((c) => (
                <div key={c.label} className="rounded-[20px] p-5 flex flex-col gap-2" style={{ background: c.bg, boxShadow: HARD_SM }}>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#15300c]/60">{c.label}</div>
                  <p className="text-[13px] leading-[1.55] text-[#15300c]/80">{c.body}</p>
                </div>
              ))}
            </div>

            {/* Architecture diagram */}
            <div className="rounded-[20px] bg-white overflow-hidden" style={{ boxShadow: HARD_SM }}>
              <div className="border-b border-[#f0f0f0] px-6 py-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#15300c]/40">Architecture</span>
              </div>
              <div className="px-6 py-5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center text-[12px]">
                  {[
                    { label: "Your App", sub: "SDK call", bg: "#CAFFB8" },
                    { arrow: "→" },
                    { label: "DrawEngine", sub: "Soroban contract", bg: "#FFE59E" },
                    { arrow: "→" },
                    { label: "VRF Oracle", sub: "Randomness + proof", bg: "#C9B8FF" },
                    { arrow: "→" },
                    { label: "Stellar Ledger", sub: "Permanent record", bg: "#FF9E7A" },
                  ].map((item, i) =>
                    "arrow" in item ? (
                      <span key={i} className="text-[#15300c]/30 text-lg font-light sm:block hidden">→</span>
                    ) : (
                      <div key={i} className="rounded-[14px] px-4 py-3 flex flex-col gap-1 min-w-[100px]" style={{ background: item.bg, boxShadow: "3px 3px 0 #15300c" }}>
                        <span className="font-[700] text-[#15300c]">{item.label}</span>
                        <span className="text-[10px] text-[#15300c]/60 font-mono">{item.sub}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </Section>

          {/* Quickstart */}
          <Section id="quickstart" title="Quickstart" tag="Get started in 5 minutes">
            <Callout type="info">
              Make sure you have Node.js 18+ and a Freighter wallet installed before following this guide.
            </Callout>
            <div className="flex flex-col gap-6">
              {[
                {
                  n: "01", label: "Install",
                  code: `npm install @luckypool/draw-engine`, lang: "bash",
                },
                {
                  n: "02", label: "Initialise a pool",
                  code: `import { DrawEngine } from "@luckypool/draw-engine";

const engine = new DrawEngine({
  network: "mainnet",          // "mainnet" | "testnet"
  contractId: "YOUR_CONTRACT", // your deployed DrawEngine contract
  signer: freighterSigner,     // any Stellar signer
});`, lang: "ts",
                },
                {
                  n: "03", label: "Add participants",
                  code: `await engine.addEntrants([
  { address: "GABC...1234", tickets: 100 },
  { address: "GXYZ...5678", tickets: 250 },
]);`, lang: "ts",
                },
                {
                  n: "04", label: "Trigger the draw",
                  code: `const result = await engine.draw();

console.log(result.winner);   // Stellar address of winner
console.log(result.vrfProof); // on-chain verifiable proof
console.log(result.txHash);   // Stellar transaction hash`, lang: "ts",
                },
              ].map((s) => (
                <div key={s.n} className="flex gap-4">
                  <div className="flex flex-col items-center gap-2 pt-0.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#15300c] font-mono text-[11px] font-[800] text-[#CAFFB8]" style={DISPLAY}>{s.n}</div>
                    <div className="w-px flex-1 bg-[#15300c]/10" />
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="mb-3 font-[700] text-[15px] text-[#15300c]">{s.label}</div>
                    <CodeBlock code={s.code} lang={s.lang} />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* SDK Reference */}
          <Section id="sdk" title="SDK Reference" tag="Methods">
            <div className="flex flex-col gap-5">
              {[
                {
                  name: "new DrawEngine(config)",
                  returns: "DrawEngine",
                  desc: "Creates a new DrawEngine instance connected to your contract.",
                  params: [
                    { name: "network", type: '"mainnet" | "testnet"', desc: "Stellar network to connect to." },
                    { name: "contractId", type: "string", desc: "Address of your deployed DrawEngine contract." },
                    { name: "signer", type: "StellarSigner", desc: "Wallet signer for submitting transactions." },
                  ],
                },
                {
                  name: "engine.addEntrants(entrants[])",
                  returns: "Promise<void>",
                  desc: "Register participants for the next draw. Overwrites existing entries for the same address.",
                  params: [
                    { name: "address", type: "string", desc: "Stellar address of the participant." },
                    { name: "tickets", type: "number", desc: "Weight / ticket count for this entrant. Must be > 0." },
                  ],
                },
                {
                  name: "engine.draw()",
                  returns: "Promise<DrawResult>",
                  desc: "Requests VRF randomness, selects a winner proportionally, and records the result on-chain.",
                  params: [],
                },
                {
                  name: "engine.getResult(txHash)",
                  returns: "Promise<DrawResult>",
                  desc: "Fetches a past draw result by Stellar transaction hash.",
                  params: [
                    { name: "txHash", type: "string", desc: "Stellar transaction hash from a previous draw." },
                  ],
                },
                {
                  name: "engine.getEntrants()",
                  returns: "Promise<Entrant[]>",
                  desc: "Returns the current list of registered entrants and their ticket counts.",
                  params: [],
                },
                {
                  name: "engine.clearEntrants()",
                  returns: "Promise<void>",
                  desc: "Removes all registered entrants. Typically called after a draw to reset for the next round.",
                  params: [],
                },
              ].map((m) => (
                <div key={m.name} className="rounded-[20px] bg-white overflow-hidden" style={{ boxShadow: HARD_SM }}>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f0f0f0] px-6 py-4">
                    <code className="font-mono text-[14px] font-[700] text-[#3d7a29]">{m.name}</code>
                    <span className="rounded-full bg-[#CAFFB8]/50 px-3 py-1 font-mono text-[11px] text-[#15300c]/70">→ {m.returns}</span>
                  </div>
                  <div className="px-6 py-4">
                    <p className="mb-4 text-[13px] text-[#15300c]/65">{m.desc}</p>
                    {m.params.length > 0 && (
                      <div className="flex flex-col">
                        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#15300c]/35">Parameters</div>
                        {m.params.map((p) => <Param key={p.name} name={p.name} type={p.type} desc={p.desc} />)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Draw Types */}
          <Section id="draw-types" title="Draw Types" tag="Weighting models">
            <p className="mb-6 text-[15px] leading-[1.7] text-[#15300c]/70">
              DrawEngine supports any weighting model. Pass ticket counts to control odds — or give everyone equal weight for a pure raffle.
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
              {[
                { label: "Equal odds", lang: "ts", code: `// Every entrant gets 1 ticket\n{ address: "G...", tickets: 1 }` },
                { label: "Proportional (deposit-based)", lang: "ts", code: `// Tickets = USDC deposited\n{ address: "G...", tickets: 500 }` },
                { label: "Tiered", lang: "ts", code: `// Custom tier weights\n{ address: "G...", tickets: 3 } // Gold\n{ address: "G...", tickets: 1 } // Bronze` },
                { label: "NFT raffle", lang: "ts", code: `// 1 ticket per NFT held\n{ address: "G...", tickets: nftCount }` },
              ].map((d) => (
                <div key={d.label} className="flex flex-col gap-3">
                  <div className="font-[700] text-[13px] text-[#15300c]">{d.label}</div>
                  <CodeBlock code={d.code} lang={d.lang} />
                </div>
              ))}
            </div>
            <Callout type="tip">
              LuckyPool itself uses proportional weighting — 1 USDC deposited = 1 ticket. This gives larger depositors better odds while keeping the system transparent and fair.
            </Callout>
          </Section>

          {/* VRF */}
          <Section id="vrf" title="VRF & Fairness" tag="How randomness works">
            <div className="rounded-[20px] bg-white p-6 mb-5" style={{ boxShadow: HARD_SM }}>
              <div className="flex flex-col gap-4 text-[15px] leading-[1.7] text-[#15300c]/70">
                <p>
                  Every draw uses a <strong className="text-[#15300c]">Verifiable Random Function (VRF)</strong> seeded from the Stellar ledger hash. The VRF proof is published on-chain alongside the draw result — anyone can independently verify the winner selection was fair and not manipulated.
                </p>
                <p>
                  DrawEngine uses Stellar&apos;s native randomness beacon. No external oracle dependency, no off-chain trust assumption, no admin key that could influence the outcome.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
              {[
                { label: "Seed source", body: "Stellar ledger hash — deterministic and tamper-proof.", bg: "#CAFFB8" },
                { label: "Proof on-chain", body: "VRF proof stored with every draw. Verify anytime.", bg: "#FFE59E" },
                { label: "No admin key", body: "No privileged actor can influence the draw outcome.", bg: "#FF9E7A" },
              ].map((c) => (
                <div key={c.label} className="rounded-[16px] p-4" style={{ background: c.bg, boxShadow: HARD_SM }}>
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#15300c]/60 mb-1.5">{c.label}</div>
                  <p className="text-[13px] leading-[1.5] text-[#15300c]/80">{c.body}</p>
                </div>
              ))}
            </div>
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#15300c]/40">Verification example</div>
            <CodeBlock lang="ts" code={`// Independent verification — no trust required
const proof = await engine.getResult(txHash);

// 1. Check VRF output is authentic
const valid = await oracle.verify(proof.vrfProof, proof.roundSeed, proof.vrfOutput);

// 2. Check winner arithmetic
const winningTicket = BigInt(proof.vrfOutput.slice(0, 8)) % proof.totalTickets;
assert(winningTicket === proof.winningTicket);

// 3. Check ticket maps to winner address
assert(proof.ticketOwner[winningTicket] === proof.winner);`} />
          </Section>

          {/* On-chain Records */}
          <Section id="on-chain" title="On-chain Records" tag="Querying past draws">
            <p className="mb-5 text-[15px] leading-[1.7] text-[#15300c]/70">
              Each draw writes a permanent record to the DrawEngine contract on Stellar containing the winner address, VRF proof, timestamp, and total entrant count.
            </p>
            <CodeBlock lang="ts" code={`const past = await engine.getResult("TX_HASH_HERE");

// past.winner         — winning Stellar address
// past.vrfProof       — verifiable proof bytes
// past.vrfOutput      — 32-byte random seed used
// past.winningTicket  — which ticket number won
// past.totalTickets   — total tickets in draw
// past.timestamp      — Unix timestamp of draw
// past.entrants       — total number of entrants
// past.prize          — USDC amount paid to winner (if LuckyPool draw)`} />
          </Section>

          {/* Contract Addresses */}
          <Section id="contracts" title="Contracts" tag="Deployed addresses">
            <Callout type="warning">
              Mainnet contracts are not yet deployed. The testnet addresses below are live for integration testing.
            </Callout>
            <div className="rounded-[20px] bg-white overflow-hidden mb-6" style={{ boxShadow: HARD_SM }}>
              <div className="border-b border-[#f0f0f0] px-6 py-3 flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-[#CAFFB8]" />
                <span className="font-mono text-[11px] font-[700] text-[#15300c]/60">Testnet</span>
              </div>
              <div className="flex flex-col divide-y divide-[#f0f0f0]">
                {[
                  { name: "DrawEngine", id: "CDRAW...TESTNET", note: "Core draw primitive" },
                  { name: "LuckyPool", id: "CLUCKY...TESTNET", note: "Prize-linked savings" },
                ].map((c) => (
                  <div key={c.name} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <div className="w-28 shrink-0">
                      <span className="font-mono text-[13px] font-[700] text-[#15300c]">{c.name}</span>
                    </div>
                    <code className="font-mono text-[12px] text-[#3d7a29] bg-[#CAFFB8]/20 rounded-[8px] px-3 py-1.5 flex-1">{c.id}</code>
                    <span className="text-[12px] text-[#15300c]/45">{c.note}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[20px] bg-white overflow-hidden" style={{ boxShadow: HARD_SM }}>
              <div className="border-b border-[#f0f0f0] px-6 py-3 flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-[#FF9E7A]" />
                <span className="font-mono text-[11px] font-[700] text-[#15300c]/60">Mainnet — coming Q3 2026</span>
              </div>
              <div className="px-6 py-8 text-center text-[13px] text-[#15300c]/35 font-mono">
                Pending security audit · Expected August 2026
              </div>
            </div>
          </Section>

          {/* Error Codes */}
          <Section id="errors" title="Error Codes" tag="Contract errors">
            <p className="mb-5 text-[15px] leading-[1.7] text-[#15300c]/70">
              DrawEngine and LuckyPool contracts return typed errors. Catch them via the SDK&apos;s <code className="font-mono text-[13px] bg-[#CAFFB8]/30 px-1.5 rounded">DrawEngineError</code> class.
            </p>
            <div className="rounded-[20px] bg-white overflow-hidden mb-6" style={{ boxShadow: HARD_SM }}>
              {[
                { code: "1", name: "AlreadyInitialized",  desc: "Contract has already been initialized." },
                { code: "2", name: "NotInitialized",      desc: "Contract must be initialized before use." },
                { code: "3", name: "Paused",              desc: "The pool is paused. Deposits and draws are blocked." },
                { code: "4", name: "Unauthorized",        desc: "Caller does not have permission for this action." },
                { code: "5", name: "InsufficientBalance", desc: "Withdrawal amount exceeds deposited balance." },
                { code: "6", name: "InsufficientPrize",   desc: "Prize pool is empty — fund it before running a draw." },
                { code: "7", name: "InvalidAmount",       desc: "Amount must be greater than zero." },
                { code: "8", name: "NoDepositors",        desc: "Draw cannot run with zero depositors." },
                { code: "9", name: "FeeTooHigh",          desc: "Protocol fee exceeds the maximum allowed (50%)." },
              ].map((e, i) => (
                <div key={e.code} className={`grid grid-cols-[36px_180px_1fr] gap-x-4 items-center px-6 py-3.5 ${i < 8 ? "border-b border-[#f0f0f0]" : ""}`}>
                  <span className="font-mono text-[11px] font-[800] rounded-full bg-[#FF9E7A]/30 text-center px-2 py-0.5 text-[#15300c]">{e.code}</span>
                  <code className="font-mono text-[12px] font-[700] text-[#3d7a29]">{e.name}</code>
                  <span className="text-[13px] text-[#15300c]/60">{e.desc}</span>
                </div>
              ))}
            </div>
            <CodeBlock lang="ts" code={`import { DrawEngineError } from "@luckypool/draw-engine";

try {
  await engine.draw();
} catch (err) {
  if (err instanceof DrawEngineError) {
    switch (err.code) {
      case 6: console.error("Prize pool is empty — fund it first"); break;
      case 8: console.error("No depositors registered for this draw"); break;
      default: console.error("Contract error:", err.code, err.name);
    }
  }
}`} />
          </Section>

          {/* Events */}
          <Section id="events" title="Events" tag="On-chain event log">
            <p className="mb-5 text-[15px] leading-[1.7] text-[#15300c]/70">
              All state-changing actions emit typed events on Stellar. Subscribe to them via the SDK or query Stellar Horizon directly.
            </p>
            <div className="rounded-[20px] bg-white overflow-hidden mb-6" style={{ boxShadow: HARD_SM }}>
              <div className="border-b border-[#f0f0f0] px-6 py-3 grid grid-cols-[160px_1fr] gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#15300c]/35">Event</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#15300c]/35">Fields</span>
              </div>
              {[
                { name: "Deposited",     fields: "user: Address, amount: i128, round: u64",           trigger: "On every deposit" },
                { name: "Withdrawn",     fields: "user: Address, amount: i128",                         trigger: "On every withdrawal" },
                { name: "PrizeFunded",   fields: "from: Address, amount: i128",                         trigger: "When admin seeds prize pool" },
                { name: "DrawCompleted", fields: "round: u64, winner: Address, prize: i128",            trigger: "At end of each draw" },
              ].map((e, i) => (
                <div key={e.name} className={`px-6 py-4 grid grid-cols-[160px_1fr] gap-4 items-start ${i < 3 ? "border-b border-[#f0f0f0]" : ""}`}>
                  <div>
                    <code className="font-mono text-[13px] font-[700] text-[#3d7a29]">{e.name}</code>
                    <div className="font-mono text-[10px] text-[#15300c]/35 mt-1">{e.trigger}</div>
                  </div>
                  <code className="font-mono text-[12px] text-[#15300c]/60 leading-[1.7]">{e.fields}</code>
                </div>
              ))}
            </div>
            <CodeBlock lang="ts" code={`// Subscribe to draw completions
engine.on("DrawCompleted", (event) => {
  console.log(\`Round \${event.round}: \${event.winner} won \${event.prize} USDC\`);
});

// Or query past events from Horizon
const events = await engine.getEvents({
  type: "DrawCompleted",
  fromLedger: 50000000,
});`} />
          </Section>

          {/* FAQ */}
          <Section id="faq" title="FAQ" tag="Common questions">
            <div className="flex flex-col gap-4">
              {[
                {
                  q: "Is the SDK open source?",
                  a: "Yes. The DrawEngine contract and SDK are open source under the MIT license. The LuckyPool consumer product is built on top of the same contract.",
                },
                {
                  q: "Do I need to deploy my own contract?",
                  a: "For production use, yes. You deploy a DrawEngine contract to Stellar and pass its address to the SDK. This gives you full ownership of your draw logic and entrant data.",
                },
                {
                  q: "How long does a draw take?",
                  a: "Typically 1–2 Stellar ledger confirmations (~5–10 seconds). The VRF oracle responds within one ledger and the draw result is written in the same transaction.",
                },
                {
                  q: "What happens if the VRF oracle is down?",
                  a: "The draw request sits pending until the oracle responds. DrawEngine has a timeout mechanism — if no VRF response arrives within 100 ledgers (~10 minutes), the round can be cancelled and re-requested.",
                },
                {
                  q: "Can I run draws with non-USDC tokens?",
                  a: "DrawEngine itself is token-agnostic — it only handles winner selection. The LuckyPool consumer product is USDC-only, but the SDK works with any Stellar asset for your own draw.",
                },
                {
                  q: "Is there a fee for using DrawEngine?",
                  a: "The SDK is free for open use. Production commercial integrations pay a per-draw fee (typically $50–$500 depending on pool size) or a monthly subscription. Contact us to discuss your use case.",
                },
              ].map((item, i) => (
                <details key={i} className="group rounded-[16px] bg-white overflow-hidden" style={{ boxShadow: HARD_SM }}>
                  <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-4 select-none list-none">
                    <span className="font-[700] text-[14px] text-[#15300c]">{item.q}</span>
                    <span className="shrink-0 rounded-full bg-[#CAFFB8] h-6 w-6 flex items-center justify-center font-mono text-[14px] font-[800] text-[#15300c] group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="px-6 pb-4 text-[14px] leading-[1.7] text-[#15300c]/65 border-t border-[#f0f0f0] pt-4">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </Section>

        </main>
      </div>
    </div>
  );
}
