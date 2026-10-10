"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import PlatformIcon from "@/components/ui/PlatformIcon";
import ScoreArc from "@/components/sp/ScoreArc";
import CountUp from "@/components/sp/CountUp";
import { apiFetch } from "@/lib/apiFetch";
import { toMentionRow } from "@/lib/mentions";
import { platformVar, scoreColor, scoreTier, shortAgo } from "@/lib/score";
import { cn, timeAgo } from "@/lib/utils";
import { PLATFORMS, PLATFORM_LABELS } from "@/lib/constants";
import { usePlan } from "@/components/dashboard/PlanContext";
import { useStatsStore } from "@/store/statsStore";
import { useScanStore } from "@/store/scanStore";
import { useToastStore } from "@/store/toastStore";
import {
  Bar,
  Button,
  Card,
  CardHead,
  KwTag,
  Label,
  Loading,
  NoData,
  StageDot,
} from "@/components/sp/ui";
import type { Keyword, MentionRow, SignalPlatform } from "@/types";

const DAY = 24 * 60 * 60 * 1000;

const STAGES = [
  { key: "hunting", label: "Hunting", color: "#B9B2B3" },
  { key: "interested", label: "Interested", color: "var(--amber)" },
  { key: "engaged", label: "Engaged", color: "var(--r1)" },
  { key: "hunted", label: "Hunted", color: "var(--green)" },
] as const;

type Tip = { mention: MentionRow; left: number; top: number };

// dot size + glow per intent tier on the 24h chart
const DOT_SIZE = {
  hi: { size: "11px", glow: "14px" },
  md: { size: "8px", glow: "4px" },
  lo: { size: "6px", glow: "0px" },
};

// 2 columns -> 2 columns with kpi/sig/pulse full width -> 1 column, based on the body width
const gridClass = cn(
  "grid items-stretch gap-[clamp(12px,1.2vw,18px)]",
  "grid-cols-[minmax(0,1fr)_minmax(300px,clamp(300px,30%,400px))] [grid-template-areas:'kpi_scan'_'sig_hunt'_'pul_kw']",
  "@max-[1020px]:grid-cols-2 @max-[1020px]:[grid-template-areas:'kpi_kpi'_'sig_sig'_'hunt_scan'_'pul_pul'_'kw_kw']",
  "@max-[640px]:grid-cols-1 @max-[640px]:[grid-template-areas:'kpi'_'sig'_'hunt'_'scan'_'pul'_'kw']",
);

const cardClass = "flex min-w-0 flex-col";
const kpiClass =
  "flex min-w-0 flex-col border-r border-line px-[clamp(14px,1.6vw,22px)] py-[clamp(14px,1.4vw,20px)] last:border-r-0 @max-[640px]:border-r-0 @max-[640px]:border-b";
const kpiLabelClass =
  "block truncate font-mono text-[10px] leading-[normal] font-medium tracking-[0.18em] text-ink-3";
const kpiValueClass =
  "font-mono text-[clamp(26px,2.4vw,36px)] leading-[1.1] font-medium tracking-[-0.02em]";
const kpiUnitClass =
  "font-mono text-xs leading-[normal] font-medium text-ink-3 not-italic";
const kpiFootClass = "mt-2.5 truncate text-[12px] text-ink-3";
const rowClass =
  "relative grid h-13 grid-cols-[22px_minmax(0,1fr)_auto_28px_40px] items-center gap-3 overflow-hidden border-b border-line px-4.5 transition-colors last:border-b-0 hover:bg-white/2.5 *:relative @max-[640px]:grid-cols-[22px_minmax(0,1fr)_28px_36px] before:pointer-events-none before:absolute before:top-1/2 before:-left-7.5 before:size-22.5 before:-translate-y-1/2 before:rounded-full before:bg-[radial-gradient(circle,color-mix(in_oklab,var(--pc)_16%,transparent),transparent_65%)]";
