"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const DISPLAY = { fontFamily: "var(--font-display)" } as const;

function Word({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <span className="block overflow-hidden pb-[0.06em]">
      <motion.span
        className="inline-block"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function Hero() {
  return (
    <section className="mx-auto grid max-w-[1500px] grid-cols-1 items-center gap-8 px-6 pt-24 pb-16 md:px-12 lg:grid-cols-[1.6fr_0.7fr] lg:pt-28">
      {/* Copy */}
      <div className="lg:pl-10">
        {/* Waitlist banner + eyebrow stacked */}
        <motion.div
          className="mb-6 flex flex-col items-start gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Row 1: avatars + count on one line */}
          <div
            style={{ display: "flex", flexWrap: "nowrap", alignItems: "center", gap: 12, background: "#15300c", borderRadius: 999, border: "1px solid rgba(21,48,12,0.2)", padding: "8px 16px", boxShadow: "3px 3px 0 #3d7a29" }}
          >
            <div style={{ display: "flex", flexWrap: "nowrap", flexShrink: 0 }}>
              {[
                { seed: "Alex",   bg: "#CAFFB8" },
                { seed: "Dana",   bg: "#C9B8FF" },
                { seed: "Priya",  bg: "#FFE59E" },
                { seed: "Jordan", bg: "#FF9E7A" },
                { seed: "Morgan", bg: "#B8E8FF" },
                { seed: "Sam",    bg: "#FFB8D9" },
              ].map(({ seed, bg }, i) => (
                <span
                  key={seed}
                  style={{
                    display: "inline-flex",
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: "2px solid #15300c",
                    overflow: "hidden",
                    flexShrink: 0,
                    marginLeft: i === 0 ? 0 : -8,
                    background: bg,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${seed}&backgroundColor=${bg.replace("#", "")}`}
                    width={28}
                    height={28}
                    alt={seed}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </span>
              ))}
            </div>
            <span style={{ whiteSpace: "nowrap", fontFamily: "monospace", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "#CAFFB8", flexShrink: 0 }}>
              500+ on the waitlist
            </span>
          </div>

          {/* Row 2: tagline */}
          <div style={{ display: "flex", flexWrap: "nowrap", alignItems: "center", gap: 8, borderRadius: 999, border: "1px solid rgba(21,48,12,0.15)", background: "rgba(255,255,255,0.6)", padding: "6px 16px", fontFamily: "monospace", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.22em", color: "#3d7a29", backdropFilter: "blur(4px)" }}>
            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#3d7a29", flexShrink: 0 }} />
            <span style={{ whiteSpace: "nowrap" }}>No-loss savings with a weekly jackpot.</span>
          </div>
        </motion.div>

        {/* Headline */}
        <h1
          className="font-[800] uppercase leading-[0.86] tracking-[-0.04em]"
          style={{ ...DISPLAY, fontSize: "clamp(44px, 7.5vw, 104px)" }}
        >
          <Word delay={0.1}>Deposit.</Word>
          <Word delay={0.18}>Earn yield.</Word>
          <span className="relative mt-1 inline-block overflow-visible">
            <motion.span
              className="absolute inset-x-[-8px] inset-y-[6px] -z-0 -rotate-[1.5deg] rounded-[14px] bg-[#CAFFB8]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "left center" }}
            />
            <motion.span
              className="relative z-10 inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.26 }}
            >
              Win weekly.
            </motion.span>
          </span>
        </h1>

        {/* Sub */}
        <motion.p
          className="mt-10 max-w-[460px] text-[17px] leading-[1.55] text-[#3a5230]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          Hold USDC. Earn 6.8% APY via Blend on Stellar.
          Win the weekly prize draw. Your principal is never at risk — no loss, ever.
        </motion.p>

        {/* Built on Stellar */}
        <motion.div
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#15300c]/15 bg-white/60 px-5 py-2 font-mono text-[13px] uppercase tracking-[0.2em] text-[#3d7a29]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Built on Stellar
          <Image src="/stellar-mark.png" alt="Stellar" width={18} height={16} />
        </motion.div>

        {/* CTAs */}
      </div>

      {/* Right — floating stat cards */}
      <motion.div
        className="relative flex flex-col gap-4"
        style={{ overflow: "visible" }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Floating orbs — around cards, overflow outside */}
        <motion.div
          style={{ position: "absolute", width: 320, height: 320, top: -80, right: -100, borderRadius: "50%", background: "radial-gradient(circle, #CAFFB8 0%, transparent 65%)", filter: "blur(50px)", zIndex: 0, pointerEvents: "none" }}
          animate={{ scale: [1, 1.18, 1], y: [0, -18, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          style={{ position: "absolute", width: 240, height: 240, bottom: -60, left: -80, borderRadius: "50%", background: "radial-gradient(circle, #C9B8FF 0%, transparent 65%)", filter: "blur(44px)", zIndex: 0, pointerEvents: "none" }}
          animate={{ scale: [1, 1.22, 1], y: [0, 16, 0] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          style={{ position: "absolute", width: 160, height: 160, bottom: 40, right: -60, borderRadius: "50%", background: "radial-gradient(circle, #FFE59E 0%, transparent 65%)", filter: "blur(32px)", zIndex: 0, pointerEvents: "none" }}
          animate={{ scale: [1, 1.3, 1], y: [0, -12, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
        />

        {/* Prize pool card */}
        <div className="relative rounded-[20px] bg-[#CAFFB8] p-5" style={{ boxShadow: "8px 8px 0 #15300c", zIndex: 1 }}>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#15300c]/70">This week&apos;s prize pool</div>
          <div className="mt-2 font-[800] leading-[1] tracking-[-0.03em] text-[#15300c]" style={{ ...DISPLAY, fontSize: "clamp(28px, 4vw, 44px)" }}>
            $12,847
          </div>
          <div className="mt-1.5 text-[12px] text-[#15300c]/60">Draws every Friday · USDC</div>
        </div>

        <div className="relative grid grid-cols-2 gap-3" style={{ zIndex: 1 }}>
          <div className="rounded-[16px] bg-[#C9B8FF] p-4" style={{ boxShadow: "5px 5px 0 #15300c" }}>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#15300c]/65">APY</div>
            <div className="mt-1.5 text-[24px] font-[800] leading-[1] text-[#15300c]" style={DISPLAY}>6.8%</div>
            <div className="mt-1 text-[11px] text-[#15300c]/60">via Blend</div>
          </div>
          <div className="rounded-[16px] bg-[#FFE59E] p-4" style={{ boxShadow: "5px 5px 0 #15300c" }}>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#15300c]/65">Principal</div>
            <div className="mt-1.5 text-[24px] font-[800] leading-[1] text-[#15300c]" style={DISPLAY}>Safe</div>
            <div className="mt-1 text-[11px] text-[#15300c]/60">Zero loss. Ever.</div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
