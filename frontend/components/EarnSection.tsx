"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const DISPLAY = { fontFamily: "var(--font-display)" } as const;

function BalanceCard() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [balance, setBalance] = useState(1240.0);

  useEffect(() => {
    if (!inView) return;
    // Count up from 1198
    const start = 1198;
    const end = 1240;
    const duration = 1400;
    const startTime = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setBalance(start + (end - start) * eased);
      if (t < 1) requestAnimationFrame(tick);
      else {
        // keep ticking by cent
        const interval = setInterval(() => setBalance((b) => b + 0.01), 1600);
        return () => clearInterval(interval);
      }
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  const fmt = (n: number) =>
    "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <motion.div
      ref={ref}
      className="relative mx-auto w-full max-w-[420px] rounded-[28px] p-8 text-[#f7fcf2]"
      style={{
        background: "linear-gradient(135deg, #3d7a29 0%, #1c4513 100%)",
        boxShadow: "12px 12px 0 #15300c",
      }}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#CAFFB8]">Your balance</div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#CAFFB8] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#15300c]">
          <motion.span
            className="inline-block h-1.5 w-1.5 rounded-full bg-[#15300c]"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          Earning yield
        </span>
      </div>

      <div className="mt-2 text-[44px] font-[800] leading-none tabular-nums" style={DISPLAY}>
        {fmt(balance)}
      </div>
      <div className="mt-1 font-mono text-[12px] text-[#cfe9c2]">USDC · via Blend on Stellar</div>

      {/* growth line */}
      <svg viewBox="0 0 320 92" className="mt-7 h-[92px] w-full" aria-hidden>
        <path
          d="M0 80 C 60 72, 90 60, 140 52 S 230 30, 312 12 L 312 92 L 0 92 Z"
          fill="#CAFFB8"
          fillOpacity="0.14"
        />
        <motion.path
          d="M0 80 C 60 72, 90 60, 140 52 S 230 30, 312 12"
          fill="none"
          stroke="#CAFFB8"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
        <motion.circle
          cx="312"
          cy="12"
          r="5"
          fill="#CAFFB8"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1, y: [0, -3, 0] } : {}}
          transition={{ opacity: { delay: 1.2, duration: 0.3 }, y: { delay: 1.2, duration: 1.5, repeat: Infinity, ease: "easeInOut" } }}
        />
      </svg>
      <div className="mt-2 font-mono text-[11px] text-[#9fc78c]">always withdrawable · weekly draws</div>
    </motion.div>
  );
}

export function EarnSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="earn" ref={ref} className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-12 px-6 pt-20 pb-12 md:px-12 md:pt-24 lg:grid-cols-[1fr_1fr] lg:gap-16 scroll-mt-8">
      <div>
        <motion.div
          className="mb-4 font-mono text-[11px] uppercase tracking-[0.28em] text-[#3d7a29]"
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          Put USDC to work
        </motion.div>
        <h2
          className="font-[800] uppercase leading-[0.98] tracking-[-0.02em] text-[#15300c]"
          style={{ ...DISPLAY, fontSize: "clamp(36px, 5.5vw, 72px)" }}
        >
          <span className="block overflow-hidden pb-[0.06em]">
            <motion.span
              className="inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.06 }}
            >
              Your yield works
            </motion.span>
          </span>
          <span className="relative inline-block">
            <motion.span
              className="absolute inset-x-[-6px] inset-y-[5px] -z-0 -rotate-[1.5deg] rounded-[10px] bg-[#CAFFB8]"
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "left center" }}
            />
            <motion.span
              className="relative z-10 inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.14 }}
            >
              for you.
            </motion.span>
          </span>
        </h2>

        <motion.p
          className="mt-10 max-w-[460px] text-[17px] leading-[1.55] text-[#3a5230]"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.22 }}
        >
          Deposit USDC and it auto-routes into Blend lending pools on Stellar, earning 6.8% APY every day. The yield pools up each week — and every Friday it all goes to one lucky winner.
        </motion.p>

        <motion.ul
          className="mt-7 flex flex-col gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {["6.8% APY, fully automatic", "Principal stays 100% safe", "Withdraw whenever you want"].map((x) => (
            <li key={x} className="flex items-center gap-3 text-[15px] text-[#15300c]/80">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3d7a29]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f7fcf2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 6.5" />
                </svg>
              </span>
              {x}
            </li>
          ))}
        </motion.ul>
      </div>

      <BalanceCard />
    </section>
  );
}
