"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const DISPLAY = { fontFamily: "var(--font-display)" } as const;
const HARD = "10px 10px 0 #15300c";

// Simple SVG icons matching talise's illustration style
function IconDeposit() {
  return (
    <svg width="104" height="104" viewBox="0 0 104 104" fill="none" className="-mr-3 -mt-3 drop-shadow-[0_10px_12px_rgba(21,48,12,0.22)]">
      <circle cx="52" cy="52" r="40" fill="#15300c" fillOpacity="0.10" />
      <circle cx="52" cy="52" r="28" fill="#15300c" fillOpacity="0.12" />
      <path d="M52 36v32M40 52h24" stroke="#15300c" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M44 44l8-8 8 8" stroke="#15300c" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconSafe() {
  return (
    <svg width="104" height="104" viewBox="0 0 104 104" fill="none" className="-mr-3 -mt-3 drop-shadow-[0_10px_12px_rgba(21,48,12,0.22)]">
      <circle cx="52" cy="52" r="40" fill="#15300c" fillOpacity="0.10" />
      <path d="M52 30L36 38v16c0 10 7.2 19.4 16 22 8.8-2.6 16-12 16-22V38L52 30z" stroke="#15300c" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M45 52l5 5 9-9" stroke="#15300c" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconYield() {
  return (
    <svg width="104" height="104" viewBox="0 0 104 104" fill="none" className="-mr-3 -mt-3 drop-shadow-[0_10px_12px_rgba(21,48,12,0.22)]">
      <circle cx="52" cy="52" r="40" fill="#15300c" fillOpacity="0.10" />
      <path d="M34 64 C 42 64, 44 44, 52 44 S 62 58, 70 44" stroke="#15300c" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <circle cx="70" cy="44" r="4" fill="#15300c" />
      <path d="M34 70h36" stroke="#15300c" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
function IconWithdraw() {
  return (
    <svg width="104" height="104" viewBox="0 0 104 104" fill="none" className="-mr-3 -mt-3 drop-shadow-[0_10px_12px_rgba(21,48,12,0.22)]">
      <circle cx="52" cy="52" r="40" fill="#15300c" fillOpacity="0.10" />
      <rect x="36" y="40" width="32" height="24" rx="4" stroke="#15300c" strokeWidth="3.5" />
      <path d="M44 40v-4a8 8 0 0116 0v4" stroke="#15300c" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="52" cy="52" r="4" fill="#15300c" />
    </svg>
  );
}

const CARDS = [
  {
    tag: "Deposit",
    title: "Hold USDC, keep everything.",
    body: "Deposit any amount of USDC. Your principal is protected 100% — always yours to withdraw, zero lock-up, zero risk.",
    bg: "#CAFFB8",
    tilt: "-1.5deg",
    Icon: IconDeposit,
  },
  {
    tag: "Earn",
    title: "Your money earns while it sits.",
    body: "Every dollar you deposit goes into Blend lending pools on Stellar, quietly earning 6.8% APY — automatic, always liquid.",
    bg: "#FF9E7A",
    tilt: "1.5deg",
    Icon: IconYield,
  },
  {
    tag: "Win",
    title: "Yield becomes your lottery ticket.",
    body: "The interest earned by all depositors pools up each week. Every Friday, it all goes to one lucky winner. No fee to play — you just hold.",
    bg: "#C9B8FF",
    tilt: "1.2deg",
    Icon: IconSafe,
  },
  {
    tag: "Withdraw",
    title: "Leave whenever. No strings.",
    body: "Withdraw your full principal at any time. Your deposit, your rules. We never touch the principal — only the yield goes to the draw.",
    bg: "#FFE59E",
    tilt: "-1.2deg",
    Icon: IconWithdraw,
  },
];

export function FeaturesBento() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" ref={ref} className="mx-auto max-w-[1400px] px-6 pt-20 pb-28 md:px-12 md:pt-28 scroll-mt-8">
      <div className="mb-14 text-center">
        <motion.div
          className="mb-4 font-mono text-[11px] uppercase tracking-[0.28em] text-[#3d7a29]"
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          What you get
        </motion.div>
        <h2
          className="font-[800] uppercase leading-[0.92] tracking-[-0.03em] text-[#15300c]"
          style={{ ...DISPLAY, fontSize: "clamp(36px, 5.5vw, 72px)" }}
        >
          <span className="block overflow-hidden pb-[0.06em]">
            <motion.span
              className="inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.06 }}
            >
              Savings that
            </motion.span>
          </span>
          <span className="relative inline-block">
            <motion.span
              className="absolute inset-x-[-8px] inset-y-[6px] -z-0 -rotate-[1.2deg] rounded-[12px] bg-[#CAFFB8]"
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "left center" }}
            />
            <motion.span
              className="relative z-10 inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.14 }}
            >
              never lose.
            </motion.span>
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {CARDS.map((c, i) => (
          <motion.article
            key={c.tag}
            className="relative overflow-hidden rounded-[28px] p-7 md:p-9"
            style={{ background: c.bg, boxShadow: HARD, transform: `rotate(${c.tilt})` }}
            initial={{ opacity: 0, y: 22 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.18 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start justify-between">
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#15300c]/70">{c.tag}</div>
              <c.Icon />
            </div>
            <h3
              className="mt-6 font-[800] leading-[1.02] tracking-[-0.02em] text-[#15300c]"
              style={{ ...DISPLAY, fontSize: "clamp(26px, 3.2vw, 38px)" }}
            >
              {c.title}
            </h3>
            <p className="mt-3 max-w-[360px] text-[15px] leading-[1.5] text-[#15300c]/75">{c.body}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
