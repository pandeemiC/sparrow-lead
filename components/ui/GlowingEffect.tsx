"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";

interface Props {
  spread?: number;
  borderWidth?: number;
  proximity?: number;
  color?: string;
  disabled?: boolean;
}

export function GlowingEffect({
  spread = 60,
  borderWidth = 1,
  proximity = 80,
  color = "rgba(255,255,255,0.55)",
  disabled = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(-9999);
  const mouseY = useMotionValue(-9999);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (disabled) return;
    const el = ref.current?.parentElement as HTMLElement | null;
    if (!el) return;

    function onMove(e: MouseEvent) {
      const r = el!.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const near =
        x >= -proximity && x <= r.width + proximity &&
        y >= -proximity && y <= r.height + proximity;
      setVisible(near);
      if (near) {
        mouseX.set(x);
        mouseY.set(y);
      }
    }

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [disabled, proximity, mouseX, mouseY]);

  const gradient = useMotionTemplate`radial-gradient(${spread}px circle at ${mouseX}px ${mouseY}px, ${color}, transparent 85%)`;

  if (disabled) return null;

  return (
    <motion.div
      ref={ref}
      className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
      style={{
        opacity: visible ? 1 : 0,
        background: gradient,
        padding: borderWidth,
        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
      }}
    />
  );
}
