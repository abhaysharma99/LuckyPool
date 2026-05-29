"use client";

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export function LogoMark({ size = 26 }: { size?: number }) {
  // LP mark: a 4-pointed star/diamond shape in brand dark green — clean, single-color
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M24 2 C24 2 26 16 30 20 C34 24 48 24 48 24 C48 24 34 24 30 28 C26 32 24 46 24 46 C24 46 22 32 18 28 C14 24 0 24 0 24 C0 24 14 24 18 20 C22 16 24 2 24 2 Z"
        fill="#15300c"
      />
    </svg>
  );
}

export function Logo({ size = 26, showText = true }: LogoProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <LogoMark size={size} />
      {showText && (
        <span
          style={{
            fontFamily: "var(--font-display), system-ui",
            fontWeight: 600,
            fontSize: Math.round(size * 0.73),
            letterSpacing: "-0.01em",
            color: "#15300c",
            lineHeight: 1,
          }}
        >
          luckypool
        </span>
      )}
    </div>
  );
}
