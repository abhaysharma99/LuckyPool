"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const DISPLAY = { fontFamily: "var(--font-display)" } as const;

const ITEMS = [
  {
    q: "Can I lose my deposit?",
    a: "Never. Your principal is fully protected at all times. Only the yield goes into the weekly prize pool — so the worst case is you earn nothing, which never happens anyway.",
    bg: "#CAFFB8",
    tilt: "-1.2deg",
  },
  {
    q: "How often are draws?",
    a: "Every Friday. The full accumulated yield from all depositors pools up and is sent to one winner automatically via smart contract on Stellar.",
    bg: "#FFE59E",
    tilt: "1.2deg",
  },
  {
    q: "What APY do I earn?",
    a: "6.8% APY, auto-routed into Blend lending pools on Stellar. It accrues daily and builds your ticket count for the weekly draw.",
    bg: "#FF9E7A",
    tilt: "-1deg",
  },
  {
    q: "How do I withdraw?",
    a: "Go to your dashboard and hit withdraw — your full USDC balance comes back to your Freighter wallet instantly, no lock-up, no fee.",
    bg: "#C9B8FF",
    tilt: "1.4deg",
  },
];

export function FAQ() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" ref={ref} className="mx-auto max-w-[780px] px-6 pt-20 pb-28 md:px-12 md:pt-28 scroll-mt-8">
      <div className="mb-12 text-center">
        <motion.div
          className="mb-4 font-mono text-[11px] uppercase tracking-[0.28em] text-[#3d7a29]"
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          The honest answers
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
              Questions?
            </motion.span>
          </span>
          <span className="relative inline-block">
            <motion.span
              className="absolute inset-x-[-10px] inset-y-[8px] -z-0 -rotate-[1.5deg] rounded-[14px] bg-[#CAFFB8]"
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
              Good.
            </motion.span>
          </span>
        </h2>
      </div>

      <div className="flex flex-col gap-5">
        {ITEMS.map((item, i) => {
          const isOpen = open === i;
          return (
            <motion.article
              key={item.q}
              className="overflow-hidden rounded-[28px]"
              style={{ background: item.bg, boxShadow: "10px 10px 0 #15300c" }}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.2 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => setOpen(isOpen ? null : i)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full min-w-0 items-center justify-between gap-8 px-12 py-10 text-left cursor-pointer md:px-16"
              >
                <span
                  className="min-w-0 font-[800] leading-[1.05] tracking-[-0.02em] text-[#15300c]"
                  style={{ ...DISPLAY, fontSize: "clamp(19px, 2.4vw, 26px)", wordBreak: "break-word", overflowWrap: "break-word" }}
                >
                  {item.q}
                </span>
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#15300c] text-[20px] font-[800] leading-none text-[#f7fcf2] transition-transform duration-300"
                  style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                  aria-hidden
                >
                  +
                </span>
              </div>
              <div
                className="grid transition-[grid-template-rows,opacity] duration-300 ease-out"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr", opacity: isOpen ? 1 : 0 }}
              >
                <div className="overflow-hidden">
                  <p className="px-12 pb-12 text-[16px] leading-[1.55] text-[#15300c]/80 md:px-16" style={{ wordBreak: "break-word", overflowWrap: "break-word" }}>{item.a}</p>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

    </section>
  );
}
