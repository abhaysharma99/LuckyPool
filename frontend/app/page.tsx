"use client";

import Image from "next/image";
import {
  Navigation,
  Hero,
  HowItWorks,
  FeaturesBento,
  ProtocolSection,
  EarnSection,
  DepositSection,
  FAQ,
} from "../components";

export default function Home() {
  return (
    <main
      className="relative min-h-screen"
      style={{
        fontFamily: "var(--font-sans), system-ui, sans-serif",
        color: "#15300c",
        background: "radial-gradient(120% 90% at 12% -5%, #e6f9d6 0%, #f7fcf2 50%, #e8f9d8 100%)",
      }}
    >
      <Navigation />
      <div id="hero"><Hero /></div>
      <div id="how" className="scroll-mt-8"><HowItWorks /></div>
      <div id="features" className="scroll-mt-8"><FeaturesBento /></div>
      <div id="protocol" className="scroll-mt-8"><ProtocolSection /></div>
      <div id="earn" className="scroll-mt-8"><EarnSection /></div>
      <DepositSection />
      <div
        id="faq"
        className="scroll-mt-8"
        style={{ background: "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.55) 18%, rgba(255,255,255,0.72) 100%)" }}
      >
        <FAQ />

        {/* Bottom closing: big wordmark + social */}
        <section className="px-6 pb-10 pt-20 text-center md:px-10">
        <div
          className="pointer-events-none select-none text-center font-[800] leading-[0.82] tracking-[-0.04em] text-[#3d7a29]"
          style={{ fontFamily: "var(--font-display)", fontSize: "clamp(80px,20vw,300px)" }}
          aria-hidden
        >
          luckypool.
        </div>
        <div className="flex flex-col items-center gap-4 pb-32 pt-16">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#15300c]/20 bg-white/60 px-4 py-1.5">
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[#3d7a29]">
              luckypool · Built on Stellar
              <Image src="/stellar-mark.png" alt="Stellar" width={14} height={12} />
            </span>
            <a
              href="https://x.com/LuckyPoolHQ"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LuckyPool on X"
              className="text-[#3d7a29] transition-opacity hover:opacity-70"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 4L20 20M20 4L4 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </a>
          </div>
          <div className="max-w-md rounded-[16px] border border-[#15300c]/15 bg-white/50 px-5 py-4 text-center text-[13px] leading-[1.6] text-[#15300c]/75">
            Hold USDC. Earn 6.8% APY via Blend on Stellar. Win the weekly prize draw. Your principal is never at risk — no loss, ever.
          </div>
        </div>
        </section>
      </div>
    </main>
  );
}
