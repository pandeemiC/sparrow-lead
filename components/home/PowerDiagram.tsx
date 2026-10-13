"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  Copy,
  Inbox,
  KanbanSquare,
  Mail,
  PenLine,
  Radar,
  Rss,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import SectionHead from "./SectionHead";
import Backdrop, { Glow } from "./Backdrop";
import PlatformIcon from "@/components/ui/PlatformIcon";
import ScoreArc from "@/components/sp/ScoreArc";
import { REPLY_DRAFTS, SAMPLE_POSTS, type SamplePost } from "./data";
import { platformVar, scoreColor, scoreTier } from "@/lib/score";
import { cn } from "@/lib/utils";
import type { SignalPlatform } from "@/types";

type NodeKey = "src" | "scan" | "score" | "sig" | "draft" | "hunt" | "mail";
const EDGES: [NodeKey, NodeKey][] = [
  ["src", "scan"],
  ["scan", "score"],
  ["score", "sig"],
  ["score", "hunt"],
  ["score", "mail"],
  ["sig", "draft"],
];
const SVGNS = "http://www.w3.org/2000/svg";
const PLATFORMS: { key: SignalPlatform; label: string }[] = [
  { key: "reddit", label: "Reddit" },
  { key: "hackernews", label: "Hacker News" },
  { key: "bluesky", label: "Bluesky" },
];
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// rounded orthogonal path through a list of points
function orth(pts: number[][], r = 14) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const d1 = Math.hypot(x1 - x0, y1 - y0);
    const d2 = Math.hypot(x2 - x1, y2 - y1);
    if (d1 < 1 || d2 < 1) {
      d += ` L${x1} ${y1}`;
      continue;
    }
    const rr = Math.min(r, d1 / 2, d2 / 2);
    d += ` L${x1 - ((x1 - x0) / d1) * rr} ${y1 - ((y1 - y0) / d1) * rr} Q${x1} ${y1} ${x1 + ((x2 - x1) / d2) * rr} ${y1 + ((y2 - y1) / d2) * rr}`;
  }
  const l = pts[pts.length - 1];
  return d + ` L${l[0]} ${l[1]}`;
}

function Node({
  id,
  hot,
  icon: Icon,
  title,
  aside,
  caption,
  className,
  children,
}: {
  id: NodeKey;
  hot: boolean;
  icon: LucideIcon;
  title: string;
  aside?: React.ReactNode;
  caption: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-node={id}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[20px] border border-transparent p-5",
        "[background:linear-gradient(#130a0c,#110809)_padding-box,linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.04)_45%,rgba(255,255,255,0.08))_border-box]",
        "shadow-[0_30px_60px_-40px_rgba(0,0,0,0.9)] transition-[box-shadow] duration-[1400ms]",
        hot &&
          "shadow-[0_0_0_1px_rgba(255,36,56,0.55),0_0_60px_-12px_rgba(255,36,56,0.55)] duration-200",
        className,
      )}
    >
      {/* soft light that falls on the top edge of every card */}
      <div className="pointer-events-none absolute inset-x-6 -top-px h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />
      <div
        className={cn(
          "pointer-events-none absolute -top-24 left-1/2 size-56 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,36,56,0.18),transparent_70%)] opacity-0 transition-opacity duration-[1400ms]",
          hot && "opacity-100 duration-200",
        )}
      />
      <div className="relative flex items-center gap-3">
        <span
          className={cn(
            "grid size-9 place-items-center rounded-[10px] border border-white/10 bg-linear-to-b from-white/8 to-white/2 text-ink-2 transition-colors duration-700",
            hot && "border-r1/40 text-r1",
          )}
        >
          <Icon className="size-4.25" strokeWidth={1.6} />
        </span>
        <span className="text-[14.5px] font-medium">{title}</span>
        {aside && (
          <span className="ml-auto text-[12px] text-ink-3">{aside}</span>
        )}
      </div>
      <div className="relative mt-5 flex flex-1 flex-col justify-center">
        {children}
      </div>
      <p className="relative mt-5 text-[13px] text-ink-3">{caption}</p>
    </div>
  );
}

