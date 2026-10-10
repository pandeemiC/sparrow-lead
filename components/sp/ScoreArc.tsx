"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { scoreColor, scoreLabel, scoreTier, type ScoreTier } from "@/lib/score";
import { cn } from "@/lib/utils";

// glow strength per tier: arc glow, glow opacity, number glow, dial halo
const GLOW: Record<ScoreTier, Record<string, string>> = {
  hi: { "--gw": "5px", "--ga": "85%", "--ts": "10px", "--hz": "22%" },
  md: { "--gw": "2px", "--ga": "45%", "--ts": "5px", "--hz": "10%" },
  lo: { "--gw": "0px", "--ga": "0%", "--ts": "0px", "--hz": "0%" },
};

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
  className,
}: {
  score: number | null;
  size?: "mini" | "dial";
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const value = score ?? 0;
  const radius = size === "dial" ? 32 : 11.5;
  const center = size === "dial" ? 40 : 14;
  const length = radius * 1.5 * Math.PI;
  const d = arcPath(radius, center);

  useGSAP(
    () => {
      const arc = ref.current?.querySelector("[data-arc]");
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
  const dial = size === "dial";
  const stroke = dial ? 4 : 3;

  return (
    <div
      ref={ref}
      className={cn(
        "relative grid flex-none place-items-center",
        dial
          ? "size-20 self-start rounded-full before:absolute before:inset-4 before:rounded-full before:bg-[radial-gradient(circle,color-mix(in_oklab,var(--dc)_var(--hz,0%),transparent),transparent_70%)]"
          : "size-7",
        className,
      )}
      style={
        {
          "--dc": scoreColor(score),
          ...GLOW[scoreTier(score)],
        } as React.CSSProperties
      }
      title={score === null ? "Not scored" : `Intent ${score}/10`}
    >
      <svg
        viewBox={`0 0 ${box} ${box}`}
        className="absolute inset-0 overflow-visible"
      >
        <path
          d={d}
          fill="none"
          strokeLinecap="round"
          strokeWidth={stroke}
          className="stroke-white/8"
        />
        <path
          data-arc
          d={d}
          fill="none"
          strokeLinecap="round"
          strokeWidth={stroke}
          strokeDasharray={length}
          strokeDashoffset={length * (1 - value / 10)}
          className="stroke-(--dc) [filter:drop-shadow(0_0_var(--gw)_color-mix(in_oklab,var(--dc)_var(--ga),transparent))]"
        />
      </svg>
      <b
        data-num
        className={cn(
          "font-mono font-semibold text-(--dc)",
          dial
            ? "relative -mt-0.5 text-[26px] leading-none [text-shadow:0_0_calc(var(--ts)*1.6)_color-mix(in_oklab,var(--dc)_70%,transparent)]"
            : "text-[11px] leading-none [text-shadow:0_0_var(--ts)_color-mix(in_oklab,var(--dc)_70%,transparent)]",
        )}
      >
        {score ?? "–"}
      </b>
      {dial && (
        <small className="absolute bottom-px left-1/2 -translate-x-1/2 rounded-full border border-[color-mix(in_oklab,var(--dc)_35%,transparent)] bg-[#120a0b] px-1.5 py-0.75 font-mono text-[8.5px] leading-none font-semibold tracking-[0.18em] text-(--dc)">
          {scoreLabel(score)}
        </small>
      )}
    </div>
  );
}
