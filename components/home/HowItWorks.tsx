"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Check, Plus } from "lucide-react";
import SectionHead from "./SectionHead";
import Backdrop from "./Backdrop";
import PlatformIcon from "@/components/ui/PlatformIcon";
import { INTENT_EXAMPLES } from "./data";
import { scoreColor } from "@/lib/score";
import { cn } from "@/lib/utils";
import type { SignalPlatform } from "@/types";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    title: "Tell it what to listen for",
    body: "Add the phrases someone would actually write, like “looking for a CRM” or “need a logo designer”, and pick where to listen.",
  },
  {
    title: "It reads every new post",
    body: "Sparrow checks Reddit, Hacker News and Bluesky every 6 hours, or the moment you press scan.",
  },
  {
    title: "Each post gets a score",
    body: "AI rates how ready the person is, from 1 to 10, and tells you why in one line.",
  },
  {
    title: "You reply while it's fresh",
    body: "Copy a drafted reply, post it yourself, and move the lead along your Hunt Board.",
  },
];

const PLATFORMS: { p: SignalPlatform; label: string }[] = [
  { p: "reddit", label: "Reddit" },
  { p: "hackernews", label: "Hacker News" },
  { p: "bluesky", label: "Bluesky" },
];

const tile = "rounded-xl border border-white/8 bg-white/3";
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function StageKeywords() {
  const [typed, setTyped] = useState("");
  const text = "looking for a CRM";
  useEffect(() => {
    let alive = true;
    (async () => {
      for (let i = 0; i <= text.length && alive; i++) {
        setTyped(text.slice(0, i));
        await wait(55);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);
  const done = typed === text;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-12 items-center gap-3 rounded-xl border border-r1/40 bg-black/40 px-4 text-[15px] shadow-[0_0_0_4px_rgba(255,36,56,0.08)]">
        <Plus className="size-4 text-ink-3" />
        <span>{typed}</span>
        <span className="h-5 w-px animate-pulse bg-r1" />
      </div>
      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map((p, i) => (
          <span
            key={p.p}
            className={cn(
              "flex items-center gap-2 rounded-lg border border-white/8 px-3 py-1.5 text-[13px] text-ink-3 transition-all duration-500",
              done && "border-white/20 bg-white/4 text-ink",
            )}
            style={{ transitionDelay: `${i * 150}ms` }}
          >
            <PlatformIcon platform={p.p} size={13} />
            {p.label}
          </span>
        ))}
      </div>
      <div className={cn(tile, "mt-2 flex flex-col divide-y divide-white/6")}>
        {["need a logo designer", "alternative to Notion"].map((k) => (
          <div
            key={k}
            className="flex items-center justify-between px-4 py-3 text-[14px] text-ink-2"
          >
            {k}
            <span className="text-[12px] text-ink-3">listening</span>
          </div>
        ))}
        <div
          className={cn(
            "flex items-center justify-between px-4 py-3 text-[14px] opacity-0 transition-opacity duration-500",
            done && "opacity-100",
          )}
        >
          looking for a CRM
          <span className="flex items-center gap-1 text-[12px] text-green">
            <Check className="size-3.5" /> added
          </span>
        </div>
      </div>
    </div>
  );
}

function StageScan() {
  const [counts, setCounts] = useState([0, 0, 0]);
  const lineRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const target = [73, 18, 57];
    const state = { p: 0 };
    const tw = gsap.to(state, {
      p: 1,
      duration: 2.4,
      ease: "power2.out",
      onUpdate: () => setCounts(target.map((t) => Math.round(t * state.p))),
    });
    const line = gsap.fromTo(
      lineRef.current,
      { left: "0%", opacity: 1 },
      { left: "100%", opacity: 0, duration: 2.2, ease: "power1.inOut" },
    );
    return () => {
      tw.kill();
      line.kill();
    };
  }, []);
  return (
    <div className="relative flex flex-col gap-3 overflow-hidden">
      <div
        ref={lineRef}
        className="pointer-events-none absolute inset-y-0 z-1 w-px bg-r1 shadow-[0_0_16px_3px_rgba(255,36,56,0.55)]"
      />
      {PLATFORMS.map((r, i) => (
        <div
          key={r.p}
          className={cn(tile, "flex items-center gap-4 px-4 py-4")}
        >
          <span className="grid size-10 place-items-center rounded-lg bg-white/5">
            <PlatformIcon platform={r.p} size={20} />
          </span>
          <div className="flex-1">
            <b className="block text-[14.5px] font-medium">{r.label}</b>
            <small className="text-[12.5px] text-ink-3">
              new posts since last scan
            </small>
          </div>
          <span className="font-mono text-[22px] tabular-nums">
            {counts[i]}
          </span>
        </div>
      ))}
    </div>
  );
}

