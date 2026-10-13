"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  EyeOff,
  Layers,
  MessageCircle,
  MessageSquareOff,
  Radar,
  Send,
  type LucideIcon,
} from "lucide-react";
import SectionHead from "./SectionHead";
import Backdrop, { Glow } from "./Backdrop";
import PlatformIcon from "@/components/ui/PlatformIcon";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const POST =
  "Looking for a designer for a small SaaS landing page, budget ready.";

// the fork is drawn in a 1000 x 520 box; lanes sit at these heights
const H = 520;
const TOP_Y = 150;
const BOT_Y = 370;
const pct = (y: number) => `${(y / H) * 100}%`;
const PLAY_FROM = 27;
const PLAY_TO = 96;

// where each moment sits along the time axis (percent of the width)
const STOPS = [
  { x: 50, time: "Next scan" },
  { x: 64, time: "Minutes later" },
  { x: 78, time: "Same day" },
  { x: 92, time: "Next day" },
];

type Moment = { icon: LucideIcon | null; title: string; body: string };

const WITH: Moment[] = [
  {
    icon: Radar,
    title: "Found",
    body: "Matched your keyword on the next scan",
  },
  { icon: null, title: "Scored 9", body: "Ready to hire, budget mentioned" },
  { icon: Send, title: "You replied", body: "Edited the draft and posted it" },
  {
    icon: MessageCircle,
    title: "They answered",
    body: "“Can you send a quote?”",
  },
];

const WITHOUT: Moment[] = [
  { icon: Layers, title: "38 newer posts", body: "Pushed below the fold" },
  { icon: EyeOff, title: "214 newer posts", body: "Nobody scrolls this far" },
  {
    icon: MessageSquareOff,
    title: "No replies",
    body: "The thread goes quiet",
  },
  { icon: null, title: "Gone", body: "They picked someone else" },
];

const TOP_LANE = `M262 260 C 330 260, 330 ${TOP_Y}, 400 ${TOP_Y} L 990 ${TOP_Y}`;
const BOT_LANE = `M262 260 C 330 260, 330 ${BOT_Y}, 400 ${BOT_Y} L 990 ${BOT_Y}`;

function OriginPost() {
  return (
    <div className="rounded-2xl border border-white/12 bg-[#170b0e] p-4 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.9)]">
      <div className="flex items-center gap-2 text-[12px] text-ink-3">
        <span className="grid size-6 place-items-center rounded-md bg-[color-mix(in_oklab,var(--rd)_16%,transparent)]">
          <PlatformIcon platform="reddit" size={12} />
        </span>
        r/webdev · just posted
      </div>
      <p className="mt-2.5 text-[14.5px] leading-snug">{POST}</p>
    </div>
  );
}

