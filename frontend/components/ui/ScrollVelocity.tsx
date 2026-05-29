"use client";

import React, { useRef, useLayoutEffect, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
} from "framer-motion";

interface VelocityTextProps {
  children: React.ReactNode;
  baseVelocity: number;
  className?: string;
  damping?: number;
  stiffness?: number;
  numCopies?: number;
}

function useElementWidth(ref: React.RefObject<HTMLElement>): number {
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    function update() {
      if (ref.current) setWidth(ref.current.offsetWidth);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [ref]);
  return width;
}

function wrap(min: number, max: number, v: number): number {
  const range = max - min;
  return (((v - min) % range) + range) % range + min;
}

function VelocityText({ children, baseVelocity, className = "", damping = 50, stiffness = 400, numCopies = 6 }: VelocityTextProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping, stiffness });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 3], { clamp: false });
  const copyRef = useRef<HTMLSpanElement>(null);
  const copyWidth = useElementWidth(copyRef as React.RefObject<HTMLElement>);
  const x = useTransform(baseX, (v) => copyWidth === 0 ? "0px" : `${wrap(-copyWidth, 0, v)}px`);
  const directionFactor = useRef<number>(1);

  useAnimationFrame((_t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    if (velocityFactor.get() < 0) directionFactor.current = -1;
    else if (velocityFactor.get() > 0) directionFactor.current = 1;
    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div style={{ overflow: "hidden", position: "relative" }}>
      <motion.div style={{ x, display: "flex", whiteSpace: "nowrap" }}>
        {Array.from({ length: numCopies }).map((_, i) => (
          <span key={i} ref={i === 0 ? copyRef : null} className={className}>
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

interface ScrollVelocityProps {
  texts: string[];
  velocity?: number;
  className?: string;
}

export function ScrollVelocity({ texts, velocity = 60, className = "" }: ScrollVelocityProps) {
  return (
    <section style={{ overflow: "hidden" }}>
      {texts.map((text, i) => (
        <VelocityText key={i} baseVelocity={i % 2 !== 0 ? -velocity : velocity} className={className}>
          {text}&nbsp;
        </VelocityText>
      ))}
    </section>
  );
}
