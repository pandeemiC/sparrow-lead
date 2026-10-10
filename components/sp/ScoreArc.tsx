"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { scoreColor, scoreLabel, scoreTier } from "@/lib/score";

function arcPath(radius: number, center: number) {
  const startX = center + radius * Math.cos(Math.PI * 0.75);
  const startY = center + radius * Math.sin(Math.PI * 0.75);
  const endX = center + radius * Math.cos(Math.PI * 0.25);
  return `M${startX.toFixed(2)} ${startY.toFixed(2)} A${radius} ${radius} 0 1 1 ${endX.toFixed(2)} ${startY.toFixed(2)}`;
}

export default function ScoreArc({
  score,
  size = "mini",
  delay = 0,
}: {
  score: number | null;
  size?: "mini" | "dial";
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const value = score ?? 0;
  const radius = size === "dial" ? 32 : 11.5;
  const center = size === "dial" ? 40 : 14;
  const length = radius * 1.5 * Math.PI;
  const d = arcPath(radius, center);

  useGSAP(
    () => {
      const arc = ref.current?.querySelector(".on");
      if (arc) {
        gsap.fromTo(
          arc,
          { strokeDashoffset: length },
          {
            strokeDashoffset: length * (1 - value / 10),
            duration: 1,
            delay,
            ease: "power3.out",
          },
        );
      }
      const num = ref.current?.querySelector("[data-num]");
      if (num) {
        const counter = { v: 0 };
        gsap.to(counter, {
          v: value,
          duration: 0.8,
          delay,
          ease: "power2.out",
          onUpdate: () => {
            num.textContent = String(Math.round(counter.v));
          },
        });
      }
    },
    { scope: ref, dependencies: [value] },
  );

  const box = size === "dial" ? 80 : 28;

  return (
    <div
      ref={ref}
      className={`${size === "dial" ? "sp-dial" : "sp-mini"} ${scoreTier(score)}`}
      style={{ "--dc": scoreColor(score) } as React.CSSProperties}
      title={score === null ? "Not scored" : `Intent ${score}/10`}
    >
      <svg viewBox={`0 0 ${box} ${box}`}>
        <path d={d} />
        <path
          className="on"
          d={d}
          strokeDasharray={length}
          strokeDashoffset={length * (1 - value / 10)}
        />
      </svg>
      <b data-num>{score ?? "–"}</b>
      {size === "dial" && <small>{scoreLabel(score)}</small>}
    </div>
  );
}
