import Image from "next/image";
import { LogoMark } from "@/components/ui/Logo";

const INK = "#15300c";
const INK_MID = "#3d7a29";

function Confetti({
  x,
  y,
  rotate,
  color,
  w = 22,
  h = 10,
  opacity = 0.5,
}: {
  x: number;
  y: number;
  rotate: number;
  color: string;
  w?: number;
  h?: number;
  opacity?: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 3,
        background: color,
        opacity,
        transform: `rotate(${rotate}deg)`,
      }}
    />
  );
}

export default function ThumbnailPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#dcdcdc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 16px",
      }}
    >
      {/* 1280x720 — 16:9 export canvas */}
      <div
        style={{
          position: "relative",
          width: 1280,
          height: 720,
          overflow: "hidden",
          background:
            "radial-gradient(120% 90% at 12% -5%, #e6f9d6 0%, #f7fcf2 50%, #e8f9d8 100%)",
          fontFamily: "var(--font-sans), DM Sans, system-ui, sans-serif",
        }}
      >
        {/* decorative "tickets" — clustered around the logo/tagline lockup */}
        <Confetti x={100} y={222} rotate={-18} color="#D4A017" opacity={0.35} />
        <Confetti x={606} y={240} rotate={16} color="#7A5AF8" opacity={0.28} />
        <Confetti x={556} y={378} rotate={-12} color="#D4A017" opacity={0.3} />
        <Confetti x={92} y={462} rotate={12} color="#3d7a29" opacity={0.22} />

        {/* decorative "tickets" — clustered around the right-half LuckyPool mark */}
        <Confetti x={800} y={195} rotate={-14} color="#7A5AF8" opacity={0.3} />
        <Confetti x={1060} y={228} rotate={18} color="#D4A017" opacity={0.32} />
        <Confetti x={790} y={500} rotate={12} color="#D4A017" opacity={0.28} />
        <Confetti x={1050} y={490} rotate={-10} color="#3d7a29" opacity={0.2} />

        {/* two-column split, both halves inside a ~130px safe margin so edge-cropping displays never clip content */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* left half — identity + claim */}
          <div
            style={{
              flex: "1 1 50%",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 28,
              paddingLeft: 156,
              paddingRight: 36,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <LogoMark size={64} />
              <span
                style={{
                  fontFamily: "var(--font-display), Hanken Grotesk, system-ui, sans-serif",
                  fontWeight: 800,
                  fontSize: 78,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  color: INK,
                }}
              >
                luckypool
              </span>
            </div>

            <p
              style={{
                margin: 0,
                textAlign: "left",
                fontSize: 32,
                fontWeight: 500,
                letterSpacing: "-0.01em",
                lineHeight: 1.4,
                color: INK_MID,
                maxWidth: 480,
                paddingLeft: 14,
              }}
            >
              No-loss prize savings on Stellar.
            </p>

            {/* "Built on Stellar" — rounded chip, mark trails the word "Stellar" */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                borderRadius: 999,
                border: `1px solid ${INK}26`,
                background: "rgba(255,255,255,0.55)",
                padding: "12px 22px",
                backdropFilter: "blur(6px)",
                marginLeft: 26,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display), Hanken Grotesk, system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: 22,
                  letterSpacing: "-0.01em",
                  lineHeight: 1,
                  color: INK,
                }}
              >
                Built on Stellar
              </span>
              <Image
                src="/stellar-mark.png"
                alt="Stellar"
                width={20}
                height={17}
                style={{ opacity: 0.9 }}
              />
            </div>
          </div>

          {/* right half — the network mark, given room to breathe */}
          <div
            style={{
              flex: "1 1 50%",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingRight: 112,
              paddingLeft: 36,
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 460,
                height: 460,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(202,255,184,0.35) 55%, rgba(202,255,184,0) 75%)",
                filter: "blur(2px)",
              }}
            />
            <div style={{ position: "relative" }}>
              <LogoMark size={300} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