export default function PowerDiagram() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<SVGGElement>(null);
  const pulseRef = useRef<SVGGElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathsRef = useRef<Record<string, SVGPathElement>>({});

  const [hot, setHot] = useState<NodeKey | null>(null);
  const [activePlatform, setActivePlatform] = useState<SignalPlatform | null>(
    null,
  );
  const [scored, setScored] = useState<SamplePost>(SAMPLE_POSTS[0]);
  const [rows, setRows] = useState<SamplePost[]>(SAMPLE_POSTS.slice(0, 3));
  const [draft, setDraft] = useState(REPLY_DRAFTS[0]);
  const [copied, setCopied] = useState(false);
  const [mailCount, setMailCount] = useState(3);
  const [boardCol, setBoardCol] = useState(0);
  const [blips, setBlips] = useState<
    { id: number; x: number; y: number; c: string }[]
  >([]);

  // draw the base connector lines between the cards
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const build = () => {
      const R = wrap.getBoundingClientRect();
      const mobile = window.innerWidth < 1024;
      svgRef.current?.setAttribute("viewBox", `0 0 ${R.width} ${R.height}`);
      const base = baseRef.current;
      if (!base) return;
      base.innerHTML = "";
      const box = (k: NodeKey) => {
        const b = wrap
          .querySelector(`[data-node="${k}"]`)!
          .getBoundingClientRect();
        return {
          l: b.left - R.left,
          r: b.right - R.left,
          t: b.top - R.top,
          b: b.bottom - R.top,
          cx: b.left - R.left + b.width / 2,
          cy: b.top - R.top + b.height / 2,
        };
      };
      const rail = box("src").l - 18;
      const busY = (box("score").b + box("sig").t) / 2;
      const joints: number[][] = [];
      EDGES.forEach(([a, b]) => {
        const A = box(a);
        const B = box(b);
        let pts: number[][];
        if (mobile)
          pts = [
            [A.l, A.cy],
            [rail, A.cy],
            [rail, B.cy],
            [B.l, B.cy],
          ];
        else if (a === "score")
          pts = [
            [A.cx, A.b],
            [A.cx, busY],
            [B.cx, busY],
            [B.cx, B.t],
          ];
        else if (a === "sig")
          pts = [
            [A.l, A.cy],
            [B.r, A.cy],
          ];
        else
          pts = [
            [A.r, A.cy],
            [B.l, A.cy],
          ];
        joints.push(pts[0], pts[pts.length - 1]);
        const path = document.createElementNS(SVGNS, "path");
        path.setAttribute("d", orth(pts));
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "rgba(255,255,255,0.09)");
        path.setAttribute("stroke-width", "1");
        base.appendChild(path);
        // slow dotted flow on top of the line so it never looks dead
        const flow = path.cloneNode() as SVGPathElement;
        flow.setAttribute("stroke", "rgba(255,90,104,0.22)");
        flow.setAttribute("stroke-dasharray", "1 9");
        flow.setAttribute("stroke-linecap", "round");
        flow.style.animation = "sp-flow 9s linear infinite";
        base.appendChild(flow);
        pathsRef.current[`${a}-${b}`] = path;
      });
      joints.forEach(([x, y]) => {
        const c = document.createElementNS(SVGNS, "circle");
        c.setAttribute("cx", String(x));
        c.setAttribute("cy", String(y));
        c.setAttribute("r", "3");
        c.setAttribute("fill", "#0d0607");
        c.setAttribute("stroke", "rgba(255,255,255,0.25)");
        base.appendChild(c);
      });
    };
    build();
    const ro = new ResizeObserver(build);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  // a slow light travelling along one connector
  const pulse = (key: string) =>
    new Promise<void>((resolve) => {
      const base = pathsRef.current[key];
      const layer = pulseRef.current;
      if (!base || !layer) return resolve();
      const len = base.getTotalLength();
      const seg = Math.min(70, len * 0.6);
      const make = (width: number, color: string, blur: number) => {
        const p = base.cloneNode() as SVGPathElement;
        p.setAttribute("stroke", color);
        p.setAttribute("stroke-width", String(width));
        p.setAttribute("stroke-linecap", "round");
        p.style.strokeDasharray = `${seg} ${len + seg}`;
        p.style.filter = blur ? `blur(${blur}px)` : "";
        p.style.animation = "none";
        layer.appendChild(p);
        return p;
      };
      const glow = make(7, "rgba(255,36,56,0.55)", 4);
      const core = make(1.6, "#ff8a95", 0);
      gsap.fromTo(
        [glow, core],
        { strokeDashoffset: seg },
        {
          strokeDashoffset: -len,
          duration: Math.max(1.1, len / 170),
          ease: "sine.inOut",
          onComplete: () => {
            glow.remove();
            core.remove();
            resolve();
          },
        },
      );
    });

  const light = (k: NodeKey) => {
    setHot(k);
    setTimeout(() => setHot((h) => (h === k ? null : h)), 900);
  };

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;
    let visible = false;
    let alive = true;
    let i = 0;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    if (wrapRef.current) io.observe(wrapRef.current);

    const typeDraft = async (text: string) => {
      setCopied(false);
      for (let n = 0; n <= text.length && alive; n += 2) {
        setDraft(text.slice(0, n));
        await wait(24);
      }
      setDraft(text);
      await wait(500);
      setCopied(true);
    };

    const chain = async () => {
      const post = SAMPLE_POSTS[i++ % SAMPLE_POSTS.length];
      setActivePlatform(post.platform);
      light("src");
      await wait(500);
      await pulse("src-scan");
      setActivePlatform(null);
      light("scan");
      const a = Math.random() * Math.PI * 2;
      const r = 18 + Math.random() * 38;
      const blip = {
        id: Date.now(),
        x: 50 + Math.cos(a) * r,
        y: 50 + Math.sin(a) * r,
        c: scoreColor(post.score),
      };
      setBlips((b) => [...b.slice(-3), blip]);
      await wait(700);
      await pulse("scan-score");
      light("score");
      setScored(post);
      await wait(900);
      const out: NodeKey =
        post.score >= 8 ? (["sig", "hunt", "mail"] as const)[i % 3] : "sig";
      await pulse(`score-${out}`);
      light(out);
      if (out === "sig") {
        setRows((r) => [post, ...r].slice(0, 3));
        await wait(700);
        await pulse("sig-draft");
        light("draft");
        await typeDraft(REPLY_DRAFTS[i % REPLY_DRAFTS.length]);
      } else if (out === "hunt") {
        setBoardCol((c) => (c + 1) % 4);
      } else {
        setMailCount((c) => (c >= 9 ? 1 : c + 1));
      }
    };

    (async () => {
      while (alive) {
        if (visible) await chain();
        await wait(1600);
      }
    })();
    return () => {
      alive = false;
      io.disconnect();
    };
  }, []);

  return (
    <section className="relative isolate py-28 md:py-40">
      <Backdrop tint="#170a0e">
        <Glow
          className="top-[8%] left-1/2 h-105 w-[75%] -translate-x-1/2"
          color="rgba(255,36,56,0.13)"
        />
        <Glow
          className="right-[-10%] bottom-[12%] size-140"
          color="rgba(126,15,27,0.28)"
        />
      </Backdrop>
      <div className="relative mx-auto max-w-310 px-5 md:px-10">
        <SectionHead
          title="From a public post to a lead you can act on."
          intro="Follow one post through Sparrow. It's read, scored, and routed to wherever you'll act on it, all without you watching a feed."
        />

        <div ref={wrapRef} className="relative mt-16 pl-6 lg:pl-0">
          <svg
            ref={svgRef}
            className="pointer-events-none absolute inset-0 size-full overflow-visible"
          >
            <g ref={baseRef} />
            <g ref={pulseRef} />
          </svg>

          <div className="relative grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-16">
            <Node
              id="src"
              hot={hot === "src"}
              icon={Rss}
              title="Sources"
              aside="Public posts"
              caption="Reddit, Hacker News and Bluesky, matched to your keywords."
              className="lg:col-span-4"
            >
              <div className="flex flex-col gap-2">
                {PLATFORMS.map((p) => {
                  const on = activePlatform === p.key;
                  return (
                    <div
                      key={p.key}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border border-white/7 bg-white/1.5 px-3 py-2.5 text-[13.5px] transition-all duration-700",
                        on &&
                          "border-[color-mix(in_oklab,var(--pc)_50%,transparent)] bg-[color-mix(in_oklab,var(--pc)_9%,transparent)] duration-200",
                      )}
                      style={
                        { "--pc": platformVar(p.key) } as React.CSSProperties
                      }
                    >
                      <span className="grid size-8 place-items-center rounded-lg bg-[color-mix(in_oklab,var(--pc)_14%,transparent)]">
                        <PlatformIcon platform={p.key} size={16} />
                      </span>
                      {p.label}
                      <i
                        className={cn(
                          "ml-auto size-1.5 rounded-full bg-white/15 transition-all duration-700",
                          on && "bg-(--pc) shadow-[0_0_10px_var(--pc)]",
                        )}
                      />
                    </div>
                  );
                })}
              </div>
            </Node>

            <Node
              id="scan"
              hot={hot === "scan"}
              icon={Radar}
              title="Scanner"
              aside="Every 6 hours"
              caption="Reads every new post since the last scan."
              className="lg:col-span-4"
            >
              <div className="relative mx-auto size-40">
                <svg viewBox="0 0 100 100" className="absolute inset-0">
                  {[48, 36, 24, 12].map((r) => (
                    <circle
                      key={r}
                      cx="50"
                      cy="50"
                      r={r}
                      fill="none"
                      stroke="rgba(255,255,255,0.07)"
                    />
                  ))}
                  <path d="M50 2v96M2 50h96" stroke="rgba(255,255,255,0.05)" />
                  {Array.from({ length: 36 }, (_, k) => {
                    const a = (k / 36) * Math.PI * 2;
                    const r0 = k % 3 ? 46 : 44;
                    const f = (n: number) => n.toFixed(2);
                    return (
                      <line
                        key={k}
                        x1={f(50 + Math.cos(a) * r0)}
                        y1={f(50 + Math.sin(a) * r0)}
                        x2={f(50 + Math.cos(a) * 48)}
                        y2={f(50 + Math.sin(a) * 48)}
                        stroke="rgba(255,255,255,0.12)"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-[4%] animate-[spin_7s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,rgba(255,36,56,0.35),rgba(255,36,56,0)_18%,transparent)]" />
                {blips.map((b) => (
                  <span
                    key={b.id}
                    className="absolute size-1.5 -translate-1/2 animate-[sp-blip_3s_ease-out_forwards] rounded-full"
                    style={{
                      left: `${b.x}%`,
                      top: `${b.y}%`,
                      background: b.c,
                      boxShadow: `0 0 10px ${b.c}`,
                    }}
                  />
                ))}
                <span className="absolute top-1/2 left-1/2 size-1.5 -translate-1/2 rounded-full bg-r1 shadow-[0_0_10px_var(--r1)]" />
              </div>
            </Node>

            <Node
              id="score"
              hot={hot === "score"}
              icon={Sparkles}
              title="Intent score"
              aside="1 to 10"
              caption="A score, a one-line reason and the type of post."
              className="lg:col-span-4"
            >
              <div className="flex items-center gap-4">
                <ScoreArc key={scored.title} score={scored.score} size="dial" />
                <div className="min-w-0">
                  <span
                    className="inline-block rounded-full border px-2 py-0.5 text-[11.5px]"
                    style={{
                      color: scoreColor(scored.score),
                      borderColor: `color-mix(in oklab, ${scoreColor(scored.score)} 40%, transparent)`,
                    }}
                  >
                    {scored.type}
                  </span>
                  <p className="mt-2 text-[13px] leading-snug text-ink-2">
                    {scored.why}
                  </p>
                </div>
              </div>
            </Node>

            <Node
              id="draft"
              hot={hot === "draft"}
              icon={PenLine}
              title="Reply draft"
              aside={
                <span
                  className={cn(
                    "flex items-center gap-1 rounded-md border border-white/10 px-1.5 py-0.5 transition-colors",
                    copied && "border-green/40 text-green",
                  )}
                >
                  <Copy className="size-3" />
                  {copied ? "Copied" : "Copy"}
                </span>
              }
              caption="A first draft you edit and post yourself."
              className="lg:col-span-3"
            >
              <p className="min-h-22 text-[13px] leading-relaxed text-ink-2">
                {draft}
                <span className="ml-px inline-block h-[1em] w-px animate-pulse bg-r1 align-[-2px]" />
              </p>
            </Node>

            <Node
              id="sig"
              hot={hot === "sig"}
              icon={Inbox}
              title="Signals"
              aside="Best first"
              caption="Everything that matched, sorted by intent."
              className="lg:col-span-4"
            >
              <div className="flex flex-col gap-1.5">
                {rows.map((r, k) => (
                  <div
                    key={`${r.title}-${k}`}
                    className="flex min-w-0 animate-[sp-row-in_0.6s_ease-out] items-center gap-2.5 rounded-lg border border-white/6 bg-white/2 px-2.5 py-2 text-[12.5px] text-ink-2"
                  >
                    <span
                      className={cn(
                        "grid size-5 flex-none place-items-center rounded-md font-mono text-[10.5px]",
                        scoreTier(r.score) === "hi" &&
                          "bg-r1/16 text-[#ff6b78]",
                        scoreTier(r.score) === "md" && "bg-amber/14 text-amber",
                        scoreTier(r.score) === "lo" && "bg-white/6 text-ink-3",
                      )}
                    >
                      {r.score}
                    </span>
                    <PlatformIcon platform={r.platform} size={11} />
                    <span className="truncate">{r.title}</span>
                  </div>
                ))}
              </div>
            </Node>

            <Node
              id="hunt"
              hot={hot === "hunt"}
              icon={KanbanSquare}
              title="Hunt Board"
              caption="Move leads from found to won."
              className="lg:col-span-3"
            >
              <div className="relative grid grid-cols-4 gap-1.5">
                {["New", "Interested", "Talking", "Won"].map((c, k) => (
                  <div
                    key={c}
                    className="flex min-h-19.5 flex-col gap-1 rounded-lg border border-white/6 bg-white/2 p-1.5"
                  >
                    <small className="truncate text-[9.5px] text-ink-3">
                      {c}
                    </small>
                    <i className="h-2.5 rounded-sm bg-white/7" />
                    {k === boardCol && (
                      <i className="h-2.5 animate-[sp-row-in_0.5s_ease-out] rounded-sm bg-r1/70 shadow-[0_0_10px_rgba(255,36,56,0.6)]" />
                    )}
                    {k % 2 === 0 && (
                      <i className="h-2.5 rounded-sm bg-white/7" />
                    )}
                  </div>
                ))}
              </div>
            </Node>

            <Node
              id="mail"
              hot={hot === "mail"}
              icon={Mail}
              title="Alerts"
              caption="Top leads by email after each scan."
              className="lg:col-span-2"
            >
              <div className="relative mx-auto mt-1 h-14 w-18.5 rounded-lg border border-white/15 bg-[linear-gradient(to_bottom_right,transparent_calc(50%-0.5px),rgba(255,255,255,0.15)_50%,transparent_calc(50%+0.5px))_top_left/50%_60%_no-repeat,linear-gradient(to_bottom_left,transparent_calc(50%-0.5px),rgba(255,255,255,0.15)_50%,transparent_calc(50%+0.5px))_top_right/50%_60%_no-repeat]">
                <b
                  key={mailCount}
                  className="absolute -top-2.5 -right-2.5 grid h-5 min-w-5 animate-[sp-row-in_0.5s_ease-out] place-items-center rounded-full bg-r1 px-1 font-mono text-[10.5px] font-medium shadow-[0_0_14px_var(--r1)]"
                >
                  {mailCount}
                </b>
              </div>
            </Node>
          </div>
        </div>
      </div>
    </section>
  );
}
