"use client";

import { motion } from "motion/react";

type Variant = "hot" | "warm" | "cold" | "unscored";

const COLORS: Record<Variant, { a: string; b: string; duration: number }> = {
  hot:      { a: "rgba(220,30,30,0.28)",   b: "rgba(180,0,0,0.1)",    duration: 3.5 },
  warm:     { a: "rgba(210,100,10,0.22)",  b: "rgba(160,60,0,0.08)",  duration: 4.5 },
  cold:     { a: "rgba(50,90,220,0.22)",   b: "rgba(30,60,180,0.08)", duration: 5.5 },
  unscored: { a: "rgba(255,255,255,0.06)", b: "transparent",          duration: 5   },
};

function Spotlight({ variant, position }: { variant: Variant; position: "top" | "bottom" }) {
  const c = COLORS[variant];
  const at = position === "bottom" ? "50% 100%" : "50% 0%";
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit]"
      style={{ zIndex: 0 }}
      animate={{ opacity: [0.55, 1, 0.55] }}
      transition={{ duration: c.duration, ease: "easeInOut", repeat: Infinity }}
    >
      <div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          background: `radial-gradient(ellipse 75% 52% at ${at}, ${c.a} 0%, ${c.b} 50%, transparent 80%)`,
        }}
      />
    </motion.div>
  );
}

export function BottomSpotlight({ variant }: { variant: Variant }) {
  return <Spotlight variant={variant} position="bottom" />;
}

export function TopSpotlight({ variant }: { variant: Variant }) {
  return <Spotlight variant={variant} position="top" />;
}
