"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import SectionHead from "./SectionHead";
import Backdrop from "./Backdrop";
import PlatformIcon from "@/components/ui/PlatformIcon";
import { INTENT_EXAMPLES } from "./data";
import { scoreColor, scoreLabel } from "@/lib/score";
import { cn } from "@/lib/utils";

const CYCLE_MS = 4000;
const C = 100;
const pt = (deg: number, r: number) => [
  C + r * Math.cos((deg * Math.PI) / 180),
  C + r * Math.sin((deg * Math.PI) / 180),
];
// arc on the 270° dial, f0/f1 are 0..1 along it
const arc = (r: number, f0: number, f1: number) => {
  const a0 = 135 + 270 * f0;
  const a1 = 135 + 270 * f1;
  const [x0, y0] = pt(a0, r);
  const [x1, y1] = pt(a1, r);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
};
const ZONES: [number, number, string, string][] = [
  [0, 0.4, "rgba(247,242,242,0.3)", "Cold 1–4"],
  [0.4, 0.7, "#F6C148", "Warm 5–7"],
  [0.7, 1, "#FF2438", "Hot 8–10"],
];

function BigDial({ score }: { score: number }) {
  const numRef = useRef<HTMLSpanElement>(null);
  const color = scoreColor(score);
  useEffect(() => {
    const el = numRef.current;
    if (!el) return;
    const from = { v: Number(el.textContent) || 0 };
    const tw = gsap.to(from, {
      v: score,
      duration: 0.9,
      ease: "power3.out",
      onUpdate: () => (el.textContent = String(Math.round(from.v))),
    });
    return () => {
      tw.kill();
    };
  }, [score]);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-95">
      <svg viewBox="0 0 200 200" className="size-full overflow-visible">
        {ZONES.map(([a, b, c]) => (
          <path
            key={c}
            d={arc(96, a + 0.006, b - 0.006)}
            stroke={c}
            strokeWidth="2"
            fill="none"
            opacity="0.8"
          />
        ))}
        {Array.from({ length: 11 }, (_, i) => {
          const [x0, y0] = pt(135 + 27 * i, 99);
          const [x1, y1] = pt(135 + 27 * i, 104);
          return (
            <line
              key={i}
              x1={x0.toFixed(2)}
              y1={y0.toFixed(2)}
              x2={x1.toFixed(2)}
              y2={y1.toFixed(2)}
              stroke="rgba(255,255,255,0.25)"
            />
          );
        })}
        <path
          d={arc(82, 0, 1)}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d={arc(82, 0, 1)}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="100"
          strokeDashoffset={100 - score * 10}
          style={{
            filter: `drop-shadow(0 0 10px ${color})`,
            transition:
              "stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1), stroke .5s",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pb-[6%]">
        <span
          ref={numRef}
          className="mb-5 font-display text-[clamp(88px,10vw,120px)] leading-none [font-variant-numeric:lining-nums] transition-colors duration-500"
          style={{
            color,
            textShadow: `0 0 50px color-mix(in oklab, ${color} 50%, transparent)`,
          }}
        >
          0
        </span>
        <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[12.5px] text-ink-2">
          intent · {scoreLabel(score).toLowerCase()}
        </span>
      </div>
    </div>
  );
}

export default function IntentScore() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  // progress bar on the open card drives the 4 second rotation
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    tweenRef.current = gsap.fromTo(
      bar,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: CYCLE_MS / 1000,
        ease: "none",
        onComplete: () => setActive((a) => (a + 1) % INTENT_EXAMPLES.length),
      },
    );
    return () => {
      tweenRef.current?.kill();
    };
  }, [active]);

  useEffect(() => {
    if (paused) tweenRef.current?.pause();
    else tweenRef.current?.resume();
  }, [paused, active]);

  const current = INTENT_EXAMPLES[active];

  return (
    <section className="relative isolate py-28 md:py-36">
      <Backdrop tint="#160a0d">
        <div
          className="absolute top-[58%] left-[25%] size-160 -translate-1/2 rounded-full opacity-70 blur-3xl transition-colors duration-700"
          style={{
            background: `radial-gradient(closest-side, color-mix(in oklab, ${scoreColor(current.score)} 20%, transparent), transparent)`,
          }}
        />
      </Backdrop>
      <div className="relative mx-auto max-w-310 px-5 md:px-10">
        <SectionHead
          title="One number for how ready they are."
          intro="Every post gets an intent score from 1 to 10 and a one-line reason, so you know who to answer first."
        />

        <div className="mt-14 grid items-center gap-14 lg:grid-cols-2">
          <div className="min-w-0">
            <BigDial score={current.score} />
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {ZONES.map(([, , c, label]) => (
                <span
                  key={label}
                  className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[12px] text-ink-2"
                >
                  <i
                    className="size-1.5 rounded-full"
                    style={{ background: c }}
                  />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div
            className="flex min-w-0 flex-col gap-2.5"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {INTENT_EXAMPLES.map((e, i) => {
              const open = i === active;
              const color = scoreColor(e.score);
              return (
                <button
                  key={e.title}
                  onClick={() => setActive(i)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border text-left transition-[border-color,background-color] duration-500",
                    open
                      ? "border-transparent"
                      : "border-white/7 hover:border-white/14",
                  )}
                  style={
                    open
                      ? {
                          background: `linear-gradient(135deg, color-mix(in oklab, ${color} 10%, #160b0e), #120a0c) padding-box, linear-gradient(135deg, color-mix(in oklab, ${color} 60%, transparent), rgba(255,255,255,0.06)) border-box`,
                        }
                      : undefined
                  }
                >
                  <div className="flex items-center gap-3 px-5 py-4">
                    <span className="grid size-8 flex-none place-items-center rounded-lg bg-white/5">
                      <PlatformIcon platform={e.platform} size={14} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[14px] text-ink-2">
                      {open ? `${e.source} · ${e.ago} ago` : e.title}
                    </span>
                    <span
                      className="grid h-7 min-w-7 place-items-center rounded-lg px-1.5 font-mono text-[13px]"
                      style={{
                        color,
                        background: `color-mix(in oklab, ${color} 14%, transparent)`,
                      }}
                    >
                      {e.score}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-500 ease-out",
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 pb-5">
                        <p className="font-display text-[20px] leading-snug text-ink">
                          “{e.title}”
                        </p>
                        <p className="mt-3 text-[13.5px] text-ink-2">
                          <span style={{ color }}>{e.type}.</span> {e.why}
                        </p>
                      </div>
                    </div>
                  </div>
                  {open && (
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/5">
                      <div
                        ref={barRef}
                        className="h-full origin-left"
                        style={{ background: color }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
