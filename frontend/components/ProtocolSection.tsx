"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const DISPLAY = { fontFamily: "var(--font-display)" } as const;
const HARD = "10px 10px 0 #15300c";

const STEPS = [
  {
    n: "01",
    t: "Integrate in minutes",
    b: "Drop in the DrawEngine SDK. Define your pool, set ticket weights, trigger a draw. No VRF, no ticketing logic, no infrastructure to build.",
    bg: "#CAFFB8",
  },
  {
    n: "02",
    t: "Run any draw",
    b: "NFT raffles, DAO grant allocation, liquidity mining rewards, loyalty programs — one primitive, infinite use cases.",
    bg: "#FFE59E",
  },
  {
    n: "03",
    t: "Verifiable on-chain",
    b: "Every draw is provably fair via VRF on Stellar. Winner is recorded on-chain automatically. No trust required, no disputes.",
    bg: "#C9B8FF",
  },
];

export function ProtocolSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="mx-auto max-w-[1400px] px-6 pt-20 pb-12 md:px-12 md:pt-24">
      <div className="mb-12 text-center">
        <motion.div
          className="mb-4 font-mono text-[11px] uppercase tracking-[0.28em] text-[#3d7a29]"
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          For protocols &amp; DAOs
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
              transition={{ duration: 0.7, delay: 0.05 }}
            >
              The draw{" "}
              <span className="group relative inline-block">
                <motion.span
                  className="absolute inset-x-[-6px] inset-y-[5px] -z-0 -rotate-[1.5deg] rounded-[10px] bg-[#CAFFB8]"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: "left center" }}
                />
                <span className="relative z-10">primitive.</span>
              </span>
            </motion.span>
          </span>
        </h2>
        <motion.p
          className="mt-5 text-[17px] leading-[1.55] text-[#3a5230]"
          style={{ textAlign: "center", maxWidth: "520px", margin: "20px auto 0" }}
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          LuckyPool isn&apos;t just a savings app. DrawEngine is the Stripe for onchain draws — any protocol can run a provably fair winner selection without building VRF, ticketing, or draw logic from scratch.
        </motion.p>
      </div>

      <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <motion.article
            key={s.n}
            className="relative rounded-[28px] p-8 md:p-10"
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
            <h3
              className="mt-4 font-[800] leading-[1.05] tracking-[-0.02em] text-[#15300c]"
              style={{ ...DISPLAY, fontSize: "clamp(22px, 2.6vw, 30px)" }}
            >
              {s.t}
            </h3>
            <p className="mt-8 text-[15px] leading-[1.5] text-[#15300c]/75">{s.b}</p>
          </motion.article>
        ))}
      </div>

      {/* Use case tags + CTA */}
      <motion.div
        className="mt-10 flex flex-wrap justify-center gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.45 }}
      >
        {["NFT Raffles", "DAO Grant Draws", "Liquidity Rewards", "IDO Allocation", "Loyalty Programs", "GameFi", "Employee Rewards"].map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-[#15300c]/20 bg-white/60 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#15300c]/70 backdrop-blur-sm"
          >
            {tag}
          </span>
        ))}
      </motion.div>

      {/* Battle-tested callout + Talk to us */}
      <motion.div
        className="mt-10 flex flex-col items-center gap-6 rounded-[28px] p-8 md:flex-row md:items-center md:justify-between md:p-10"
        style={{ background: "linear-gradient(135deg, #3d7a29 0%, #1c4513 100%)", boxShadow: HARD }}
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.55 }}
      >
        <div className="max-w-[540px]">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#CAFFB8]/60 mb-2">Battle-tested core</div>
          <p className="text-[15px] leading-[1.55] text-[#f7fcf2]/70">
            The same draw engine that powers LuckyPool&apos;s weekly jackpot — already live on Stellar, already audited. Any protocol can plug it in and skip months of VRF and ticketing engineering.
          </p>
        </div>
        <div className="shrink-0">
          <a
            href="/docs"
            className="inline-flex items-center gap-2 rounded-full border-2 border-white bg-transparent px-8 py-4 text-[18px] font-[800] text-white transition-all hover:bg-white hover:text-[#15300c]"
            style={{ textDecoration: "none" }}
          >
            View Docs ↗
          </a>
        </div>
      </motion.div>
    </section>
  );
}
