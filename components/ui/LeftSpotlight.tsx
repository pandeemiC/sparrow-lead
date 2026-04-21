"use client";

import { motion } from "motion/react";

const COLORS: Record<string, { bright: string; mid: string; far: string }> = {
  hot:  { bright: "rgba(220,20,20,0.22)",  mid: "rgba(160,0,0,0.12)",    far: "rgba(100,0,0,0.05)"   },
  warm: { bright: "rgba(210,90,10,0.18)",  mid: "rgba(160,60,0,0.1)",    far: "rgba(100,35,0,0.04)"  },
  cold: { bright: "rgba(40,90,220,0.18)",  mid: "rgba(25,60,170,0.1)",   far: "rgba(15,40,120,0.04)" },
};

export function LeftSpotlight({ variant }: { variant: "hot" | "warm" | "cold" }) {
  const c = COLORS[variant];

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[inherit]"
      style={{ zIndex: 0 }}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: variant === "hot" ? 4 : variant === "warm" ? 5 : 6, ease: "easeInOut", repeat: Infinity }}
    >
      <div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          background: `
            radial-gradient(ellipse 55% 70% at 0% 50%, ${c.bright} 0%, ${c.mid} 40%, ${c.far} 70%, transparent 100%)
          `,
        }}
      />
    </motion.div>
  );
}
