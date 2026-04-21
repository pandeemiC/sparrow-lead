"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, animate } from "motion/react";

interface GlowingEffectProps {
  color?: string;
  spread?: number;
  borderWidth?: number;
  disabled?: boolean;
}

export function GlowingEffect({
  color = "rgba(255,255,255,0.8)",
  spread = 60,
  borderWidth = 1,
  disabled = false,
}: GlowingEffectProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    if (disabled) return;
    const el = ref.current?.parentElement;
    if (!el) return;

    function onMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    }

    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, [disabled, mouseX, mouseY]);

  const background = useMotionTemplate`radial-gradient(${spread}px circle at ${mouseX}px ${mouseY}px, ${color}, transparent 80%)`;

  if (disabled) return null;

  return (
    <motion.div
      ref={ref}
      className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      style={{
        background,
        zIndex: 0,
        padding: borderWidth,
        WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
      }}
    />
  );
}