function Event({
  item,
  good,
  className,
  style,
}: {
  item: Moment;
  good: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Icon = item.icon;
  return (
    <div
      data-ev
      style={style}
      className={cn(
        "rounded-xl border p-3 opacity-0",
        good
          ? "border-r1/30 bg-[linear-gradient(180deg,rgba(255,36,56,0.12),rgba(23,11,14,0.95))] shadow-[0_14px_40px_-18px_rgba(255,36,56,0.55)]"
          : "border-white/7 bg-[#100809]",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 text-[13px] font-medium",
          good ? "text-ink" : "text-ink-3",
        )}
      >
        {Icon ? (
          <Icon className={cn("size-3.5", good ? "text-r1" : "text-ink-3")} />
        ) : good ? (
          <span className="grid size-5 place-items-center rounded-full border border-r1 font-mono text-[10px] text-r1 shadow-[0_0_8px_rgba(255,36,56,0.6)]">
            9
          </span>
        ) : (
          <span className="size-2 rounded-full bg-white/20" />
        )}
        {item.title}
      </div>
      <p
        className={cn(
          "mt-1 text-[12px] leading-snug",
          good ? "text-ink-2" : "text-ink-3",
        )}
      >
        {item.body}
      </p>
    </div>
  );
}

export default function BuyerPost() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // desktop: plays once by itself when the fork scrolls into view
      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          const T = 5;
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: "[data-fork]",
              start: "top 70%",
              once: true,
            },
          });
          tl.fromTo(
            "[data-playhead]",
            { left: `${PLAY_FROM}%` },
            { left: `${PLAY_TO}%`, duration: T },
            0,
          );
          // draw both lanes in step with the playhead
          const lanes = gsap.utils.toArray<SVGPathElement>("[data-lane]");
          const draw = { p: 0 };
          tl.to(
            draw,
            {
              p: 1,
              duration: T,
              onUpdate: () =>
                lanes.forEach((l) =>
                  l.setAttribute("stroke-dashoffset", String(1 - draw.p)),
                ),
            },
            0,
          );
          gsap.utils
            .toArray<HTMLElement>("[data-fork] [data-col]")
            .forEach((col) => {
              const x = Number(col.dataset.col);
              const at = ((x - PLAY_FROM) / (PLAY_TO - PLAY_FROM)) * T - 0.1;
              tl.to(
                col.querySelectorAll("[data-ev]"),
                { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" },
                at,
              ).to(
                col.querySelectorAll("[data-tick]"),
                { opacity: 1, scale: 1, duration: 0.15 },
                at,
              );
            });
          tl.to("[data-endings]", { opacity: 1, duration: 0.3 }, T - 0.2);
        },
      );

      // phones: plays once when it scrolls into view
      mm.add(
        "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.to("[data-mfork] [data-ev]", {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.18,
            ease: "power2.out",
            scrollTrigger: {
              trigger: "[data-mfork]",
              start: "top 70%",
              once: true,
            },
          });
        },
      );

      // reduced motion: just show how it ends
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-ev], [data-tick], [data-endings]", {
          opacity: 1,
          scale: 1,
          y: 0,
        });
        gsap.utils
          .toArray<SVGPathElement>("[data-lane]")
          .forEach((l) => l.setAttribute("stroke-dashoffset", "0"));
        gsap.set("[data-playhead]", { left: `${PLAY_TO}%` });
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="relative isolate py-28 md:py-36">
      <Backdrop tint="#0f0709">
        <Glow
          className="top-[40%] left-1/2 h-95 w-[70%] -translate-x-1/2"
          color="rgba(255,36,56,0.09)"
        />
      </Backdrop>
      <div className="mx-auto max-w-310 px-5 md:px-10">
        <SectionHead
          title="Same post, two very different endings."
          intro="Someone needs exactly what you do. Follow their post with Sparrow listening, and without."
        />

        {/* desktop fork */}
        <div data-fork className="relative mt-14 hidden h-130 lg:block">
          <svg
            viewBox={`0 0 1000 ${H}`}
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 size-full overflow-visible"
          >
            <defs>
              <linearGradient id="lane-good" x1="0" x2="1">
                <stop offset="0" stopColor="#FF2438" stopOpacity="0.4" />
                <stop offset="1" stopColor="#FF2438" />
              </linearGradient>
            </defs>
            <path
              d={TOP_LANE}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={BOT_LANE}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              vectorEffect="non-scaling-stroke"
            />
            <path
              data-lane
              d={TOP_LANE}
              fill="none"
              stroke="url(#lane-good)"
              strokeWidth="2"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="1"
              style={{ filter: "drop-shadow(0 0 6px rgba(255,36,56,0.8))" }}
            />
            <path
              data-lane
              d={BOT_LANE}
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.5"
              strokeDasharray="1"
              pathLength={1}
              strokeDashoffset="1"
            />
          </svg>

          <div className="absolute top-1/2 left-0 w-[25%] -translate-y-1/2">
            <OriginPost />
          </div>

          <span
            className="absolute left-[32%] -translate-y-full pb-2 text-[13px] font-medium whitespace-nowrap text-r1"
            style={{ top: pct(TOP_Y) }}
          >
            With Sparrow
          </span>
          <span
            className="absolute left-[32%] pt-2 text-[13px] whitespace-nowrap text-ink-3"
            style={{ top: pct(BOT_Y) }}
          >
            Without
          </span>

          {STOPS.map((s, i) => (
            <div
              key={s.time}
              data-col={s.x}
              className="absolute inset-y-0"
              style={{ left: `${s.x}%` }}
            >
              <span className="absolute top-1/2 left-0 -translate-1/2 rounded-full border border-white/8 bg-[#0f0709] px-2.5 py-1 text-[11.5px] whitespace-nowrap text-ink-3">
                {s.time}
              </span>
              <span
                data-tick
                className="absolute left-0 size-2.5 -translate-1/2 scale-0 rounded-full bg-r1 opacity-0 shadow-[0_0_12px_var(--r1)]"
                style={{ top: pct(TOP_Y) }}
              />
              <span
                data-tick
                className="absolute left-0 size-2 -translate-1/2 scale-0 rounded-full bg-white/40 opacity-0"
                style={{ top: pct(BOT_Y) }}
              />
              {/* event above the top lane and below the bottom lane */}
              <div
                className="absolute left-0 w-37.5 -translate-x-1/2 pb-4"
                style={{ bottom: `calc(100% - ${pct(TOP_Y)})` }}
              >
                <Event item={WITH[i]} good className="translate-y-2" />
              </div>
              <div
                className="absolute left-0 w-37.5 -translate-x-1/2 pt-4"
                style={{ top: pct(BOT_Y) }}
              >
                <Event
                  item={WITHOUT[i]}
                  good={false}
                  className="-translate-y-2"
                />
              </div>
            </div>
          ))}

          <div
            data-playhead
            className="pointer-events-none absolute inset-y-[4%] w-px bg-linear-to-b from-transparent via-white/45 to-transparent"
            style={{ left: `${PLAY_FROM}%` }}
          />

          <div
            data-endings
            className="absolute right-0 -bottom-4 left-[27%] flex justify-end gap-3 opacity-0"
          >
            <span className="rounded-full border border-green/35 bg-green/8 px-3 py-1.5 text-[12.5px] text-[#7be3a0]">
              With Sparrow, you&apos;re in the conversation
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1.5 text-[12.5px] text-ink-3">
              Without, the lead is gone
            </span>
          </div>
        </div>

        {/* phone version: the fork runs downward */}
        <div data-mfork className="mt-12 lg:hidden">
          <OriginPost />
          <svg
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
            className="h-12 w-full"
          >
            <path
              d="M50 0 C 50 20, 25 20, 25 40"
              fill="none"
              stroke="#FF2438"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M50 0 C 50 20, 75 20, 75 40"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex min-w-0 flex-col gap-2.5 border-l-2 border-r1 pl-3">
              <span className="text-[13px] font-medium text-r1">
                With Sparrow
              </span>
              {WITH.map((e) => (
                <Event key={e.title} item={e} good className="translate-y-2" />
              ))}
            </div>
            <div className="flex min-w-0 flex-col gap-2.5 border-l-2 border-dashed border-white/20 pl-3">
              <span className="text-[13px] text-ink-3">Without</span>
              {WITHOUT.map((e) => (
                <Event
                  key={e.title}
                  item={e}
                  good={false}
                  className="translate-y-2"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