const thresholdClass =
  "absolute top-full -right-16 -translate-y-1/2 whitespace-nowrap font-mono text-[9.5px] leading-[normal] font-medium tracking-[0.14em]";

// small square that holds a platform icon
function IconBox({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "grid size-4.5 place-items-center text-(--pc) [&_svg]:size-full",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

function SourceStatus({ on, children }: { on: boolean; children: string }) {
  return (
    <em
      className={cn(
        "ml-auto flex items-center gap-1.5 font-mono text-[10.5px] leading-[normal] font-medium tracking-[0.1em] not-italic before:size-1.5 before:rounded-full",
        on ? "text-[#7be3a0] before:bg-green" : "text-ink-3 before:bg-white/25",
      )}
    >
      {children}
    </em>
  );
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatHour(hour: number) {
  const suffix = hour < 12 ? "am" : "pm";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}${suffix}`;
}

export default function DashboardPage() {
  const { limits } = usePlan();
  const stats = useStatsStore((s) => s.stats);
  const refreshStats = useStatsStore((s) => s.refresh);
  const setNewSignalsCount = useScanStore((s) => s.setNewSignalsCount);
  const toast = useToastStore((s) => s.show);

  const [mentions, setMentions] = useState<MentionRow[] | null>(null);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [scanning, setScanning] = useState(false);
  const [tip, setTip] = useState<Tip | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const rootRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLElement>(null);

  async function loadData() {
    const [rows, kws] = await Promise.all([
      apiFetch<Record<string, unknown>[]>(
        "/api/mentions?limit=500&sort=newest",
      ),
      apiFetch<Keyword[]>("/api/keywords"),
    ]);
    setMentions(rows.map(toMentionRow));
    setKeywords(kws);
    setNow(Date.now());
  }

  useEffect(() => {
    async function load() {
      try {
        await loadData();
      } catch (err) {
        toast(
          err instanceof Error ? err.message : "Couldn't load your dashboard",
        );
        setMentions([]);
      }
    }
    load();
  }, [toast]);

  const data = useMemo(() => {
    const list = mentions ?? [];
    const today = new Date(now);
    const yesterday = new Date(now - DAY);

    const todayRows = list.filter((m) =>
      isSameDay(new Date(m.createdAt), today),
    );
    const yesterdayCount = list.filter((m) =>
      isSameDay(new Date(m.createdAt), yesterday),
    ).length;

    const hours = Array.from({ length: 24 }, () => 0);
    todayRows.forEach((m) => {
      hours[new Date(m.createdAt).getHours()] += 1;
    });
    const maxHour = Math.max(...hours);
    const peakHour = maxHour > 0 ? hours.indexOf(maxHour) : null;

    const weekRows = list.filter(
      (m) => now - new Date(m.createdAt).getTime() < 7 * DAY,
    );
    const hot = weekRows.filter((m) => (m.score ?? 0) >= 8);
    const mix: Record<SignalPlatform, number> = {
      reddit: 0,
      hackernews: 0,
      bluesky: 0,
    };
    hot.forEach((m) => {
      mix[m.platform] += 1;
    });
    const ranked = (Object.entries(mix) as [SignalPlatform, number][]).sort(
      (a, b) => b[1] - a[1],
    );

    const keywordHits = keywords.map((k) => ({
      keyword: k.keyword,
      platforms: k.platforms ?? [],
      hits: weekRows.filter((m) => m.keyword === k.keyword).length,
    }));

    return {
      todayCount: todayRows.length,
      delta: todayRows.length - yesterdayCount,
      yesterdayCount,
      hours,
      maxHour,
      peakHour,
      currentHour: today.getHours(),
      hotCount: hot.length,
      mix,
      topPlatform: ranked[0][1] > 0 ? ranked[0][0] : null,
      recent: list.slice(0, 5),
      keywordHits,
      maxHits: Math.max(...keywordHits.map((k) => k.hits), 1),
      pulse: list.filter((m) => now - new Date(m.createdAt).getTime() < DAY),
      followUp:
        list.find((m) => m.status === "engaged" && m.notes) ??
        list.find((m) => m.status === "engaged") ??
        null,
    };
  }, [mentions, keywords, now]);

  const loaded = mentions !== null;

  useGSAP(
    () => {
      if (!loaded) return;
      gsap.fromTo(
        "[data-card]",
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: "power2.out" },
      );
      gsap.fromTo(
        "[data-row]",
        { opacity: 0, x: -6 },
        {
          opacity: 1,
          x: 0,
          duration: 0.35,
          stagger: 0.04,
          delay: 0.25,
          ease: "power2.out",
        },
      );
      gsap.fromTo(
        "[data-quota]",
        { scaleX: 0 },
        { scaleX: 1, duration: 1, delay: 0.3, ease: "power3.out" },
      );
      gsap.fromTo(
        "[data-hours] i",
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 0.5,
          stagger: 0.02,
          delay: 0.3,
          ease: "power2.out",
        },
      );
      gsap.fromTo(
        "[data-mix] > span",
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, delay: 0.4 },
      );
      gsap.fromTo(
        "[data-pipe] i",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.8,
          stagger: 0.08,
          delay: 0.3,
          ease: "power3.out",
        },
      );
      gsap.fromTo(
        "[data-kw-row] i",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.8,
          stagger: 0.05,
          delay: 0.35,
          ease: "power3.out",
        },
      );
      gsap.fromTo(
        "[data-line]",
        { scaleX: 0 },
        { scaleX: 1, duration: 1, delay: 0.2, ease: "power3.out" },
      );
      gsap.fromTo(
        "[data-dot]",
        { scale: 0 },
        {
          scale: 1,
          duration: 0.5,
          stagger: { each: 0.03, from: "end" },
          delay: 0.35,
          ease: "back.out(2.5)",
          clearProps: "transform",
        },
      );
    },
    { scope: rootRef, dependencies: [loaded] },
  );

  function showTip(mention: MentionRow, target: HTMLElement) {
    const box = pulseRef.current?.getBoundingClientRect();
    const dot = target.getBoundingClientRect();
    if (!box) return;
    const left = Math.max(
      0,
      Math.min(box.width - 280, dot.left - box.left - 140),
    );
    const top =
      dot.top - box.top > 100
        ? dot.top - box.top - 96
        : dot.bottom - box.top + 12;
    setTip({ mention, left, top });
  }

  async function scan() {
    if (scanning) return;
    setScanning(true);
    const prevTotal = stats?.totalSignals ?? 0;
    const bar = progressRef.current;
    const sweep = plotRef.current?.querySelector("[data-sweep]");

    if (bar) {
      gsap.fromTo(
        bar,
        { width: "0%", opacity: 1 },
        { width: "90%", duration: 40, ease: "power1.out" },
      );
    }
    if (sweep && plotRef.current) {
      gsap.fromTo(
        sweep,
        { x: 0, opacity: 1 },
        {
          x: plotRef.current.offsetWidth + 120,
          duration: 2.2,
          ease: "power1.inOut",
          repeat: -1,
        },
      );
    }

    function finish() {
      if (bar) {
        gsap.killTweensOf(bar);
        gsap.to(bar, {
          width: "100%",
          duration: 0.3,
          onComplete: () => {
            gsap.to(bar, { opacity: 0, duration: 0.3 });
          },
        });
      }
      if (sweep) {
        gsap.killTweensOf(sweep);
        gsap.set(sweep, { x: 0, opacity: 0 });
      }
      setScanning(false);
    }

    try {
      await apiFetch("/api/scan/trigger", { method: "POST" });
    } catch (err) {
      finish();
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
          if (newCount > 0) {
            setNewSignalsCount(newCount);
            toast(
              `Scan complete — ${newCount} new signal${newCount > 1 ? "s" : ""}`,
              "success",
            );
          } else {
            toast("Scan complete — nothing new yet", "success");
          }
          await loadData();
          finish();
        }
      } catch {
        clearInterval(poll);
        finish();
        toast("Lost track of the scan. Check Signals in a minute.");
      }
    }, 3000);
  }

  if (!loaded) {
    return <Loading>LOADING YOUR SIGNALS…</Loading>;
  }

  const huntCounts = stats?.huntCounts ?? {
    hunting: 0,
    interested: 0,
    engaged: 0,
    hunted: 0,
  };
  const huntSum =
    huntCounts.hunting +
    huntCounts.interested +
    huntCounts.engaged +
    huntCounts.hunted;
  const monthUsed = stats?.signalsThisMonth ?? 0;
  const monthPct = Math.min((monthUsed / limits.signals) * 100, 100);
  const nowDate = new Date(now);
  const resetDate = new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, 1);
  const monthName = nowDate
    .toLocaleDateString("en-US", { month: "long" })
    .toUpperCase();

  return (
    <div className={gridClass} ref={rootRef}>
      <Card data-card className={cn(cardClass, "[grid-area:kpi]")}>
        <div className={kpiClass}>
          <small className={kpiLabelClass}>SIGNALS · {monthName}</small>
          <div className="mt-2.5 mb-3 flex items-baseline gap-2">
            <b className={kpiValueClass}>
              <CountUp value={monthUsed} />
            </b>
            <i className={kpiUnitClass}>/ {limits.signals}</i>
          </div>
          <div className="relative h-1.5 rounded-[9px] bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.07)_0_calc(10%-2px),transparent_calc(10%-2px)_10%)]">
            <span
              data-quota
              className="absolute inset-y-0 left-0 origin-left rounded-[9px] bg-linear-to-r from-r2 to-r1 shadow-[0_0_10px_rgba(255,36,56,0.5)]"
              style={{ width: `${monthPct}%` }}
            />
          </div>
          <span className={kpiFootClass}>
            <em className="text-ink-2 not-italic">
              {Math.max(limits.signals - monthUsed, 0)} left
            </em>{" "}
            · resets{" "}
            {resetDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        <div className={kpiClass}>
          <small className={kpiLabelClass}>TODAY</small>
          <div className="mt-2.5 mb-3 flex items-baseline gap-2">
            <b className={kpiValueClass}>
              <CountUp value={data.todayCount} />
            </b>
            {data.delta !== 0 && (
              <i
                className={cn(
                  kpiUnitClass,
                  "rounded-full px-1.75 py-0.5",
                  data.delta > 0
                    ? "bg-green/10 text-[#7be3a0]"
                    : "bg-white/6 text-ink-3",
                )}
              >
                {data.delta > 0 ? `+${data.delta}` : data.delta}
              </i>
            )}
          </div>
          <div data-hours className="flex h-7 items-end gap-0.5">
            {data.hours.map((count, hour) => {
              const future = hour > data.currentHour;
              const height =
                future || count === 0
                  ? 8
                  : 30 + (count / Math.max(data.maxHour, 1)) * 70;
              return (
                <i
                  key={hour}
                  className={cn(
                    "min-h-0.5 flex-1 origin-bottom rounded-[2px] bg-white/12",
                    future && "bg-white/4",
                    !future &&
                      count > 0 &&
                      "bg-r1 shadow-[0_0_6px_rgba(255,36,56,0.5)]",
                  )}
                  style={{ height: `${height}%` }}
                  title={`${formatHour(hour)} · ${count}`}
                />
              );
            })}
          </div>
          <span className={kpiFootClass}>
            vs {data.yesterdayCount} yesterday
            {data.peakHour !== null && ` · peak ${formatHour(data.peakHour)}`}
          </span>
        </div>

        <div className={kpiClass}>
          <small className={kpiLabelClass}>HOT LEADS · 7D</small>
          <div className="mt-2.5 mb-3 flex items-baseline gap-2">
            <b
              className={cn(
                kpiValueClass,
                "text-r1 [text-shadow:0_0_18px_rgba(255,36,56,0.35)]",
              )}
            >
              <CountUp value={data.hotCount} />
            </b>
            <i className={kpiUnitClass}>intent 8+</i>
          </div>
          {data.hotCount > 0 ? (
            <div data-mix className="flex h-7.5 items-center gap-1.5">
              {PLATFORMS.filter((p) => data.mix[p.value] > 0).map((p) => (
                <span
                  key={p.value}
                  className="flex h-full min-w-0 flex-[1_1_0] items-center justify-center gap-1.5 rounded-lg bg-[color-mix(in_oklab,var(--pc)_12%,transparent)] px-2.5 font-mono text-[11.5px] leading-[normal] font-semibold text-(--pc) shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--pc)_30%,transparent),0_0_12px_color-mix(in_oklab,var(--pc)_18%,transparent)] [&_svg]:size-3.5 [&_svg]:flex-none"
                  style={
                    { "--pc": platformVar(p.value) } as React.CSSProperties
                  }
                  title={`${data.mix[p.value]} from ${p.label}`}
                >
                  <PlatformIcon platform={p.value} size={14} plain />
                  <em className="truncate font-body text-xs leading-[normal] font-medium text-ink not-italic">
                    {p.label}
                  </em>
                  {data.mix[p.value]}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex h-7.5 items-center text-[12px] text-ink-3">
              No hot leads this week yet
            </div>
          )}
          <span className={kpiFootClass}>
            {data.topPlatform
              ? `Most from ${PLATFORM_LABELS[data.topPlatform]}`
              : "Keep scanning"}
          </span>
        </div>
      </Card>

      <Card data-card className={cn(cardClass, "[grid-area:scan]")}>
        <CardHead
          title="Scanner"
          meta={stats?.autoScan === false ? "manual only" : "every 6h"}
        />
        <div className="flex flex-col border-t border-line">
          {(stats?.sources ?? []).map((src) => (
            <div
              key={src.platform}
              className="flex items-center gap-2.5 border-b border-line px-4.5 py-2.75 text-[13px] text-ink-2"
            >
              <IconBox className="size-4">
                <PlatformIcon platform={src.platform} size={15} />
              </IconBox>
              {PLATFORM_LABELS[src.platform]}
              <SourceStatus on={src.active}>
                {src.active ? "ACTIVE" : "NOT CONNECTED"}
              </SourceStatus>
            </div>
          ))}
          <div className="flex items-center gap-2.5 px-4.5 py-2.75 text-[13px] text-ink-2">
            <IconBox className="size-4 text-r1">
              <Sparkles size={15} />
            </IconBox>
            AI intent scoring<SourceStatus on>ON</SourceStatus>
          </div>
        </div>
        <div className="mt-auto border-t border-line px-4.5 pt-4 pb-4.5">
          <div className="mb-3 flex justify-between text-[12px] text-ink-3">
            <span>Last scan</span>
            <b className="font-mono text-xs leading-[normal] font-medium text-ink-2">
              {stats?.lastScannedAt ? timeAgo(stats.lastScannedAt) : "never"}
            </b>
          </div>
          <Button
            spinning={scanning}
            className="relative w-full overflow-hidden"
            onClick={scan}
            disabled={scanning}
          >
            <i
              ref={progressRef}
              className="absolute inset-y-0 left-0 w-0 bg-white/14"
            />
            <span className="relative flex items-center gap-2">
              <RefreshCw />
              {scanning ? "Scanning…" : "Scan now"}
            </span>
          </Button>
        </div>
      </Card>

      <Card data-card className={cn(cardClass, "[grid-area:sig]")}>
        <CardHead
          title="Recent signals"
          more={{ href: "/dashboard/signals", label: "View all" }}
        />
        {data.recent.length ? (
          <div className="border-t border-line">
            {data.recent.map((m) => (
              <Link
                key={m.id}
                data-row
                href="/dashboard/signals"
                className={rowClass}
                style={
                  { "--pc": platformVar(m.platform) } as React.CSSProperties
                }
              >
                <IconBox title={PLATFORM_LABELS[m.platform]}>
                  <PlatformIcon platform={m.platform} size={16} />
                </IconBox>
                <span className="truncate text-[13.5px]">{m.title}</span>
                <KwTag className="@max-[640px]:hidden">{m.keyword}</KwTag>
                <ScoreArc score={m.score} delay={0.35} />
                <span className="text-right font-mono text-[11px] leading-[normal] font-medium text-ink-3">
                  {shortAgo(m.createdAt)}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <NoData>No signals yet — add a keyword and run a scan.</NoData>
        )}
      </Card>

      <Card data-card className={cn(cardClass, "[grid-area:hunt]")}>
        <CardHead
          title="Hunt Board"
          more={{ href: "/dashboard/hunt-board", label: "Open board" }}
        />
        <div
          data-pipe
          className="mx-4.5 mb-4 flex h-1.5 gap-0.75 overflow-hidden rounded-[9px]"
        >
          {huntSum > 0 ? (
            STAGES.map((s) =>
              huntCounts[s.key] ? (
                <i
                  key={s.key}
                  className="block h-full origin-left"
                  style={{
                    flex: huntCounts[s.key] / huntSum,
                    background: s.color,
                  }}
                />
              ) : null,
            )
          ) : (
            <i className="block h-full flex-1 origin-left bg-white/7" />
          )}
        </div>
        <div className="grid grid-cols-2 border-t border-line">
          {STAGES.map((s) => (
            <Link
              key={s.key}
              href="/dashboard/hunt-board"
              className="flex items-center gap-2.5 border-b border-line px-4.5 py-3.5 text-[13px] text-ink-2 transition-colors odd:border-r hover:bg-white/2.5 hover:text-ink [&:nth-last-child(-n+2)]:border-b-0"
            >
              <StageDot color={s.color} />
              {s.label}
              <b className="ml-auto font-mono text-base leading-[normal] font-medium text-ink">
                <CountUp value={huntCounts[s.key]} />
              </b>
            </Link>
          ))}
        </div>
        <div className="mt-auto border-t border-line px-4.5 py-3.5">
          <Label className="mb-2">FOLLOW UP</Label>
          {data.followUp ? (
            <Link
              href="/dashboard/hunt-board"
              className="flex items-center gap-2.5 text-[13px] text-ink-2 hover:text-ink"
            >
              <IconBox>
                <PlatformIcon platform={data.followUp.platform} size={16} />
              </IconBox>
              <span className="min-w-0 flex-1 truncate">
                {data.followUp.notes || data.followUp.title}
              </span>
              <ScoreArc score={data.followUp.score} />
            </Link>
          ) : (
            <span className="text-[13px] text-ink-3">
              Nothing waiting on you.
            </span>
          )}
        </div>
      </Card>

      <Card data-card className={cn(cardClass, "[grid-area:pul]")}>
        <CardHead
          title="Last 24 hours"
          meta="Higher = stronger buying intent"
          more={{ href: "/dashboard/signals", label: "All signals" }}
        />
        <div className="relative mx-4 mb-3.5 min-h-47.5 flex-1" ref={pulseRef}>
          <div
            ref={plotRef}
            className="absolute top-2.5 right-16 bottom-6.5 left-0"
          >
            <div
              data-line
              className="absolute inset-x-0 top-0 h-1/5 origin-left border-b border-dashed border-r1/28 bg-linear-to-b from-r1/7 to-transparent"
            >
              <span className={cn(thresholdClass, "text-r1")}>HOT 8+</span>
            </div>
            <div
              data-line
              className="absolute inset-x-0 top-1/2 origin-left border-b border-dashed border-white/7"
            >
              <span className={cn(thresholdClass, "text-ink-3")}>WARM 5+</span>
            </div>
            <div className="absolute inset-y-0 right-0 border-r border-white/14" />
            <div
              data-sweep
              className="pointer-events-none absolute inset-y-0 -left-30 w-30 border-r border-r1/50 bg-linear-to-r from-transparent to-r1/16 opacity-0"
            />
            {data.pulse.map((m) => {
              const age = now - new Date(m.createdAt).getTime();
              const dot = DOT_SIZE[scoreTier(m.score)];
              return (
                <Link
                  key={m.id}
                  data-dot
                  href="/dashboard/signals"
                  aria-label={m.title}
                  className="absolute size-(--sz) -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--dc) shadow-[0_0_var(--gw)_color-mix(in_oklab,var(--dc)_75%,transparent)] transition-transform duration-200 hover:z-2 hover:scale-160"
                  style={
                    {
                      "--dc": scoreColor(m.score),
                      "--sz": dot.size,
                      "--gw": dot.glow,
                      left: `${100 - (age / DAY) * 100}%`,
                      top: `${100 - (m.score ?? 0) * 10}%`,
                    } as React.CSSProperties
                  }
                  onMouseEnter={(e) => showTip(m, e.currentTarget)}
                  onMouseLeave={() => setTip(null)}
                />
              );
            })}
            {data.pulse.length === 0 && (
              <div className="absolute inset-0 grid place-items-center text-[12.5px] text-ink-3">
                No mentions in the last 24 hours
              </div>
            )}
          </div>
          <div className="absolute right-16 bottom-0 left-0 flex justify-between font-mono text-[10px] leading-[normal] font-medium text-ink-3">
            <span>24h ago</span>
            <span>18h</span>
            <span>12h</span>
            <span>6h</span>
            <span>Now</span>
          </div>
          {tip && (
            <div
              className="pointer-events-none absolute z-5 w-70 rounded-xl border border-line-2 bg-[rgba(20,10,12,0.96)] px-3.5 py-3 text-[12.5px] shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
              style={{ left: tip.left, top: tip.top }}
            >
              <b className="mb-1.5 block text-[13px] leading-[1.4] font-medium">
                {tip.mention.title}
              </b>
              <span className="text-ink-3">
                {PLATFORM_LABELS[tip.mention.platform]} · {tip.mention.source} ·{" "}
                {timeAgo(tip.mention.createdAt)} · intent{" "}
                {tip.mention.score ?? "–"}
              </span>
            </div>
          )}
        </div>
      </Card>

      <Card data-card className={cn(cardClass, "[grid-area:kw]")}>
        <CardHead
          title="Keywords"
          meta="7-day hits"
          more={{ href: "/dashboard/keywords", label: "Manage" }}
        />
        {data.keywordHits.length ? (
          data.keywordHits.map((k) => (
            <div
              key={k.keyword}
              data-row
              data-kw-row
              className={cn(
                "grid h-11 grid-cols-[minmax(0,1fr)_clamp(56px,28%,140px)_36px] items-center gap-3.5 border-t border-line px-4.5 text-[13px]",
                !k.hits && "text-ink-3",
              )}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex flex-none gap-1">
                  {k.platforms.map((p) => (
                    <PlatformIcon key={p} platform={p} size={12} />
                  ))}
                </span>
                <span className="truncate">{k.keyword}</span>
              </div>
              <Bar
                pct={(k.hits / data.maxHits) * 100}
                fillClassName={k.hits ? undefined : "bg-none"}
              />
              <span className="text-right font-mono text-xs leading-[normal] font-medium text-ink-2">
                {k.hits}
              </span>
            </div>
          ))
        ) : (
          <NoData>
            <Link href="/dashboard/keywords">Add your first keyword →</Link>
          </NoData>
        )}
      </Card>
    </div>
  );
}
