"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { ChevronDown, Pause, Play, Plus, RefreshCw } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import PlatformIcon from "@/components/ui/PlatformIcon";
import CountUp from "@/components/sp/CountUp";
import { apiFetch } from "@/lib/apiFetch";
import { toMentionRow } from "@/lib/mentions";
import { platformVar, scoreTier, shortAgo } from "@/lib/score";
import { cn, timeAgo } from "@/lib/utils";
import { PLATFORMS, PLATFORM_LABELS } from "@/lib/constants";
import { usePlan } from "@/components/dashboard/PlanContext";
import { useScanStore } from "@/store/scanStore";
import { useStatsStore } from "@/store/statsStore";
import { useToastStore } from "@/store/toastStore";
import {
  Bar,
  Button,
  Card,
  IconButton,
  Loading,
  NoData,
  Seg,
  SegButton,
} from "@/components/sp/ui";
import type { Keyword, MentionRow, SignalPlatform } from "@/types";

const DAY = 24 * 60 * 60 * 1000;
const HUNTED = ["hunting", "interested", "engaged", "hunted"];

type Row = Keyword & { paused: boolean };

// table columns, sources + avg intent drop off on smaller screens
const tableCols =
  "grid grid-cols-[minmax(0,1.6fr)_88px_150px_120px_70px_90px] items-center gap-3 px-[18px] max-[1180px]:grid-cols-[minmax(180px,1fr)_124px_50px_92px]";

const SCORE_BOX = {
  hi: "bg-r1/14 text-r1 shadow-[inset_0_0_0_1px_rgba(255,36,56,0.3)]",
  md: "bg-amber/10 text-amber shadow-[inset_0_0_0_1px_rgba(246,193,72,0.25)]",
  lo: "bg-white/5 text-ink-3",
};

function HelpStep({
  n,
  title,
  done = false,
  children,
}: {
  n: string;
  title: string;
  done?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      data-step
      className="grid grid-cols-[28px_minmax(0,1fr)] gap-3 rounded-[10px] px-3 py-2.5"
    >
      <div
        className={cn(
          "grid size-7 place-items-center rounded-full border border-r1/30 font-mono text-[10.5px] leading-[normal] font-medium text-r1",
          done && "border-green/35 bg-green/12 text-[#7be3a0]",
        )}
      >
        {n}
      </div>
      <div>
        <h4 className="mt-[3px] mb-0.5 text-[13.5px] font-medium">{title}</h4>
        <p className="m-0 text-[12.5px] leading-[1.45] text-pretty text-ink-3">
          {children}
        </p>
      </div>
    </div>
  );
}

type RowStats = {
  spark: number[];
  weekTotal: number;
  avg: number;
  hot: number;
  mentions: MentionRow[];
};

function intentColor(avg: number) {
  if (avg >= 7) return "var(--r1)";
  if (avg >= 5) return "var(--amber)";
  return "rgba(255,255,255,.35)";
}

function sparkPath(values: number[]) {
  const w = 92;
  const h = 28;
  const max = Math.max(...values, 1);
  const points = values.map((v, i) => [
    i * (w / (values.length - 1)),
    h - 2 - (v / max) * (h - 6),
  ]);
  const line = points
    .map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(" ");
  return {
    line,
    area: `${line} L${w} ${h} L0 ${h}Z`,
    last: points[points.length - 1],
  };
}

function Sparkline({ values, id }: { values: number[]; id: string }) {
  const { line, area, last } = sparkPath(values);
  const rising =
    values[values.length - 1] >= values[0] && values.some((v) => v > 0);
  const color = rising ? "#FF2438" : "rgba(255,255,255,.4)";
  return (
    <svg viewBox="0 0 92 28">
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity=".35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path data-area d={area} fill={`url(#g-${id})`} />
      <path
        data-line
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle data-dot cx={last[0]} cy={last[1]} r="2.5" fill={color} />
    </svg>
  );
}

