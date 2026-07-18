"use client";

import { motion } from "framer-motion";
import { Logo } from "./ui/Logo";

const NAV_LINKS = [
  { l: "How it works", href: "#how" },
  { l: "Features", href: "#features" },
  { l: "Earn", href: "#earn" },
  { l: "FAQ", href: "#faq" },
];

export function Navigation() {
  return (
    <>
      {/* Top brand bar */}
      <motion.div
        className="mx-auto flex max-w-[1500px] items-center justify-between px-6 pt-7 md:px-12"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <a href="/" style={{ textDecoration: "none" }}>
          <Logo size={26} showText />
        </a>
      </motion.div>

      {/* Floating pill nav */}
      <motion.nav
        className="pointer-events-auto fixed bottom-5 left-1/2 z-50 flex max-w-[calc(100vw-24px)] -translate-x-1/2 items-center gap-1 rounded-full border border-[#15300c]/10 bg-white/85 px-2 py-2 shadow-[0_10px_40px_-12px_rgba(21,48,12,0.35)] backdrop-blur-md"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map((n) => (
            <a
              key={n.l}
              href={n.href}
              className="rounded-full px-3.5 py-2 text-[14px] font-medium text-[#15300c] transition-colors hover:bg-[#15300c]/[0.06]"
              style={{ textDecoration: "none" }}
            >
              {n.l}
            </a>
          ))}
        </div>
      </motion.nav>
    </>
  );
}
