"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Logo } from "../../components/ui/Logo";
import { connectWallet, disconnectWallet, getWalletAddress } from "../../lib/wallet";

const DISPLAY = { fontFamily: "var(--font-display)" } as const;
const HARD = "8px 8px 0 #15300c";
const HARD_SM = "5px 5px 0 #15300c";

const DEPOSIT = 500;
const PRIZE_POOL = 12847;
const TICKETS = 500;

const WINNERS = [
  { name: "Amara K.", amount: 240, when: "2 days ago", tickets: 800 },
  { name: "David M.", amount: 95,  when: "1 week ago",  tickets: 300 },
  { name: "Priya S.", amount: 510, when: "2 weeks ago", tickets: 1200 },
  { name: "James O.", amount: 180, when: "3 weeks ago", tickets: 600 },
];

const YIELD_HISTORY = [
  { date: "Jun 13", earned: 0.48 },
  { date: "Jun 06", earned: 0.51 },
  { date: "May 30", earned: 0.46 },
  { date: "May 23", earned: 0.53 },
  { date: "May 16", earned: 0.49 },
  { date: "May 09", earned: 0.44 },
];

const TX_HISTORY = [
  { type: "Deposit", amount: "+$500.00", date: "Jun 1, 2026",  status: "Confirmed" },
  { type: "Yield",   amount: "+$0.65",   date: "Jun 13, 2026", status: "Accrued" },
  { type: "Yield",   amount: "+$0.51",   date: "Jun 6, 2026",  status: "Accrued" },
  { type: "Yield",   amount: "+$0.48",   date: "May 30, 2026", status: "Accrued" },
];

function useCounter(target: number, ms = 1800) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let n = 0;
    const steps = 50;
    const inc = target / steps;
    const t = setInterval(() => {
      n += inc;
      if (n >= target) { setV(target); clearInterval(t); }
      else setV(Math.floor(n));
    }, ms / steps);
    return () => clearInterval(t);
  }, [target, ms]);
  return v;
}

function Pulse() {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <motion.span
        className="absolute inline-flex h-full w-full rounded-full bg-[#3d7a29]"
        animate={{ scale: [1, 2.2, 1], opacity: [0.7, 0, 0.7] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3d7a29]" />
    </span>
  );
}

/* ─── STAT CARD ─── */
function StatCard({ label, value, sub, bg, accent = "#15300c", delay = 0 }: {
  label: string; value: string; sub?: string; bg: string; accent?: string; delay?: number;
}) {
  return (
    <motion.div
      className="rounded-[20px] p-5"
      style={{ background: bg, boxShadow: HARD_SM }}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: accent + "99" }}>{label}</div>
      <div className="mt-2 text-[28px] font-[800] leading-none tracking-[-0.02em]" style={{ ...DISPLAY, color: accent }}>{value}</div>
      {sub && <div className="mt-1.5 text-[12px]" style={{ color: accent + "80" }}>{sub}</div>}
    </motion.div>
  );
}