export default function KeywordsPage() {
  const { limits } = usePlan();
  const toast = useToastStore((s) => s.show);
  const setNewSignalsCount = useScanStore((s) => s.setNewSignalsCount);
  const stats = useStatsStore((s) => s.stats);
  const refreshStats = useStatsStore((s) => s.refresh);

  const [rows, setRows] = useState<Row[] | null>(null);
  const [mentions, setMentions] = useState<MentionRow[]>([]);
  const [draft, setDraft] = useState("");
  const [platforms, setPlatforms] = useState<SignalPlatform[]>([
    "reddit",
    "hackernews",
    "bluesky",
  ]);
  const [adding, setAdding] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [feedFilter, setFeedFilter] = useState<"all" | "hot" | SignalPlatform>(
    "all",
  );
  const [helpOpen, setHelpOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const tableRef = useRef<HTMLDivElement>(null);
  const xpRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  async function loadAll() {
    const [active, archived, list] = await Promise.all([
      apiFetch<Keyword[]>("/api/keywords"),
      apiFetch<Keyword[]>("/api/keywords?archived=true"),
      apiFetch<Record<string, unknown>[]>(
        "/api/mentions?limit=500&sort=newest",
      ),
    ]);
    setRows([
      ...active.map((k) => ({ ...k, paused: false })),
      ...archived.map((k) => ({ ...k, paused: true })),
    ]);
    setMentions(list.map(toMentionRow));
    setNow(Date.now());
  }

  useEffect(() => {
    async function load() {
      try {
        await loadAll();
      } catch (err) {
        toast(err instanceof Error ? err.message : "Couldn't load keywords");
        setRows([]);
      }
    }
    load();
  }, [toast]);

  useEffect(() => {
    if (!helpOpen) return;
    function close(e: MouseEvent) {
      if (popRef.current && !popRef.current.contains(e.target as Node))
        setHelpOpen(false);
    }
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") setHelpOpen(false);
    }
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [helpOpen]);

  function statsFor(keyword: string): RowStats {
    const list = mentions.filter((m) => m.keyword === keyword);
    const spark = Array.from({ length: 7 }, (_, i) => {
      const start = new Date(now - (6 - i) * DAY);
      start.setHours(0, 0, 0, 0);
      const end = start.getTime() + DAY;
      return list.filter((m) => {
        const t = new Date(m.createdAt).getTime();
        return t >= start.getTime() && t < end;
      }).length;
    });
    const scored = list.filter((m) => m.score !== null);
    const avg = scored.length
      ? scored.reduce((s, m) => s + (m.score ?? 0), 0) / scored.length
      : 0;
    return {
      spark,
      weekTotal: spark.reduce((a, b) => a + b, 0),
      avg,
      hot: list.filter((m) => (m.score ?? 0) >= 8).length,
      mentions: list,
    };
  }

  const activeCount = rows?.filter((r) => !r.paused).length ?? 0;
  const atLimit = activeCount >= limits.keywords;
  const canAdd = !!draft.trim() && platforms.length > 0 && !atLimit && !adding;

  useGSAP(
    () => {
      if (!rows) return;
      gsap.fromTo(
        "[data-row]",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out" },
      );
      tableRef.current
        ?.querySelectorAll<SVGPathElement>("[data-line]")
        .forEach((p) => {
          const length = p.getTotalLength();
          gsap.fromTo(
            p,
            { strokeDasharray: length, strokeDashoffset: length },
            {
              strokeDashoffset: 0,
              duration: 1.2,
              ease: "power2.inOut",
              delay: 0.15,
            },
          );
        });
      gsap.fromTo(
        "[data-area], [data-dot]",
        { opacity: 0 },
        { opacity: 1, duration: 0.6, delay: 0.9 },
      );
      gsap.fromTo(
        "[data-intent] i",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.8,
          stagger: 0.05,
          delay: 0.3,
          ease: "power3.out",
        },
      );
    },
    { scope: tableRef, dependencies: [rows === null] },
  );

  useGSAP(
    () => {
      const xp = xpRef.current;
      if (!xp) return;
      gsap.fromTo(
        xp,
        { height: 0 },
        { height: "auto", duration: 0.55, ease: "power3.out" },
      );
      gsap.fromTo(
        xp.querySelectorAll("[data-fade]"),
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.035,
          delay: 0.12,
          ease: "power2.out",
        },
      );
      gsap.fromTo(
        xp.querySelectorAll("[data-stack] i"),
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.8,
          stagger: 0.08,
          delay: 0.25,
          ease: "power3.out",
        },
      );
    },
    { dependencies: [openId] },
  );

  useGSAP(
    () => {
      if (!helpOpen || !popRef.current) return;
      const pop = popRef.current.querySelector("[data-pop]");
      if (!pop) return;
      gsap.fromTo(
        pop,
        { autoAlpha: 0, y: -8, scale: 0.97 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: "power3.out" },
      );
      gsap.fromTo(
        pop.querySelectorAll("[data-step]"),
        { opacity: 0, x: -8 },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          stagger: 0.05,
          delay: 0.06,
          ease: "power2.out",
        },
      );
    },
    { dependencies: [helpOpen] },
  );

  function togglePlatform(p: SignalPlatform) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  }

  async function addKeyword() {
    const keyword = draft.trim().toLowerCase();
    if (!canAdd) return;
    if (rows?.some((r) => r.keyword.toLowerCase() === keyword && !r.paused)) {
      toast(`Already tracking “${keyword}”`);
      return;
    }
    setAdding(true);
    try {
      const created = await apiFetch<Keyword>("/api/keywords", {
        method: "POST",
        body: JSON.stringify({ keyword, platforms }),
      });
      setRows((prev) => [{ ...created, paused: false }, ...(prev ?? [])]);
      setDraft("");
      setOpenId(created.id);
      setFeedFilter("all");
      toast(`Tracking “${keyword}” — run a scan to collect signals`, "success");
      refreshStats();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't add keyword");
    } finally {
      setAdding(false);
    }
  }

  async function setPaused(row: Row, paused: boolean) {
    if (!paused && atLimit) {
      toast(
        `You're at ${limits.keywords}/${limits.keywords} — pause another keyword first`,
      );
      return;
    }
    setRows(
      (prev) =>
        prev?.map((r) => (r.id === row.id ? { ...r, paused } : r)) ?? prev,
    );
    try {
      if (paused) {
        await apiFetch("/api/keywords", {
          method: "DELETE",
          body: JSON.stringify({ id: row.id }),
        });
        toast("Paused — no new signals; existing ones are kept");
      } else {
        await apiFetch("/api/keywords", {
          method: "PATCH",
          body: JSON.stringify({ id: row.id, active: true }),
        });
        toast("Resumed", "success");
      }
      refreshStats();
    } catch (err) {
      setRows(
        (prev) =>
          prev?.map((r) => (r.id === row.id ? { ...r, paused: !paused } : r)) ??
          prev,
      );
      toast(err instanceof Error ? err.message : "Couldn't update keyword");
    }
  }

  async function huntMention(m: MentionRow) {
    setMentions((prev) =>
      prev.map((x) => (x.id === m.id ? { ...x, status: "hunting" } : x)),
    );
    try {
      await apiFetch(`/api/mentions/${m.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "hunting" }),
      });
      toast("Added to Hunt Board", "success");
      refreshStats();
    } catch (err) {
      setMentions((prev) =>
        prev.map((x) => (x.id === m.id ? { ...x, status: m.status } : x)),
      );
      toast(err instanceof Error ? err.message : "Couldn't add to Hunt Board");
    }
  }

  async function scan() {
    if (scanning) return;
    setScanning(true);
    const prevTotal = stats?.totalSignals ?? 0;
    try {
      await apiFetch("/api/scan/trigger", { method: "POST" });
    } catch (err) {
      setScanning(false);
      toast(err instanceof Error ? err.message : "Couldn't start the scan");
      return;
    }
    let attempts = 0;
    const poll = setInterval(async () => {
      attempts++;
      try {
        await refreshStats();
        const total = useStatsStore.getState().stats?.totalSignals ?? prevTotal;
        if (total > prevTotal || attempts >= 15) {
          clearInterval(poll);
          const newCount = total - prevTotal;
          if (newCount > 0) setNewSignalsCount(newCount);
          toast(
            newCount > 0
              ? `Scan complete — ${newCount} new signals`
              : "Scan complete — nothing new yet",
            "success",
          );
          await loadAll();
          setScanning(false);
        }
      } catch {
        clearInterval(poll);
        setScanning(false);
        toast("Lost track of the scan. Check Signals in a minute.");
      }
    }, 3000);
  }

  if (rows === null) {
    return <Loading>LOADING KEYWORDS…</Loading>;
  }

  const slotsLeft = Math.max(limits.keywords - activeCount, 0);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-6">
        <div
          className="relative flex flex-wrap items-center gap-3 text-[13.5px] text-ink-2"
          ref={popRef}
        >
          <span>
            {activeCount} of {limits.keywords} tracked
          </span>
          <button
            className={cn(
              "grid size-[22px] place-items-center rounded-full border border-line-2 bg-panel-2 p-0 font-mono text-[11px] leading-[normal] font-medium text-ink-2 transition-colors hover:border-r1 hover:bg-r1/12 hover:text-ink",
              helpOpen && "border-r1 bg-r1/12 text-ink",
            )}
            onClick={() => setHelpOpen((v) => !v)}
            aria-label="How keywords work"
            aria-expanded={helpOpen}
          >
            ?
          </button>
          {helpOpen && (
            <div
              data-pop
              role="dialog"
              className="absolute top-[calc(100%+12px)] left-0 z-20 w-[340px] origin-top-left rounded-2xl border border-line-2 bg-[rgba(22,11,13,0.96)] p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur-lg"
            >
              <h5 className="m-0 px-3 pt-2.5 pb-1 font-mono text-[10.5px] leading-[normal] font-medium tracking-[0.16em] text-ink-3">
                HOW KEYWORDS WORK
              </h5>
              <HelpStep n="01" title="Add a keyword" done={rows.length > 0}>
                A phrase buyers would actually type — a pain point, a
                competitor, a request.
              </HelpStep>
              <HelpStep n="02" title="We scan">
                Reddit, Hacker News and Bluesky — when you hit scan, and every 6
                hours if automatic scanning is on.
              </HelpStep>
              <HelpStep n="03" title="AI scores intent">
                Every mention is rated 1–10 for buying readiness. High intent
                surfaces first.
              </HelpStep>
              <HelpStep n="04" title="Act on it">
                Draft a reply, move it to your Hunt Board, or dismiss the noise.
              </HelpStep>
            </div>
          )}
          <span>·</span>
          <span>
            Last scan{" "}
            {stats?.lastScannedAt ? timeAgo(stats.lastScannedAt) : "never"}
          </span>
        </div>
        <Button spinning={scanning} onClick={scan} disabled={scanning}>
          <RefreshCw />
          {scanning ? "Scanning…" : "Run scan"}
        </Button>
      </div>

      <Card className="mb-5 flex flex-col gap-3 rounded-2xl p-3.5">
        <div className="flex min-h-12 flex-wrap items-center gap-2.5 rounded-xl border border-line bg-black/35 py-1.5 pr-1.5 pl-3.5 transition-[border-color,box-shadow] duration-150 focus-within:border-r1/50 focus-within:shadow-[0_0_0_4px_rgba(255,36,56,0.08)] [&>svg]:size-4 [&>svg]:flex-none [&>svg]:text-ink-3">
          <Plus />
          <input
            value={draft}
            maxLength={60}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addKeyword()}
            placeholder="Add a phrase buyers would type — e.g. “looking for a web designer”"
            className="min-w-[180px] flex-1 border-0 bg-transparent text-[14.5px] text-ink outline-0 placeholder:text-ink-3"
          />
          <div className="flex gap-1.5">
            {PLATFORMS.map((p) => {
              const on = platforms.includes(p.value);
              return (
                <button
                  key={p.value}
                  type="button"
                  className={cn(
                    "flex h-8 items-center gap-1.5 rounded-lg border border-line bg-transparent px-2.5 text-[12.5px] text-ink-3 transition-all duration-150",
                    on &&
                      "border-[color-mix(in_oklab,var(--pc)_45%,transparent)] bg-[color-mix(in_oklab,var(--pc)_10%,transparent)] text-ink",
                  )}
                  style={
                    { "--pc": platformVar(p.value) } as React.CSSProperties
                  }
                  onClick={() => togglePlatform(p.value)}
                >
                  <span
                    className={cn(
                      "grid place-items-center transition-opacity duration-150",
                      on ? "opacity-100" : "opacity-40",
                    )}
                  >
                    <PlatformIcon platform={p.value} size={13} />
                  </span>
                  {p.label}
                </button>
              );
            })}
          </div>
          <Button variant="primary" onClick={addKeyword} disabled={!canAdd}>
            {adding ? "Adding…" : "Track"}
          </Button>
        </div>
        {atLimit && (
          <div className="px-1 text-[12px] text-amber">
            You’ve reached {limits.keywords} of {limits.keywords} keywords.
            Pause one, or upgrade for more.
          </div>
        )}
      </Card>

      <Card className="rounded-2xl" ref={tableRef}>
        <div
          className={cn(
            tableCols,
            "h-10 border-b border-line font-mono text-[10.5px] leading-[normal] font-medium tracking-[0.14em] text-ink-3 uppercase [&>span:nth-child(n+5)]:text-right",
          )}
        >
          <span>Keyword</span>
          <span className="max-[1180px]:hidden">Sources</span>
          <span>Signals · 7d</span>
          <span className="max-[1180px]:hidden">Avg intent</span>
          <span>Hot</span>
          <span />
        </div>

        {rows.length === 0 && (
          <div
            data-row
            className="flex h-16 items-center justify-center gap-2.5 text-[13px] text-ink-3"
          >
            No keywords yet — add a phrase above to start hunting.
          </div>
        )}

        {rows.map((row) => {
          const s = statsFor(row.keyword);
          const open = openId === row.id;
          const dim = row.paused && "opacity-40";
          const feed = s.mentions.filter((m) =>
            feedFilter === "all"
              ? true
              : feedFilter === "hot"
                ? (m.score ?? 0) >= 7
                : m.platform === feedFilter,
          );
          const hi = s.mentions.filter(
            (m) => scoreTier(m.score) === "hi",
          ).length;
          const md = s.mentions.filter(
            (m) => scoreTier(m.score) === "md",
          ).length;
          const lo = s.mentions.length - hi - md;
          const total = Math.max(s.mentions.length, 1);

          return (
            <Fragment key={row.id}>
              <div
                data-row
                className={cn(
                  tableCols,
                  "group relative h-16 cursor-pointer border-b border-line transition-colors hover:bg-white/2.5",
                  open &&
                    "border-b-transparent bg-linear-to-r from-r1/9 to-transparent to-70% hover:bg-transparent before:absolute before:top-3.5 before:bottom-3.5 before:left-0 before:w-0.5 before:rounded-[2px] before:bg-r1",
                )}
                onClick={() => {
                  setOpenId(open ? null : row.id);
                  setFeedFilter("all");
                }}
              >
                <div className={cn("min-w-0", dim)}>
                  <b className="block truncate text-[14px] font-medium">
                    {row.keyword}
                  </b>
                  <small className="text-[11.5px] text-ink-3">
                    {row.paused
                      ? "Paused"
                      : `Added ${new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                  </small>
                </div>
                <div className={cn("flex gap-1.5 max-[1180px]:hidden", dim)}>
                  {(row.platforms ?? []).map((p) => (
                    <PlatformIcon key={p} platform={p} size={16} />
                  ))}
                </div>
                <div
                  className={cn(
                    "flex items-center gap-2.5 [&_svg]:h-7 [&_svg]:w-[92px] [&_svg]:overflow-visible",
                    dim,
                  )}
                >
                  <Sparkline values={s.spark} id={row.id} />
                  <span className="font-mono text-[12.5px] leading-[normal] font-medium">
                    {s.weekTotal}
                  </span>
                </div>
                <div
                  data-intent
                  className={cn(
                    "flex items-center gap-2 max-[1180px]:hidden",
                    dim,
                  )}
                >
                  <Bar
                    pct={s.avg * 10}
                    className="h-[5px] flex-1"
                    fillStyle={{ background: intentColor(s.avg) }}
                  />
                  <span className="w-[26px] text-right font-mono text-[12px] leading-[normal] font-medium">
                    {s.avg ? s.avg.toFixed(1) : "–"}
                  </span>
                </div>
                <div
                  className={cn(
                    "text-right font-mono text-[13px] leading-[normal] font-medium",
                    s.hot > 0 && "text-r1",
                    dim,
                  )}
                >
                  {s.hot}
                </div>
                <div
                  className={cn(
                    "flex justify-end gap-0.5 opacity-55 transition-opacity group-hover:opacity-100",
                    open && "opacity-100",
                  )}
                >
                  <IconButton
                    title={row.paused ? "Resume" : "Pause"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPaused(row, !row.paused);
                    }}
                  >
                    {row.paused ? <Play /> : <Pause />}
                  </IconButton>
                  <IconButton
                    title={open ? "Collapse" : "Expand"}
                    className={cn(
                      "[&_svg]:transition-transform [&_svg]:duration-300 [&_svg]:ease-[cubic-bezier(0.4,0,0.2,1)]",
                      open && "[&_svg]:rotate-180",
                    )}
                  >
                    <ChevronDown />
                  </IconButton>
                </div>
              </div>

              {open && (
                <div
                  className="overflow-hidden border-b border-line bg-linear-to-b from-r1/5 to-white/0 to-70%"
                  ref={xpRef}
                >
                  <div className="mx-[18px] mb-[18px] grid grid-cols-[280px_minmax(0,1fr)] rounded-[14px] border border-line bg-[rgba(10,5,6,0.55)] max-[1180px]:grid-cols-1">
                    <div className="flex flex-col gap-[22px] border-r border-line p-[18px] max-[1180px]:border-r-0 max-[1180px]:border-b">
                      <div className="grid grid-cols-3 gap-2.5 [&_b]:mb-1 [&_b]:block [&_b]:font-mono [&_b]:text-[22px] [&_b]:leading-[1.1] [&_b]:font-medium [&_small]:text-[11px] [&_small]:text-ink-3">
                        <div data-fade>
                          <b>
                            <CountUp value={s.weekTotal} delay={0.15} />
                          </b>
                          <small>Signals · 7d</small>
                        </div>
                        <div data-fade>
                          <b style={{ color: intentColor(s.avg) }}>
                            <CountUp value={s.avg} decimals={1} delay={0.15} />
                          </b>
                          <small>Avg intent</small>
                        </div>
                        <div data-fade>
                          <b>
                            <CountUp value={s.hot} delay={0.15} />
                          </b>
                          <small>Hot leads</small>
                        </div>
                      </div>
                      <div data-fade>
                        <div className="mb-2 flex justify-between text-[11.5px] text-ink-3">
                          <span>Intent mix</span>
                          <span>{s.mentions.length} total</span>
                        </div>
                        {s.mentions.length ? (
                          <>
                            <div
                              data-stack
                              className="flex h-1.5 gap-0.5 overflow-hidden rounded-[9px] [&_i]:block [&_i]:h-full [&_i]:origin-left"
                            >
                              {hi > 0 && (
                                <i
                                  style={{
                                    flex: hi / total,
                                    background: "var(--r1)",
                                  }}
                                />
                              )}
                              {md > 0 && (
                                <i
                                  style={{
                                    flex: md / total,
                                    background: "var(--amber)",
                                  }}
                                />
                              )}
                              {lo > 0 && (
                                <i
                                  style={{
                                    flex: lo / total,
                                    background: "rgba(255,255,255,.18)",
                                  }}
                                />
                              )}
                            </div>
                            <div className="mt-2.5 flex flex-wrap gap-3.5 text-[11.5px] text-ink-2 [&_i]:size-2 [&_i]:rounded-[2px] [&>span]:flex [&>span]:items-center [&>span]:gap-1.5">
                              <span>
                                <i className="bg-r1" />
                                High {hi}
                              </span>
                              <span>
                                <i className="bg-amber" />
                                Medium {md}
                              </span>
                              <span>
                                <i className="bg-white/18" />
                                Low {lo}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between text-[11.5px] text-ink-3">
                            Waiting for the first scan.
                          </div>
                        )}
                      </div>
                      <div data-fade className="mt-auto text-[12px] text-ink-3">
                        Tracking on{" "}
                        {(row.platforms ?? [])
                          .map((p) => PLATFORM_LABELS[p as SignalPlatform])
                          .join(" + ")}
                        {row.paused && " · paused"}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div
                        data-fade
                        className="flex items-center justify-between gap-2.5 px-4 py-3"
                      >
                        <b className="text-[13.5px] font-medium whitespace-nowrap">
                          Latest signals
                        </b>
                        <Seg className="rounded-lg p-0.5">
                          {[
                            { key: "all" as const, label: "All" },
                            { key: "hot" as const, label: "Hot" },
                            ...(row.platforms ?? []).map((p) => ({
                              key: p as SignalPlatform,
                              label:
                                p === "hackernews"
                                  ? "HN"
                                  : PLATFORM_LABELS[p as SignalPlatform],
                            })),
                          ].map((f) => (
                            <SegButton
                              key={f.key}
                              active={feedFilter === f.key}
                              className="rounded-md px-2.5 py-1 text-[11.5px]"
                              onClick={() => setFeedFilter(f.key)}
                            >
                              {f.label}
                            </SegButton>
                          ))}
                        </Seg>
                      </div>
                      {s.mentions.length === 0 ? (
                        <NoData data-fade>
                          No signals yet — run a scan to start collecting.
                        </NoData>
                      ) : feed.length === 0 ? (
                        <NoData data-fade>
                          No signals match this filter yet.
                        </NoData>
                      ) : (
                        feed.slice(0, 6).map((m) => {
                          const onBoard = HUNTED.includes(m.status);
                          return (
                            <div
                              key={m.id}
                              data-fade
                              className="grid grid-cols-[34px_minmax(0,1fr)] gap-3 border-t border-line px-4 py-3"
                            >
                              <div
                                className={cn(
                                  "grid size-[34px] place-items-center rounded-[10px] font-mono text-[13px] leading-[normal] font-medium",
                                  SCORE_BOX[scoreTier(m.score)],
                                )}
                              >
                                {m.score ?? "–"}
                              </div>
                              <div>
                                <p className="mt-0 mb-1 line-clamp-2 text-[13px] leading-[1.45] text-pretty wrap-anywhere">
                                  {m.title}
                                </p>
                                <small className="flex items-center gap-2 text-[11.5px] text-ink-3">
                                  <PlatformIcon
                                    platform={m.platform}
                                    size={11}
                                  />
                                  {m.source}
                                  <span>·</span>
                                  {shortAgo(m.createdAt)} ago
                                  <button
                                    className={cn(
                                      "ml-auto rounded-full border border-line-2 bg-transparent px-[9px] py-px text-[11.5px] text-ink-2 not-disabled:hover:border-r1 not-disabled:hover:text-ink",
                                      onBoard &&
                                        "border-green/40 text-[#7be3a0]",
                                    )}
                                    disabled={onBoard}
                                    onClick={() => huntMention(m)}
                                  >
                                    {onBoard ? "On Hunt Board ✓" : "+ Hunt"}
                                  </button>
                                </small>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div
                        data-fade
                        className="border-t border-line px-4 py-3 text-[12.5px] [&_a:hover]:text-r1"
                      >
                        <Link href="/dashboard/signals">
                          View all in Signals →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Fragment>
          );
        })}

        {rows.length > 0 && slotsLeft > 0 && (
          <div
            data-row
            className="flex h-16 items-center justify-center gap-2.5 text-[13px] text-ink-3"
          >
            {slotsLeft} slot{slotsLeft > 1 ? "s" : ""} left on your plan
          </div>
        )}
      </Card>
    </div>
  );
}
