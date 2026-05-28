import { Logo } from "./ui/Logo";

export function Footer() {
  return (
    <footer className="border-t border-[#CFE7BD]" style={{ background: "#fafdf8" }}>
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-2 md:px-8">
        <div>
          <Logo size={24} showText />
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed" style={{ color: "#46663A" }}>
            Prize-linked savings on Stellar. Deposit USDC, earn yield, win weekly — your principal is always safe.
          </p>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: "#557050" }}>Links</div>
          <ul className="mt-4 space-y-2.5 text-[13px]">
            {[
              { label: "Discord", href: "https://discord.gg/luckypool", external: true },
              { label: "X @luckypool", href: "https://x.com/luckypool", external: true },
              { label: "Docs", href: "/docs", external: false },
              { label: "Audit report", href: "/audit", external: false },
            ].map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noreferrer" : undefined}
                  style={{ color: "#46663A", textDecoration: "none" }}
                  className="underline-offset-4 transition hover:underline"
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#15300c")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#46663A")}
                >
                  {item.label}
                  {item.external && " ↗"}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-[#CFE7BD] px-6 py-6 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-[11px]" style={{ color: "#557050" }}>
          <span>© 2026 LuckyPool</span>
          <span>No loss. Just luck.</span>
        </div>
      </div>
    </footer>
  );
}
