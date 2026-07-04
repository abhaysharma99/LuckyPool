"use client";

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
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#3d7a29]">
            luckypool · Built on Stellar
          </div>
        </div>
        </section>
      </div>
    </main>
  );
}
