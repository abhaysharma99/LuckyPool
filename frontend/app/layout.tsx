import type { Metadata } from "next";
import { Hanken_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const display = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-display",
  display: "swap",
});

const sans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LuckyPool — Prize-Linked Savings on Stellar",
  description:
    "Deposit USDC, keep your money safe, and win weekly prizes. No loss, just luck. Built on Stellar with Blend yield.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body style={{ fontFamily: "var(--font-sans), DM Sans, system-ui, sans-serif", color: "#15300c", background: "#fafdf8" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