function StageScore() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOn(true), 80);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="flex flex-col gap-3">
      {INTENT_EXAMPLES.slice(0, 3).map((e, i) => (
        <div
          key={e.title}
          className={cn(tile, "flex items-center gap-4 px-4 py-3.5")}
        >
          <div className="relative size-12 flex-none">
            <svg viewBox="0 0 48 48" className="size-full -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="4"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke={scoreColor(e.score)}
                strokeWidth="4"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray="100"
                strokeDashoffset={on ? 100 - e.score * 10 : 100}
                className="transition-[stroke-dashoffset] duration-1000 ease-out"
                style={{
                  transitionDelay: `${i * 250}ms`,
                  filter: `drop-shadow(0 0 4px ${scoreColor(e.score)})`,
                }}
              />
            </svg>
            <span className="absolute inset-0 grid place-items-center font-mono text-[15px]">
              {e.score}
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-[14px]">{e.title}</p>
            <p className="mt-0.5 text-[12.5px] text-ink-3">{e.why}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function StageReply() {
  const [moved, setMoved] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMoved(true), 900);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="flex flex-col gap-4">
      <div className={cn(tile, "p-4")}>
        <p className="text-[12.5px] text-ink-3">Your reply, drafted</p>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-2">
          We moved our client portal off Notion last month. One link per client
          made the difference, happy to share how.
        </p>
        <span
          className={cn(
            "mt-3 inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[12px] transition-colors duration-500",
            moved ? "border-green/40 text-green" : "border-white/12 text-ink-3",
          )}
        >
          <Check className="size-3.5" />
          {moved ? "Copied" : "Copy reply"}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {["New", "Interested", "Talking", "Won"].map((c, i) => (
          <div
            key={c}
            className={cn(tile, "flex min-h-24 flex-col gap-1.5 p-2")}
          >
            <small className="text-[11px] text-ink-3">{c}</small>
            {((i === 0 && !moved) || (i === 2 && moved)) && (
              <span className="animate-[sp-row-in_0.5s_ease-out] rounded-md border border-r1/45 bg-r1/10 px-1.5 py-1 text-[11px] leading-tight shadow-[0_0_14px_-4px_rgba(255,36,56,0.6)]">
                r/SaaS · 9
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const STAGES = [StageKeywords, StageScan, StageScore, StageReply];

// background for the pinned section. everything reads --p (0 → 1 scroll progress)
// so it moves with the scroll instead of drifting past
function PinnedBackground({ active }: { active: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* dotted grid, fading out towards the edges */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.09)_1px,transparent_1px)] bg-size-[26px_26px] mask-[radial-gradient(70%_60%_at_60%_55%,black,transparent)]" />

      {/* glow that travels from behind the text to behind the panel */}
      <div
        className="absolute size-[640px] -translate-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,36,56,0.16),rgba(126,15,27,0.12)_45%,transparent)]"
        style={{
          left: "calc(22% + var(--p) * 48%)",
          top: "calc(68% - var(--p) * 18%)",
        }}
      />

      {/* radar rings behind the panel, turning as you scroll */}
      <svg
        viewBox="0 0 400 400"
        className="absolute top-[56%] left-[71%] size-[760px] -translate-1/2 opacity-70"
        style={{ rotate: "calc(var(--p) * 140deg)" }}
      >
        <circle
          cx="200"
          cy="200"
          r="196"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
        />
        <circle
          cx="200"
          cy="200"
          r="150"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeDasharray="2 8"
        />
        <circle
          cx="200"
          cy="200"
          r="104"
          fill="none"
          stroke="rgba(255,36,56,0.12)"
          strokeDasharray="40 14"
        />
        {Array.from({ length: 72 }, (_, i) => {
          const a = (i / 72) * Math.PI * 2;
          const r0 = i % 6 ? 188 : 180;
          return (
            <line
              key={i}
              x1={(200 + Math.cos(a) * r0).toFixed(2)}
              y1={(200 + Math.sin(a) * r0).toFixed(2)}
              x2={(200 + Math.cos(a) * 196).toFixed(2)}
              y2={(200 + Math.sin(a) * 196).toFixed(2)}
              stroke={i % 6 ? "rgba(255,255,255,0.08)" : "rgba(255,36,56,0.35)"}
            />
          );
        })}
        {/* progress arc: fills a quarter per step */}
        <circle
          cx="200"
          cy="200"
          r="196"
          fill="none"
          stroke="#FF2438"
          strokeWidth="1.5"
          pathLength={100}
          strokeDasharray="100"
          strokeDashoffset={100 - (active + 1) * 25}
          className="-rotate-90 transition-[stroke-dashoffset] duration-700 ease-out [transform-origin:200px_200px]"
          style={{ filter: "drop-shadow(0 0 6px #FF2438)" }}
        />
      </svg>
    </div>
  );
}

function StageFrame({
  active,
  children,
}: {
  active: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] p-6 shadow-[0_40px_90px_-50px_rgba(0,0,0,0.9)] backdrop-blur-sm md:p-8">
      <div className="mb-6 flex items-center gap-2">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full bg-white/8 transition-colors duration-500",
              i <= active && "bg-r1 shadow-[0_0_10px_rgba(255,36,56,0.5)]",
            )}
          />
        ))}
      </div>
      {children}
    </div>
  );
}

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const pinRef = useRef<HTMLDivElement>(null);

  // desktop: pin the section and step through as you scroll, both sides change together
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      ScrollTrigger.create({
        trigger: pinRef.current,
        start: "top top",
        end: `+=${STEPS.length * 70}%`,
        pin: true,
        onUpdate: (self) => {
          // --p drives the background layers so they move with the scroll
          pinRef.current?.style.setProperty("--p", self.progress.toFixed(4));
          setActive(
            Math.min(
              STEPS.length - 1,
              Math.floor(self.progress * STEPS.length),
            ),
          );
        },
      });
    });
    return () => mm.revert();
  });

  const Stage = STAGES[active];
  const step = STEPS[active];

  return (
    <section id="how" className="relative isolate">
      <Backdrop tint="#1a0a0f" />

      {/* desktop: pinned, both sides swap in place */}
      <div
        ref={pinRef}
        className="relative hidden min-h-svh flex-col justify-center overflow-hidden [--p:0] lg:flex"
      >
        <PinnedBackground active={active} />
        <div className="relative mx-auto w-full max-w-310 px-10 py-16">
          <SectionHead title="Set it up once. The leads come to you." />
          <div className="mt-14 grid grid-cols-[minmax(0,5fr)_minmax(0,6fr)] items-center gap-20">
            <div className="min-w-0">
              <div className="flex gap-2">
                {STEPS.map((s, i) => (
                  <span
                    key={s.title}
                    className={cn(
                      "grid size-9 place-items-center rounded-full border font-mono text-[13px] transition-all duration-500",
                      i === active
                        ? "border-r1 bg-r1 text-white shadow-[0_0_20px_-2px_rgba(255,36,56,0.7)]"
                        : i < active
                          ? "border-r1/40 text-r1"
                          : "border-white/12 text-ink-3",
                    )}
                  >
                    {i + 1}
                  </span>
                ))}
              </div>
              <div
                key={active}
                className="mt-10 animate-[sp-step-in_0.6s_cubic-bezier(.2,.8,.2,1)]"
              >
                <h3 className="font-display text-[clamp(30px,3vw,42px)] leading-tight">
                  {step.title}
                </h3>
                <p className="mt-4 max-w-[28em] text-[16.5px] leading-relaxed text-ink-2">
                  {step.body}
                </p>
              </div>
            </div>
            <div className="min-w-0">
              <StageFrame active={active}>
                <div
                  key={active}
                  className="min-h-82.5 animate-[sp-step-in_0.6s_cubic-bezier(.2,.8,.2,1)]"
                >
                  <Stage />
                </div>
              </StageFrame>
            </div>
          </div>
        </div>
      </div>

      {/* mobile: plain stacked steps */}
      <div className="mx-auto max-w-310 px-5 py-28 md:px-10 lg:hidden">
        <SectionHead title="Set it up once. The leads come to you." />
        <div className="mt-12 flex flex-col gap-14">
          {STEPS.map((s, i) => {
            const S = STAGES[i];
            return (
              <div key={s.title}>
                <span className="font-mono text-[13px] text-r1">
                  Step {i + 1}
                </span>
                <h3 className="mt-2 font-display text-[28px] leading-tight">
                  {s.title}
                </h3>
                <p className="mt-3 text-[15.5px] leading-relaxed text-ink-2">
                  {s.body}
                </p>
                <div className="mt-6">
                  <StageFrame active={i}>
                    <S />
                  </StageFrame>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
