"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, RefreshCw, Sparkles } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import PlatformIcon from "@/components/ui/PlatformIcon";
import ScoreArc from "@/components/sp/ScoreArc";
import CountUp from "@/components/sp/CountUp";
import { apiFetch } from "@/lib/apiFetch";
import { toMentionRow } from "@/lib/mentions";
import { platformVar, scoreColor, scoreTier, shortAgo } from "@/lib/score";
import { timeAgo } from "@/lib/utils";
import { PLATFORMS, PLATFORM_LABELS } from "@/lib/constants";
import { usePlan } from "@/components/dashboard/PlanContext";
import { useStatsStore } from "@/store/statsStore";
import { useScanStore } from "@/store/scanStore";
import { useToastStore } from "@/store/toastStore";
import type { Keyword, MentionRow, SignalPlatform } from "@/types";

const DAY = 24 * 60 * 60 * 1000;

const STAGES = [
  { key: "hunting", label: "Hunting", color: "#B9B2B3" },
  { key: "interested", label: "Interested", color: "var(--amber)" },
  { key: "engaged", label: "Engaged", color: "var(--r1)" },
  { key: "hunted", label: "Hunted", color: "var(--green)" },
] as const;

type Tip = { mention: MentionRow; left: number; top: number };

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
        ".sp-dash > .sp-card",
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: "power2.out" },
      );
      gsap.fromTo(
        ".sp-sr, .sp-kwrow",
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
        ".sp-quota span",
        { scaleX: 0 },
        { scaleX: 1, duration: 1, delay: 0.3, ease: "power3.out" },
      );
      gsap.fromTo(
        ".sp-hours i",
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
        ".sp-mix span",
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, delay: 0.4 },
      );
      gsap.fromTo(
        ".sp-pipe i",
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
        ".sp-kwrow .sp-bar i",
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
        ".sp-band, .sp-midline",
        { scaleX: 0 },
        { scaleX: 1, duration: 1, delay: 0.2, ease: "power3.out" },
      );
      gsap.fromTo(
        ".sp-dt",
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
    const sweep = plotRef.current?.querySelector(".sp-sweep");

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
    return <div className="sp-loading">LOADING YOUR SIGNALS…</div>;
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
    <div className="sp-dash" ref={rootRef}>
      <div className="sp-card sp-kpis b-kpi">
        <div className="sp-kpi">
          <small>SIGNALS · {monthName}</small>
          <div className="sp-kv">
            <b>
              <CountUp value={monthUsed} />
            </b>
            <i>/ {limits.signals}</i>
          </div>
          <div className="sp-quota">
            <span style={{ width: `${monthPct}%` }} />
          </div>
          <span className="sp-kf">
            <em>{Math.max(limits.signals - monthUsed, 0)} left</em> · resets{" "}
            {resetDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        <div className="sp-kpi">
          <small>TODAY</small>
          <div className="sp-kv">
            <b>
              <CountUp value={data.todayCount} />
            </b>
            {data.delta !== 0 && (
              <i className={data.delta > 0 ? "up" : "down"}>
                {data.delta > 0 ? `+${data.delta}` : data.delta}
              </i>
            )}
          </div>
          <div className="sp-hours">
            {data.hours.map((count, hour) => {
              const future = hour > data.currentHour;
              const height =
                future || count === 0
                  ? 8
                  : 30 + (count / Math.max(data.maxHour, 1)) * 70;
              return (
                <i
                  key={hour}
                  className={future ? "fut" : count ? "on" : ""}
                  style={{ height: `${height}%` }}
                  title={`${formatHour(hour)} · ${count}`}
                />
              );
            })}
          </div>
          <span className="sp-kf">
            vs {data.yesterdayCount} yesterday
            {data.peakHour !== null && ` · peak ${formatHour(data.peakHour)}`}
          </span>
        </div>

        <div className="sp-kpi hot">
          <small>HOT LEADS · 7D</small>
          <div className="sp-kv">
            <b>
              <CountUp value={data.hotCount} />
            </b>
            <i>intent 8+</i>
          </div>
          {data.hotCount > 0 ? (
            <div className="sp-mix">
              {PLATFORMS.filter((p) => data.mix[p.value] > 0).map((p) => (
                <span
                  key={p.value}
                  style={
                    { "--pc": platformVar(p.value) } as React.CSSProperties
                  }
                  title={`${data.mix[p.value]} from ${p.label}`}
                >
                  <PlatformIcon platform={p.value} size={14} plain />
                  <em>{p.label}</em>
                  {data.mix[p.value]}
                </span>
              ))}
            </div>
          ) : (
            <div className="sp-mix-none">No hot leads this week yet</div>
          )}
          <span className="sp-kf">
            {data.topPlatform
              ? `Most from ${PLATFORM_LABELS[data.topPlatform]}`
              : "Keep scanning"}
          </span>
        </div>
      </div>

      <div className="sp-card b-scan">
        <div className="sp-c-h">
          <b>Scanner</b>
          <span className="meta">
            {stats?.autoScan === false ? "manual only" : "every 6h"}
          </span>
        </div>
        <div className="sp-src">
          {(stats?.sources ?? []).map((src) => (
            <div key={src.platform}>
              <span className="sp-pi">
                <PlatformIcon platform={src.platform} size={15} />
              </span>
              {PLATFORM_LABELS[src.platform]}
              <em className={src.active ? "" : "off"}>
                {src.active ? "ACTIVE" : "NOT CONNECTED"}
              </em>
            </div>
          ))}
          <div>
            <span className="sp-pi" style={{ color: "var(--r1)" }}>
              <Sparkles size={15} />
            </span>
            AI intent scoring<em>ON</em>
          </div>
        </div>
        <div className="sp-scan">
          <div className="sp-scan-m">
            <span>Last scan</span>
            <b>
              {stats?.lastScannedAt ? timeAgo(stats.lastScannedAt) : "never"}
            </b>
          </div>
          <button
            className={`sp-btn ${scanning ? "spin" : ""}`}
            onClick={scan}
            disabled={scanning}
          >
            <i className="pg" ref={progressRef} />
            <span>
              <RefreshCw />
              {scanning ? "Scanning…" : "Scan now"}
            </span>
          </button>
        </div>
      </div>

      <div className="sp-card b-sig">
        <div className="sp-c-h">
          <b>Recent signals</b>
          <Link className="more" href="/dashboard/signals">
            View all <ArrowUpRight />
          </Link>
        </div>
        {data.recent.length ? (
          <div className="sp-rows">
            {data.recent.map((m) => (
              <Link
                key={m.id}
                href="/dashboard/signals"
                className="sp-sr"
                style={
                  { "--pc": platformVar(m.platform) } as React.CSSProperties
                }
              >
                <span className="sp-pi" title={PLATFORM_LABELS[m.platform]}>
                  <PlatformIcon platform={m.platform} size={16} />
                </span>
                <span className="t">{m.title}</span>
                <span className="sp-kwt">{m.keyword}</span>
                <ScoreArc score={m.score} delay={0.35} />
                <span className="sp-ago">{shortAgo(m.createdAt)}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="sp-nodata">
            No signals yet — add a keyword and run a scan.
          </div>
        )}
      </div>

      <div className="sp-card b-hunt">
        <div className="sp-c-h">
          <b>Hunt Board</b>
          <Link className="more" href="/dashboard/hunt-board">
            Open board <ArrowUpRight />
          </Link>
        </div>
        <div className="sp-pipe">
          {huntSum > 0 ? (
            STAGES.map((s) =>
              huntCounts[s.key] ? (
                <i
                  key={s.key}
                  style={{
                    flex: huntCounts[s.key] / huntSum,
                    background: s.color,
                  }}
                />
              ) : null,
            )
          ) : (
            <i style={{ flex: 1, background: "rgba(255,255,255,.07)" }} />
          )}
        </div>
        <div className="sp-stg">
          {STAGES.map((s) => (
            <Link
              key={s.key}
              href="/dashboard/hunt-board"
              style={{ "--sc": s.color } as React.CSSProperties}
            >
              <span className="sp-dot" />
              {s.label}
              <b>
                <CountUp value={huntCounts[s.key]} />
              </b>
            </Link>
          ))}
        </div>
        <div className="sp-next">
          <small>FOLLOW UP</small>
          {data.followUp ? (
            <Link href="/dashboard/hunt-board">
              <span className="sp-pi">
                <PlatformIcon platform={data.followUp.platform} size={16} />
              </span>
              <span className="t">
                {data.followUp.notes || data.followUp.title}
              </span>
              <ScoreArc score={data.followUp.score} />
            </Link>
          ) : (
            <span style={{ fontSize: 13, color: "var(--ink-3)" }}>
              Nothing waiting on you.
            </span>
          )}
        </div>
      </div>

      <div className="sp-card b-pulse">
        <div className="sp-c-h">
          <b>Last 24 hours</b>
          <span className="meta">Higher = stronger buying intent</span>
          <Link className="more" href="/dashboard/signals">
            All signals <ArrowUpRight />
          </Link>
        </div>
        <div className="sp-pulse" ref={pulseRef}>
          <div className="sp-plot" ref={plotRef}>
            <div className="sp-band">
              <span className="sp-thr" style={{ color: "var(--r1)" }}>
                HOT 8+
              </span>
            </div>
            <div className="sp-midline">
              <span className="sp-thr" style={{ color: "var(--ink-3)" }}>
                WARM 5+
              </span>
            </div>
            <div className="sp-now" />
            <div className="sp-sweep" />
            {data.pulse.map((m) => {
              const age = now - new Date(m.createdAt).getTime();
              return (
                <Link
                  key={m.id}
                  href="/dashboard/signals"
                  className={`sp-dt ${scoreTier(m.score)}`}
                  aria-label={m.title}
                  style={
                    {
                      "--dc": scoreColor(m.score),
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
              <div className="sp-pulse-empty">
                No mentions in the last 24 hours
              </div>
            )}
          </div>
          <div className="sp-xax">
            <span>24h ago</span>
            <span>18h</span>
            <span>12h</span>
            <span>6h</span>
            <span>Now</span>
          </div>
          {tip && (
            <div className="sp-tip" style={{ left: tip.left, top: tip.top }}>
              <b>{tip.mention.title}</b>
              <span>
                {PLATFORM_LABELS[tip.mention.platform]} · {tip.mention.source} ·{" "}
                {timeAgo(tip.mention.createdAt)} · intent{" "}
                {tip.mention.score ?? "–"}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="sp-card b-kw">
        <div className="sp-c-h">
          <b>Keywords</b>
          <span className="meta">7-day hits</span>
          <Link className="more" href="/dashboard/keywords">
            Manage <ArrowUpRight />
          </Link>
        </div>
        {data.keywordHits.length ? (
          data.keywordHits.map((k) => (
            <div key={k.keyword} className={`sp-kwrow ${k.hits ? "" : "zero"}`}>
              <div className="n">
                <span className="icons">
                  {k.platforms.map((p) => (
                    <PlatformIcon key={p} platform={p} size={12} />
                  ))}
                </span>
                <span>{k.keyword}</span>
              </div>
              <div className="sp-bar">
                <i
                  style={{
                    width: `${(k.hits / data.maxHits) * 100}%`,
                    background: k.hits ? undefined : "transparent",
                  }}
                />
              </div>
              <span className="c">{k.hits}</span>
            </div>
          ))
        ) : (
          <div className="sp-nodata">
            <Link href="/dashboard/keywords">Add your first keyword →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
