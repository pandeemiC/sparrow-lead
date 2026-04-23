"use client";

import { motion } from "motion/react";

type Variant = "hot" | "warm" | "cold" | "unscored";

const COLORS: Record<Variant, { a: string; b: string; duration: number }> = {
  hot:      { a: "rgba(220,30,30,0.28)",   b: "rgba(180,0,0,0.1)",    duration: 3.5 },
  warm:     { a: "rgba(210,100,10,0.22)",  b: "rgba(160,60,0,0.08)",  duration: 4.5 },
  cold:     { a: "rgba(50,90,220,0.22)",   b: "rgba(30,60,180,0.08)", duration: 5.5 },
  unscored: { a: "rgba(255,255,255,0.06)", b: "transparent",          duration: 5   },
};

type Position = "top" | "bottom" | "left" | "right";

const GRADIENT: Record<Position, (a: string, b: string) => string> = {
  top:    (a, b) => `radial-gradient(ellipse 75% 52% at 50% 0%,   ${a} 0%, ${b} 50%, transparent 80%)`,
  bottom: (a, b) => `radial-gradient(ellipse 75% 52% at 50% 100%, ${a} 0%, ${b} 50%, transparent 80%)`,
  left:   (a, b) => `radial-gradient(ellipse 52% 75% at 0%  50%,  ${a} 0%, ${b} 50%, transparent 80%)`,
  right:  (a, b) => `radial-gradient(ellipse 52% 75% at 100% 50%, ${a} 0%, ${b} 50%, transparent 80%)`,
};

function Spotlight({ variant, position }: { variant: Variant; position: Position }) {
  const c = COLORS[variant];
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
        style={{ background: GRADIENT[position](c.a, c.b) }}
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

export function LeftSpotlight({ variant }: { variant: Variant }) {
  return <Spotlight variant={variant} position="left" />;
}

export function RightSpotlight({ variant }: { variant: Variant }) {
  return <Spotlight variant={variant} position="right" />;
}
