"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function CountUp({
  value,
  decimals = 0,
  delay = 0.2,
}: {
  value: number;
  decimals?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const counter = { v: 0 };
      gsap.to(counter, {
        v: value,
        duration: 1,
        delay,
        ease: "power2.out",
        onUpdate: () => {
          if (ref.current)
            ref.current.textContent = counter.v.toFixed(decimals);
        },
      });
    },
    { dependencies: [value] },
  );

  return <span ref={ref}>{value.toFixed(decimals)}</span>;
}
