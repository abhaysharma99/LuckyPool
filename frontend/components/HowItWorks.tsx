"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const DISPLAY = { fontFamily: "var(--font-display)" } as const;
const HARD = "10px 10px 0 #15300c";

const STEPS = [
  { n: "01", t: "Deposit USDC", b: "Connect your Freighter wallet and deposit any amount. Your principal is protected 100% of the time — no lock-up.", bg: "#CAFFB8" },
  { n: "02", t: "Earn yield automatically", b: "Your USDC goes into Blend lending pools on Stellar, earning 6.8% APY automatically every day.", bg: "#FFE59E" },
  { n: "03", t: "Win the weekly draw", b: "Every Friday the full accumulated yield pool goes to one winner. Bigger deposit = more tickets = better odds.", bg: "#C9B8FF" },
];

export function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how" ref={ref} className="mx-auto max-w-[1400px] px-6 pt-20 pb-12 md:px-12 md:pt-24 scroll-mt-8">
      <div className="mb-12 text-center">
        <motion.div
          className="mb-4 font-mono text-[11px] uppercase tracking-[0.28em] text-[#3d7a29]"
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          How it works
        </motion.div>
        <h2
          className="font-[800] uppercase leading-[0.92] tracking-[-0.03em] text-[#15300c]"
          style={{ ...DISPLAY, fontSize: "clamp(36px, 5.5vw, 72px)" }}
        >
          <motion.span
            className="block overflow-hidden pb-[0.06em]"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.05 }}
          >
            <span className="inline-block">Start earning in</span>
          </motion.span>
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
              transition={{ duration: 0.7, delay: 0.13 }}
            >
              a minute.
            </motion.span>
          </span>
        </h2>
      </div>

      <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <motion.article
            key={s.n}
            className="relative rounded-[28px] p-7 md:p-8"
            style={{ background: s.bg, boxShadow: HARD }}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#15300c] text-[18px] font-[800] text-[#f7fcf2]"
              style={DISPLAY}
            >
              {s.n}
            </div>
            <h3 className="mt-4 font-[800] leading-[1.05] tracking-[-0.02em] text-[#15300c]" style={{ ...DISPLAY, fontSize: "clamp(22px, 2.6vw, 30px)" }}>
              {s.t}
            </h3>
            <p className="mt-8 text-[15px] leading-[1.5] text-[#15300c]/75">{s.b}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
