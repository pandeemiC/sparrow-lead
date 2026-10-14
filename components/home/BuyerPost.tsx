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
  Check,
  X,
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
const PLAY_TO = 95.5;

// where each moment sits along the time axis (percent of the width)
const STOPS = [
  { x: 45, time: "Next scan" },
  { x: 58, time: "Minutes later" },
  { x: 71, time: "Same day" },
  { x: 84, time: "Next day" },
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

const TOP_LANE = `M262 260 C 330 260, 330 ${TOP_Y}, 400 ${TOP_Y} L 955 ${TOP_Y}`;
const BOT_LANE = `M262 260 C 330 260, 330 ${BOT_Y}, 400 ${BOT_Y} L 955 ${BOT_Y}`;

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
          tl.to("[data-playhead]", { opacity: 0, duration: 0.5 }, T)
            .to(
              "[data-end]",
              { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" },
              T - 0.1,
            )
            .to(
              "[data-endings]",
              { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
              T,
            );
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
        gsap.set("[data-playhead]", { opacity: 0 });
        gsap.set("[data-ev], [data-tick], [data-end], [data-endings]", {
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

        {/* desktop fork, framed like a chart */}
        <div className="mt-14 hidden overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] shadow-[0_50px_120px_-70px_rgba(255,36,56,0.5)] lg:block">
          <div className="flex items-center justify-between border-b border-white/7 px-7 py-4 text-[13px]">
            <span className="text-ink-2">One post, followed for a day</span>
            <div className="flex items-center gap-5 text-ink-3">
              <span className="flex items-center gap-2">
                <i className="h-0.5 w-5 rounded-full bg-r1 shadow-[0_0_8px_var(--r1)]" />
                With Sparrow
              </span>
              <span className="flex items-center gap-2">
                <i className="h-0 w-5 border-t border-dashed border-white/40" />
                Without
              </span>
            </div>
          </div>

          <div className="relative bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[22px_22px] px-7">
            <div data-fork className="relative h-130">
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
                  {/* the "without" lane dies out as it goes */}
                  <linearGradient id="lane-bad" x1="0" x2="1">
                    <stop offset="0" stopColor="#ffffff" stopOpacity="0.4" />
                    <stop offset="1" stopColor="#ffffff" stopOpacity="0.08" />
                  </linearGradient>
                </defs>
                {/* vertical guides through each moment */}
                {STOPS.map((st) => (
                  <line
                    key={st.time}
                    x1={st.x * 10}
                    x2={st.x * 10}
                    y1={60}
                    y2={H - 60}
                    stroke="rgba(255,255,255,0.06)"
                    strokeDasharray="3 6"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
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
                  stroke="url(#lane-bad)"
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
                className="absolute left-[29%] -translate-y-full pb-2 text-[13px] font-medium whitespace-nowrap text-r1"
                style={{ top: pct(TOP_Y) }}
              >
                With Sparrow
              </span>
              <span
                className="absolute left-[29%] pt-2 text-[13px] whitespace-nowrap text-ink-3"
                style={{ top: pct(BOT_Y) }}
              >
                Without
              </span>

              {STOPS.map((st, i) => (
                <div
                  key={st.time}
                  data-col={st.x}
                  className="absolute inset-y-0"
                  style={{ left: `${st.x}%` }}
                >
                  <span className="absolute top-1/2 left-0 -translate-1/2 rounded-full border border-white/8 bg-[#120a0c] px-2.5 py-1 text-[11.5px] whitespace-nowrap text-ink-3">
                    {st.time}
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
                  <div
                    className="absolute left-0 w-34 -translate-x-1/2 pb-4"
                    style={{ bottom: `calc(100% - ${pct(TOP_Y)})` }}
                  >
                    <Event item={WITH[i]} good className="translate-y-2" />
                  </div>
                  <div
                    className="absolute left-0 w-34 -translate-x-1/2 pt-4"
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

              {/* where each lane ends up */}
              <span
                data-end
                className="absolute grid size-7 -translate-1/2 scale-0 place-items-center rounded-full border border-green/50 bg-green/15 text-green opacity-0 shadow-[0_0_18px_rgba(61,220,132,0.45)]"
                style={{ left: `${PLAY_TO}%`, top: pct(TOP_Y) }}
              >
                <Check className="size-3.5" strokeWidth={3} />
              </span>
              <span
                data-end
                className="absolute grid size-6 -translate-1/2 scale-0 place-items-center rounded-full border border-white/15 bg-[#140b0d] text-ink-3 opacity-0"
                style={{ left: `${PLAY_TO}%`, top: pct(BOT_Y) }}
              >
                <X className="size-3" strokeWidth={2.5} />
              </span>

              <div
                data-playhead
                className="pointer-events-none absolute inset-y-[4%] w-px bg-linear-to-b from-transparent via-white/45 to-transparent"
                style={{ left: `${PLAY_FROM}%` }}
              />
            </div>
          </div>

          {/* the two outcomes, side by side */}
          <div
            data-endings
            className="grid translate-y-2 grid-cols-2 border-t border-white/7 opacity-0"
          >
            <div className="flex items-center gap-3 border-r border-white/7 px-7 py-5">
              <span className="grid size-8 flex-none place-items-center rounded-full bg-green/12 text-green">
                <Check className="size-4" strokeWidth={2.5} />
              </span>
              <div>
                <p className="text-[14.5px] text-ink">In the conversation</p>
                <p className="text-[12.5px] text-ink-3">
                  Seen on the next scan, replied the same day
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-7 py-5">
              <span className="grid size-8 flex-none place-items-center rounded-full bg-white/6 text-ink-3">
                <X className="size-4" strokeWidth={2.5} />
              </span>
              <div>
                <p className="text-[14.5px] text-ink-2">Lead lost</p>
                <p className="text-[12.5px] text-ink-3">
                  Buried under 214 newer posts, no replies
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* phone version: the fork runs downward */}
        <div
          data-mfork
          className="mt-12 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-4 lg:hidden"
        >
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