/* ─── OVERVIEW TAB ─── */
function OverviewTab({ setTab }: { setTab: (t: TabId) => void }) {
  const yld = useCounter(342, 2000);
  return (
    <div className="flex flex-col gap-6">
      {/* balance hero */}
      <motion.div
        className="rounded-[24px] p-8 text-[#f7fcf2]"
        style={{ background: "linear-gradient(135deg,#3d7a29 0%,#1c4513 100%)", boxShadow: HARD }}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#CAFFB8]">Your balance</div>
            <div className="mt-1 text-[52px] font-[800] leading-none tabular-nums" style={DISPLAY}>${DEPOSIT.toLocaleString()}.00</div>
            <div className="mt-1.5 font-mono text-[12px] text-[#cfe9c2]">USDC · principal always safe</div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2 rounded-full bg-[#CAFFB8] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#15300c]">
              <Pulse />
              Earning yield
            </div>
            <div className="text-right">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#CAFFB8]/70">All-time yield</div>
              <div className="text-[24px] font-[800] tabular-nums text-[#CAFFB8]" style={DISPLAY}>+${(yld / 100).toFixed(2)}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Deposited"   value="$500"    sub="your principal" bg="#CAFFB8" accent="#15300c" delay={0.05} />
        <StatCard label="Yield APY"   value="6.8%"    sub="via Blend"      bg="#C9B8FF" accent="#15300c" delay={0.10} />
        <StatCard label="Your Tickets" value="500"    sub="this week"      bg="#FFE59E" accent="#15300c" delay={0.15} />
        <StatCard label="Prize Pool"  value="$12,847" sub="current draw"   bg="#FF9E7A" accent="#15300c" delay={0.20} />
      </div>

      {/* quick nav */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[
          { title: "Yield Dashboard", sub: `+$${(yld/100).toFixed(2)} earned · 6.8% APY · +$0.09 today`, tab: "yield" as TabId },
          { title: "Weekly Lottery",  sub: "$12,847 prize pool · draw in 47h · 3.3% win odds",            tab: "lottery" as TabId },
        ].map((c) => (
          <motion.div
            key={c.tab}
            className="min-w-0 w-full overflow-hidden rounded-[20px] bg-white p-6 text-left cursor-pointer min-h-[140px] flex flex-col justify-between transition-transform hover:-translate-y-0.5"
            style={{ boxShadow: HARD }}
            onClick={() => setTab(c.tab)}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#3d7a29] min-w-0 overflow-hidden">{c.title}</div>
              <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15300c" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
            <div className="mt-3 text-[13px] leading-[1.5] text-[#15300c]/60" style={{ wordBreak: "break-word", overflowWrap: "break-word" }}>{c.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* deposit more CTA */}
      <motion.div
        className="rounded-[20px] bg-[#15300c] p-6"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#CAFFB8]">Increase Your Odds</div>
            <div className="mt-1 text-[15px] text-[#f7fcf2]/70">Deposit more USDC → more tickets → better chances</div>
          </div>
          <a href="/" className="shrink-0 rounded-full bg-[#CAFFB8] px-6 py-2.5 text-[13px] font-[700] text-[#15300c] transition-transform hover:-translate-y-0.5" style={{ textDecoration: "none" }}>
            Deposit More ↗
          </a>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── YIELD TAB ─── */
function YieldTab() {
  const earned = useCounter(342, 2000);
  const maxBar = Math.max(...YIELD_HISTORY.map((r) => r.earned));
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
        {/* deposit card */}
        <motion.div
          className="rounded-[24px] bg-[#CAFFB8] p-7"
          style={{ boxShadow: HARD }}
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-start justify-between">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#15300c]/70">Total Deposited</div>
            <span className="rounded-full bg-[#15300c] px-3 py-1 font-mono text-[10px] text-[#f7fcf2] uppercase tracking-[0.1em]">USDC</span>
          </div>
          <div className="mt-2 text-[44px] font-[800] leading-none text-[#15300c]" style={DISPLAY}>${DEPOSIT.toLocaleString()}.00</div>
          <div className="mt-2 flex items-center gap-2 text-[13px] font-[600] text-[#3d7a29]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3d7a29]" /> Principal always protected
          </div>
          <div className="mt-6 border-t border-[#15300c]/15 pt-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#15300c]/70">Yield Earned (all time)</div>
            <div className="mt-1 text-[28px] font-[800] text-[#3d7a29]" style={DISPLAY}>${(earned / 100).toFixed(2)} USDC</div>
          </div>
        </motion.div>

        {/* APY + this week */}
        <div className="flex flex-row gap-4 md:flex-col md:w-[200px]">
          <motion.div
            className="flex-1 rounded-[20px] p-5 text-[#f7fcf2]"
            style={{ background: "linear-gradient(135deg,#3d7a29,#1c4513)", boxShadow: HARD_SM }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#CAFFB8]">Current APY</div>
            <div className="mt-2 text-[32px] font-[800] leading-none text-white" style={DISPLAY}>6.8%</div>
            <div className="mt-1 text-[12px] text-white/60">via Blend Protocol</div>
            <div className="mt-3 h-1 w-full rounded-full bg-white/20">
              <div className="h-full w-[68%] rounded-full bg-[#CAFFB8]" />
            </div>
            <div className="mt-1 font-mono text-[10px] text-white/50">vs 4.1% avg savings</div>
          </motion.div>
          <motion.div
            className="flex-1 rounded-[20px] bg-[#FFE59E] p-5"
            style={{ boxShadow: HARD_SM }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#15300c]/70">This Week</div>
            <div className="mt-2 text-[32px] font-[800] leading-none text-[#15300c]" style={DISPLAY}>$0.65</div>
            <div className="mt-1 text-[12px] text-[#15300c]/60">accruing · +$0.09 today</div>
          </motion.div>
        </div>
      </div>

      {/* bar chart */}
      <motion.div
        className="rounded-[20px] bg-white p-6"
        style={{ boxShadow: HARD }}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#15300c]/60">Weekly Yield History</div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#15300c]/50">
              <span className="h-2 w-2 rounded-sm bg-[#3d7a29]" /> Latest
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#15300c]/50">
              <span className="h-2 w-2 rounded-sm bg-[#CAFFB8] border border-[#15300c]/20" /> Past
            </span>
          </div>
        </div>
        <div className="flex h-[120px] items-end gap-3">
          {YIELD_HISTORY.map((row, i) => (
            <div key={row.date} className="flex flex-1 flex-col items-center gap-1">
              <span className={`font-mono text-[10px] font-[700] ${i === 0 ? "text-[#3d7a29]" : "text-[#15300c]/50"}`}>${row.earned}</span>
              <motion.div
                className={`w-full rounded-t-[6px] ${i === 0 ? "bg-[#3d7a29]" : "bg-[#CAFFB8]"}`}
                style={{ border: "1px solid #15300c20" }}
                initial={{ height: 0 }}
                animate={{ height: `${(row.earned / maxBar) * 90}px` }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.06 }}
              />
              <span className="font-mono text-[10px] text-[#15300c]/40">{row.date}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* deposit / withdraw */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <motion.div
          className="rounded-[20px] bg-white p-5"
          style={{ boxShadow: HARD_SM }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[#15300c]/60">Add More USDC</div>
          <div className="flex gap-2">
            <input
              placeholder="Amount"
              className="flex-1 rounded-full border border-[#15300c]/20 bg-[#fafdf8] px-4 py-2.5 text-[14px] text-[#15300c] outline-none focus:border-[#3d7a29]"
            />
            <button className="shrink-0 rounded-full bg-[#15300c] px-5 py-2.5 text-[13px] font-[700] text-[#f7fcf2]">Deposit</button>
          </div>
        </motion.div>
        <motion.div
          className="rounded-[20px] bg-white p-5"
          style={{ boxShadow: HARD_SM }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[#15300c]/60">Withdraw</div>
          <button className="w-full rounded-full border-2 border-[#15300c] py-2.5 text-[13px] font-[700] text-[#15300c] transition-colors hover:bg-[#15300c] hover:text-[#f7fcf2]">
            Withdraw USDC ↗
          </button>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── LOTTERY TAB ─── */
function LotteryTab() {
  const prize = useCounter(PRIZE_POOL, 2000);
  const [hrs, setHrs] = useState(47);
  const [mins, setMins] = useState(23);
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setSecs((s) => {
        if (s === 0) { setMins((m) => { if (m === 0) { setHrs((h) => Math.max(0, h - 1)); return 59; } return m - 1; }); return 59; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const winChance = ((TICKETS / 15000) * 100).toFixed(1);

  return (
    <div className="flex flex-col gap-6">
      {/* prize pool hero */}
      <motion.div
        className="relative overflow-hidden rounded-[24px] p-8 text-[#f7fcf2]"
        style={{ background: "linear-gradient(135deg,#3d7a29 0%,#1c4513 100%)", boxShadow: HARD }}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <Pulse />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#CAFFB8]/80">This Week&apos;s Prize Pool</span>
            </div>
            <div className="mt-2 text-[clamp(44px,7vw,80px)] font-[800] leading-none tabular-nums" style={DISPLAY}>
              ${prize.toLocaleString()}
            </div>
            <div className="mt-2 text-[13px] text-white/60">in USDC · drawn every Friday 00:00 UTC</div>
          </div>
          {/* countdown */}
          <div>
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#CAFFB8]/70 text-right">Next Draw</div>
            <div className="flex gap-2">
              {[{ v: hrs, u: "H" }, { v: mins, u: "M" }, { v: secs, u: "S" }].map(({ v, u }) => (
                <div key={u} className="text-center">
                  <div className="rounded-[10px] bg-white/15 px-3 py-2 min-w-[52px]">
                    <div className="text-[22px] font-[800] tabular-nums leading-none text-white" style={DISPLAY}>{String(v).padStart(2, "0")}</div>
                  </div>
                  <div className="mt-1 font-mono text-[10px] tracking-[0.2em] text-white/40">{u}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* tickets + win chance */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <motion.div
          className="rounded-[20px] bg-[#CAFFB8] p-6"
          style={{ boxShadow: HARD_SM }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#15300c]/70">Your Tickets</div>
            <span className="rounded-full bg-[#15300c] px-3 py-1 font-mono text-[10px] text-[#f7fcf2] uppercase">This Week</span>
          </div>
          <div className="text-[44px] font-[800] leading-none text-[#15300c]" style={DISPLAY}>{TICKETS.toLocaleString()}</div>
          <div className="mt-2 text-[12px] text-[#15300c]/60">1 USDC deposited = 1 ticket per week</div>
          <div className="mt-4 h-1.5 w-full rounded-full bg-[#15300c]/15">
            <motion.div
              className="h-full rounded-full bg-[#3d7a29]"
              initial={{ width: 0 }}
              animate={{ width: `${winChance}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <div className="mt-1 flex justify-between font-mono text-[10px] text-[#15300c]/50">
            <span>0</span><span>15,000 pool</span>
          </div>
        </motion.div>

        <motion.div
          className="rounded-[20px] bg-white p-6"
          style={{ boxShadow: HARD_SM }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-[#15300c]/60">Win Probability</div>
          <div className="text-[44px] font-[800] leading-none text-[#15300c]" style={DISPLAY}>{winChance}%</div>
          <div className="mt-2 text-[12px] text-[#15300c]/60">based on {TICKETS} / 15,000 tickets</div>
          <div className="mt-4 rounded-[12px] bg-[#f1f5ee] p-3 text-[13px] text-[#15300c]/70">
            Deposit <span className="font-[700] text-[#3d7a29]">+100 USDC</span> to raise your odds to <span className="font-[700] text-[#15300c]">4.0%</span>
          </div>
        </motion.div>
      </div>

      {/* recent winners */}
      <motion.div
        className="rounded-[20px] bg-white p-6"
        style={{ boxShadow: HARD }}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#15300c]/60">Recent Winners</div>
          <div className="flex items-center gap-2">
            <Pulse />
            <span className="font-mono text-[10px] text-[#3d7a29]">Live draw history</span>
          </div>
        </div>
        <div className="flex flex-col divide-y divide-[#f0f0f0]">
          {WINNERS.map((w) => (
            <div key={w.name} className="flex items-center justify-between py-3.5">
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 shrink-0 flex items-center justify-center rounded-full bg-[#CAFFB8] text-[14px] font-[800] text-[#15300c]" style={DISPLAY}>
                  {w.name[0]}
                </span>
                <div>
                  <div className="text-[14px] font-[700] text-[#15300c]">{w.name}</div>
                  <div className="font-mono text-[11px] text-[#15300c]/50">{w.tickets} tickets · {w.when}</div>
                </div>
              </div>
              <span className="rounded-full bg-[#CAFFB8] px-3 py-1.5 text-[13px] font-[700] text-[#15300c]">+${w.amount} USDC</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── HISTORY TAB ─── */
function HistoryTab() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { l: "Total In",     v: "$500.00", c: "#15300c" },
          { l: "Yield Earned", v: "+$1.64",  c: "#3d7a29" },
          { l: "Transactions", v: "4",        c: "#15300c" },
        ].map((s) => (
          <div key={s.l} className="rounded-[20px] bg-[#CAFFB8] p-5" style={{ boxShadow: HARD_SM }}>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#15300c]/70">{s.l}</div>
            <div className="mt-2 text-[28px] font-[800] leading-none" style={{ ...DISPLAY, color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="rounded-[20px] bg-white p-6" style={{ boxShadow: HARD }}>
        <div className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-[#15300c]/60">All Transactions</div>
        <div className="flex flex-col divide-y divide-[#f0f0f0]">
          {TX_HISTORY.map((tx, i) => (
            <div key={i} className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <span
                  className="rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em]"
                  style={{
                    background: tx.type === "Deposit" ? "#15300c" : "#CAFFB8",
                    color: tx.type === "Deposit" ? "#f7fcf2" : "#15300c",
                  }}
                >
                  {tx.type}
                </span>
                <div>
                  <div className="text-[13px] font-[700] text-[#15300c]">{tx.date}</div>
                  <div className="font-mono text-[11px] text-[#15300c]/50">{tx.status}</div>
                </div>
              </div>
              <div className={`text-[15px] font-[800] ${tx.type === "Yield" ? "text-[#3d7a29]" : "text-[#15300c]"}`} style={DISPLAY}>
                {tx.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── SETTINGS TAB ─── */
function SettingsTab({ walletAddress, onConnect, onDisconnect }: {
  walletAddress: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[20px] bg-white p-6" style={{ boxShadow: HARD }}>
        <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-[#15300c]/60">Connected Wallet</div>
        {walletAddress ? (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 rounded-full bg-[#CAFFB8] px-4 py-2.5">
              <Pulse />
              <span className="font-mono text-[13px] font-[700] text-[#15300c]">
                {walletAddress.slice(0, 8)}…{walletAddress.slice(-6)}
              </span>
            </div>
            <button
              onClick={onDisconnect}
              className="rounded-full border-2 border-[#15300c] px-5 py-2 text-[13px] font-[700] text-[#15300c] transition-colors hover:bg-[#15300c] hover:text-[#f7fcf2]"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={onConnect}
            className="rounded-full bg-[#15300c] px-6 py-2.5 text-[13px] font-[700] text-[#f7fcf2] transition-transform hover:-translate-y-0.5"
          >
            Connect Freighter
          </button>
        )}
      </div>

      <div className="rounded-[20px] bg-white p-6" style={{ boxShadow: HARD }}>
        <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-[#15300c]/60">Notifications</div>
        <div className="flex flex-col divide-y divide-[#f0f0f0]">
          {["Email me when I win", "Weekly yield summary", "Draw reminders"].map((opt) => (
            <div key={opt} className="flex items-center justify-between py-3.5">
              <span className="text-[14px] font-[600] text-[#15300c]">{opt}</span>
              <button className="rounded-full bg-[#CAFFB8] px-4 py-1.5 font-mono text-[10px] font-[700] uppercase tracking-[0.1em] text-[#15300c]">On</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── LAYOUT ─── */
type TabId = "overview" | "yield" | "lottery" | "history" | "settings";

const NAV: { id: TabId; label: string; badge?: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "yield",    label: "Yield",   badge: "6.8%" },
  { id: "lottery",  label: "Lottery" },
  { id: "history",  label: "History" },
  { id: "settings", label: "Settings" },
];

const TAB_LABEL: Record<TabId, string> = {
  overview: "Overview",
  yield:    "Yield Dashboard",
  lottery:  "Lottery",
  history:  "Transaction History",
  settings: "Settings",
};

export default function Dashboard() {
  const [tab, setTab] = useState<TabId>("overview");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);

  // Restore existing Freighter connection on mount
  useEffect(() => {
    getWalletAddress().then((addr) => { if (addr) setWalletAddress(addr); });
  }, []);

  const handleConnect = useCallback(async () => {
    setWalletError(null);
    try {
      const addr = await connectWallet();
      setWalletAddress(addr);
    } catch (err) {
      setWalletError(err instanceof Error ? err.message : "Failed to connect wallet");
    }
  }, []);

  const handleDisconnect = useCallback(async () => {
    await disconnectWallet();
    setWalletAddress(null);
  }, []);

  const content: Record<TabId, React.ReactNode> = {
    overview: <OverviewTab setTab={setTab} />,
    yield:    <YieldTab />,
    lottery:  <LotteryTab />,
    history:  <HistoryTab />,
    settings: <SettingsTab walletAddress={walletAddress} onConnect={handleConnect} onDisconnect={handleDisconnect} />,
  };

  return (
    <div className="flex min-h-screen" style={{ background: "#fafdf8", fontFamily: "var(--font-sans),system-ui,sans-serif", color: "#15300c" }}>

      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex w-[220px] shrink-0 flex-col border-r border-[#CFE7BD] sticky top-0 h-screen overflow-y-auto" style={{ background: "#f7fcf2" }}>
        {/* logo */}
        <div className="px-5 py-5 border-b border-[#CFE7BD]">
          <a href="/" style={{ textDecoration: "none" }}>
            <Logo size={24} showText />
          </a>
        </div>

        {/* nav */}
        <nav className="flex flex-col flex-1 gap-1.5 px-3 py-4">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex w-full items-center justify-between rounded-[12px] px-4 py-3 text-[13px] font-[600] text-left transition-all border ${
                tab === item.id
                  ? "bg-[#CAFFB8] text-[#15300c] border-[#15300c]/20"
                  : "text-[#15300c]/70 border-transparent hover:bg-[#15300c]/[0.05] hover:text-[#15300c]"
              }`}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="rounded-full bg-[#15300c] px-2 py-0.5 font-mono text-[10px] font-[700] text-[#f7fcf2]">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* wallet card */}
        <div className="px-3 pb-5 border-t border-[#CFE7BD] pt-4">
          <div className="rounded-[16px] bg-white p-4" style={{ boxShadow: HARD_SM }}>
            {walletAddress ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Pulse />
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#3d7a29]">Connected</span>
                </div>
                <div className="font-mono text-[12px] font-[700] text-[#15300c] break-all">
                  {walletAddress.slice(0, 8)}…{walletAddress.slice(-6)}
                </div>
                <div className="mt-2 rounded-full bg-[#CAFFB8] py-1.5 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-[#15300c]">
                  Freighter Wallet
                </div>
                <button
                  onClick={handleDisconnect}
                  className="mt-2 w-full rounded-full border border-[#15300c]/25 py-1.5 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-[#15300c]/55 transition-colors hover:border-[#15300c]/60 hover:text-[#15300c]"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <>
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#15300c]/50 mb-3">No wallet</div>
                <button
                  onClick={handleConnect}
                  className="w-full rounded-full bg-[#15300c] py-2 text-[11px] font-[700] text-[#f7fcf2] transition-transform hover:-translate-y-0.5"
                >
                  Connect Freighter
                </button>
              </>
            )}
          </div>
          {walletError && (
            <div className="mt-2 rounded-[10px] bg-red-50 px-3 py-2 text-[11px] text-red-600 border border-red-200">
              {walletError}
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* top bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#CFE7BD] px-6 py-4" style={{ background: "#fafdf8" }}>
          <div className="text-[20px] font-[800] tracking-[-0.02em]" style={DISPLAY}>{TAB_LABEL[tab]}</div>
          <div className="flex items-center gap-3">
            {walletAddress ? (
              <a
                href="/"
                className="hidden md:inline-flex rounded-full bg-[#15300c] px-5 py-2 text-[13px] font-[700] text-[#f7fcf2] transition-transform hover:-translate-y-0.5"
                style={{ textDecoration: "none" }}
              >
                Deposit More
              </a>
            ) : (
              <button
                onClick={handleConnect}
                className="hidden md:inline-flex rounded-full bg-[#15300c] px-5 py-2 text-[13px] font-[700] text-[#f7fcf2] transition-transform hover:-translate-y-0.5"
              >
                Connect Wallet
              </button>
            )}
            {/* mobile logo */}
            <a href="/" className="lg:hidden" style={{ textDecoration: "none" }}>
              <Logo size={22} showText={false} />
            </a>
          </div>
        </header>

        {/* mobile nav pills */}
        <div className="flex lg:hidden overflow-x-auto gap-2 px-4 py-3 border-b border-[#CFE7BD]">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-[12px] font-[700] transition-all ${
                tab === item.id ? "bg-[#15300c] text-[#f7fcf2]" : "border border-[#CFE7BD] text-[#15300c]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* content */}
        <main className="flex-1 overflow-y-auto px-5 py-7 md:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {content[tab]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
