"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, RotateCw } from "lucide-react";
import SectionHead from "./SectionHead";
import { SCAN_LOG } from "./data";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const STEPS = ["Keywords", "Scan", "Score", "Deliver"];
// stable pseudo random so the wall looks the same every load
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// a grid of dots (posts). a scan line passes and only a few light up
function DotWall({ progress }: { progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<{ x: number; y: number; k: string; tint: string }[]>(
    [],
  );
  const sizeRef = useRef({ w: 0, h: 0 });

  const draw = (p: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { w, h } = sizeRef.current;
    const sx = p * w;
    const active = p > 0 && p < 1.08;
    ctx.clearRect(0, 0, w, h);
    if (active) {
      const g = ctx.createLinearGradient(sx - 160, 0, sx, 0);
      g.addColorStop(0, "rgba(255,36,56,0)");
      g.addColorStop(1, "rgba(255,36,56,.13)");
      ctx.fillStyle = g;
      ctx.fillRect(sx - 160, 0, 160, h);
    }
    for (const d of dotsRef.current) {
      const dx = sx - d.x;
      const near = Math.abs(dx) < 34 ? 1 - Math.abs(dx) / 34 : 0;
      if (dx > 0 && d.k) {
        const hot = d.k === "h";
        ctx.shadowBlur = hot ? 12 : 6;
        ctx.shadowColor = ctx.fillStyle = hot ? "#FF2438" : "#F6C148";
        ctx.beginPath();
        ctx.arc(d.x, d.y, hot ? 2.8 : 2.3, 0, 7);
        ctx.fill();
        ctx.shadowBlur = 0;
        continue;
      }
      ctx.fillStyle = near
        ? `rgba(255,235,236,${0.15 + 0.6 * near})`
        : `rgba(${d.tint},${dx > 0 ? 0.1 : 0.2})`;
      ctx.beginPath();
      ctx.arc(d.x, d.y, 1.5, 0, 7);
      ctx.fill();
    }
    if (active) {
      ctx.fillStyle = "#ff4a5b";
      ctx.shadowColor = "#FF2438";
      ctx.shadowBlur = 16;
      ctx.fillRect(sx - 1, 0, 2, h);
      ctx.shadowBlur = 0;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const tints = ["226,80,26", "255,165,82", "110,193,255"];
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      sizeRef.current = { w, h };
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
      const gap = w < 500 ? 10 : 12;
      const cols = Math.floor(w / gap);
      const rows = Math.floor(h / gap);
      const ox = (w - (cols - 1) * gap) / 2;
      const oy = (h - (rows - 1) * gap) / 2;
      const dots = [];
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) {
          const k = rnd(x * 31 + y * 7 + 3);
          dots.push({
            x: ox + x * gap,
            y: oy + y * gap,
            k: k < 0.01 ? "h" : k < 0.03 ? "w" : "",
            tint: tints[Math.min(2, Math.floor((x / cols) * 3))],
          });
        }
      dotsRef.current = dots;
      draw(progress);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => draw(progress));

  return <canvas ref={canvasRef} className="block h-72 w-full" />;
}

export default function Problem() {
  const [p, setP] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const run = () => {
    tweenRef.current?.kill();
    const state = { p: 0 };
    tweenRef.current = gsap.to(state, {
      p: 1.15,
      duration: 5.6,
      ease: "none",
      onUpdate: () => setP(state.p),
    });
  };

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: rootRef.current,
      start: "top 70%",
      once: true,
      onEnter: run,
    });
    return () => {
      st.kill();
      tweenRef.current?.kill();
    };
  }, []);

  const step = p < 0.05 ? 0 : p < 0.4 ? 1 : p < 0.85 ? 2 : p < 1.1 ? 3 : 4;
  const done = step >= 4;
  const lines = SCAN_LOG.filter((_, i) => p >= (i / SCAN_LOG.length) * 1.05);

  return (
    <section className="relative bg-bg pt-16 pb-28 md:pt-24 md:pb-36">
      <div ref={rootRef} className="mx-auto max-w-310 px-5 md:px-10">
        <SectionHead
          title="The right post is out there. By tonight it's buried."
          intro="Every day people ask in public for a tool, a freelancer, an alternative or an answer. Hundreds of new posts land on top of them within hours, and nobody who could help ever sees them."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <figure className="rounded-[20px] border border-white/10 bg-[#120a0c] p-6">
            <DotWall progress={p} />
            <figcaption className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-ink-3">
              <span>Each dot is a post (illustration)</span>
              <span className="flex items-center gap-2">
                <i className="size-2 rounded-full bg-r1 shadow-[0_0_8px_var(--r1)]" />
                Ready to act
              </span>
              <span className="flex items-center gap-2">
                <i className="size-2 rounded-full bg-amber" />
                Worth a look
              </span>
              <span className="flex items-center gap-2">
                <i className="size-2 rounded-full bg-white/25" />
                Everything else
              </span>
            </figcaption>
          </figure>

          <div className="flex flex-col rounded-[20px] border border-white/10 bg-[#120a0c]">
            <div className="flex items-center gap-3 border-b border-white/7 px-5 py-4">
              <span
                className={cn(
                  "grid size-6 place-items-center rounded-full border-2",
                  done
                    ? "border-green"
                    : "animate-spin border-white/12 border-t-r1",
                )}
              >
                {done && (
                  <Check className="size-3 text-green" strokeWidth={3} />
                )}
              </span>
              <div>
                <b className="block text-[14px] font-medium">
                  {done ? "Scan complete" : "Scanning"}
                </b>
                <small className="text-[12px] text-ink-3">
                  Reddit, Hacker News and Bluesky
                </small>
              </div>
              <button
                onClick={run}
                className="ml-auto flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[12.5px] text-ink-2 transition-colors hover:border-r1/50 hover:text-ink"
              >
                <RotateCw className="size-3.5" />
                Run again
              </button>
            </div>

            <div className="px-5 pt-5">
              <div className="relative grid grid-cols-4">
                <div className="absolute top-1.5 right-[12.5%] left-[12.5%] h-px bg-white/12" />
                <div
                  className="absolute top-1.5 left-[12.5%] h-px bg-r1 shadow-[0_0_8px_var(--r1)] transition-[width] duration-500"
                  style={{ width: `${(Math.min(step, 3) / 3) * 75}%` }}
                />
                {STEPS.map((s, i) => (
                  <div
                    key={s}
                    className={cn(
                      "relative flex flex-col items-center gap-2.5 text-[12px]",
                      i <= step ? "text-ink" : "text-ink-3",
                    )}
                  >
                    <i
                      className={cn(
                        "size-3.25 rounded-full border-[1.5px] border-white/15 bg-[#1a0d0f]",
                        i < step && "border-r1 bg-r1",
                        i === step && "animate-pulse border-r1 bg-bg",
                      )}
                    />
                    {s}
                  </div>
                ))}
              </div>
            </div>

            <div className="m-5 flex-1 rounded-xl border border-white/7 bg-[#070304] p-4 font-mono text-[11.5px] leading-[1.9] text-ink-3">
              {lines.map((l, i) => (
                <div key={l} className="truncate">
                  <span className="text-r1/80">›</span>{" "}
                  <span className={cn(i === SCAN_LOG.length - 1 && "text-ink")}>
                    {l}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/7 px-5 py-3.5 text-[12.5px] text-ink-3">
              Runs by itself every 6 hours, or whenever you press scan.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
