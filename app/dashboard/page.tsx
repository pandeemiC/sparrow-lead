"use client";

import { useScanStore } from "@/store/scanStore";
import { apiFetch } from "@/lib/apiFetch";
import { useToastStore } from "@/store/toastStore";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Radio,
  Tag,
  ScanLine,
  TrendingUp,
  Target,
  Clock,
  Circle,
  ArrowUpRight,
  Zap,
  Check,
  Loader,
} from "lucide-react";
import { SiReddit, SiYcombinator, SiBluesky } from "react-icons/si";
import PlatformIcon from "@/components/ui/PlatformIcon";
import { PLATFORMS } from "@/lib/constants";
import type { Stats } from "@/types";
import { timeAgo } from "@/lib/utils";

const SCAN_STEPS = [
  "Fetching keywords",
  "Scanning your sources",
  "Running AI analysis",
];

const sources = [
  { label: "Reddit", icon: SiReddit, active: true },
  { label: "Hacker News", icon: SiYcombinator, active: true },
  { label: "Bluesky", icon: SiBluesky, active: true },
];

const huntColumns = [
  {
    key: "hunting",
    label: "Hunting",
    color: "text-red-400",
    dot: "bg-red-400/50",
  },
  {
    key: "interested",
    label: "Interested",
    color: "text-sky-400",
    dot: "bg-sky-400/55",
  },
  {
    key: "engaged",
    label: "Engaged",
    color: "text-amber-400",
    dot: "bg-amber-400/55",
  },
  {
    key: "hunted",
    label: "Hunted",
    color: "text-emerald-400",
    dot: "bg-emerald-400/60",
  },
] as const;

function scoreMeta(score: number | null) {
  if (score === null)
    return {
      border: "rgba(255,255,255,0.06)",
      glow: "transparent",
      text: "text-white/20",
      barColor: "rgba(255,255,255,0.06)",
      scoreColor: "text-white/20",
      bars: 0,
    };
  if (score >= 8)
    return {
      border: "rgb(239,68,68)",
      glow: "rgba(239,68,68,0.22)",
      text: "text-red-400",
      barColor: "rgb(239,68,68)",
      scoreColor: "text-red-400/80",
      bars: 3,
    };
  if (score >= 5)
    return {
      border: "rgb(249,115,22)",
      glow: "rgba(249,115,22,0.14)",
      text: "text-orange-400",
      barColor: "rgb(249,115,22)",
      scoreColor: "text-orange-400/80",
      bars: 2,
    };
  return {
    border: "rgb(59,130,246)",
    glow: "rgba(59,130,246,0.14)",
    text: "text-blue-400",
    barColor: "rgb(59,130,246)",
    scoreColor: "text-blue-400/80",
    bars: 1,
  };
}

function ScoreBars({ score }: { score: number | null }) {
  const { bars, barColor, scoreColor } = scoreMeta(score);
  return (
    <div className="flex items-center gap-1 shrink-0">
      <div className="flex items-end gap-px h-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-0.75 rounded-full"
            style={{
              height: i === 1 ? 6 : i === 2 ? 9 : 12,
              background: i <= bars ? barColor : "rgba(255,255,255,0.06)",
            }}
          />
        ))}
      </div>
      {score !== null && (
        <span className={`text-[9px] font-bold tabular-nums ${scoreColor}`}>
          {score}
        </span>
      )}
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  hunting: "text-red-400",
  interested: "text-sky-400",
  engaged: "text-amber-400",
  hunted: "text-emerald-400",
};

function SignalPill({
  s,
  status,
}: {
  s: {
    id: string | number;
    post_url: string;
    post_title: string;
    platform: string;
    ai_score: number | null;
  };
  status?: string;
}) {
  const { border, glow } = scoreMeta(s.ai_score);
  return (
    <a
      href={s.post_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/4 transition-colors"
      style={{
        background: "rgba(255,255,255,0.025)",
        borderLeft: `2px solid ${border}`,
        boxShadow: `inset 3px 0 10px -5px ${glow}`,
      }}
    >
      <div
        className="w-4 h-4 rounded flex items-center justify-center shrink-0"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <PlatformIcon platform={s.platform} size={8} />
      </div>
      <span className="text-[10px] text-white/55 truncate flex-1 leading-none">
        {s.post_title}
      </span>
      {status && (
        <span
          className={`text-[9px] font-semibold shrink-0 capitalize ${STATUS_COLORS[status] ?? "text-white/30"}`}
        >
          {status}
        </span>
      )}
      <ScoreBars score={s.ai_score} />
    </a>
  );
}

export default function DashboardPage() {
  const [scanning, setScanning] = useState(false);
  const [scanPhase, setScanPhase] = useState<number | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  const setNewSignalsCount = useScanStore((s) => s.setNewSignalsCount);
  const toast = useToastStore((s) => s.show);

  useEffect(() => {
    async function load() {
      try {
        setStats(await apiFetch<Stats>("/api/stats"));
      } catch (err) {
        toast(err instanceof Error ? err.message : "Couldn't load your stats");
      }
    }
    load();
  }, [toast]);

  function endScan() {
    setScanning(false);
    setScanPhase(null);
  }

  async function scan() {
    if (scanning) return;
    setScanning(true);
    setScanPhase(0);
    const prevTotal = stats?.totalSignals ?? 0;

    try {
      await apiFetch("/api/scan/trigger", { method: "POST" });
    } catch (err) {
      endScan();
      toast(err instanceof Error ? err.message : "Couldn't start the scan");
      return;
    }

    let attempts = 0;
    const poll = setInterval(async () => {
      attempts++;
      if (attempts === 1) setScanPhase(1);
      if (attempts === 3) setScanPhase(2);
      try {
        const data = await apiFetch<Stats>("/api/stats");
        setStats(data);

        if (data.totalSignals > prevTotal || attempts >= 15) {
          clearInterval(poll);
          const newCount = data.totalSignals - prevTotal;
          if (newCount > 0) setNewSignalsCount(newCount);
          setScanPhase(3);
          setTimeout(endScan, 1500);
        }
      } catch {
        clearInterval(poll);
        endScan();
        toast("Lost track of the scan. Check Signals in a minute.");
      }
    }, 3000);
  }

  const totalHunted = stats
    ? Object.values(stats.huntCounts).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="p-5 h-full flex gap-4 overflow-hidden">
      <div className="flex flex-col flex-6 gap-4 min-h-0 min-w-0">
        <div className="flex-1 rounded-xl card p-5 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">
                Recent Signals
              </h2>
              {stats && stats.totalSignals > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-white/40 font-semibold">
                  {stats.totalSignals} total
                </span>
              )}
            </div>
            <a
              href="/dashboard/signals"
              className="flex items-center gap-1 text-[10px] text-white/25 hover:text-white/50 transition-colors"
            >
              View all <ArrowUpRight size={10} />
            </a>
          </div>

          {stats && stats.totalSignals > 0 ? (
            <div className="flex-1 flex flex-col justify-center gap-3">
              <div className="flex items-center gap-3">
                {PLATFORMS.map((p) => (
                  <div
                    key={p.value}
                    className="flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/3 border border-white/5"
                  >
                    <PlatformIcon
                      platform={p.value}
                      size={13}
                      className="shrink-0"
                    />
                    <p className="flex-1 text-[10px] text-white/40 uppercase tracking-widest truncate">
                      {p.label}
                    </p>
                    <span className="text-xs font-semibold text-white/60 shrink-0">
                      Active
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/3 border border-white/5">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <Zap size={12} className="text-white/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/60">AI scoring active</p>
                  <p className="text-[10px] text-white/25">
                    Every new mention is scored on scan
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-400/70">Live</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/3 border border-white/5">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <Zap size={12} className="text-white/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/60">AI input active</p>
                  <p className="text-[10px] text-white/25">
                    Signals receive AI input for relevance
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-400/70">Live</span>
                </div>
              </div>

              <a
                href="/dashboard/signals"
                className="flex items-center justify-center gap-2 py-2 rounded-lg border border-white/8 text-xs text-white/30 hover:text-white/60 hover:border-white/15 transition-colors"
              >
                Open Signals Inbox <ArrowUpRight size={11} />
              </a>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/3 flex items-center justify-center">
                <Radio size={18} className="text-white/15" />
              </div>
              <p className="text-sm text-white/25">No signals yet</p>
              <p className="text-xs text-white/15">
                Run a scan to start listening
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-4 flex-1 min-h-0">
          <div className="flex-1 flex flex-col px-4 py-4 rounded-xl card gap-3 min-h-0 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-white/40 uppercase tracking-widest">
                Total Signals
              </p>
              <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-white/4 border border-white/6">
                <Radio size={13} className="text-white/50" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-white leading-none stat-num-glow">
                {stats?.totalSignals ?? (
                  <span className="text-white/20 text-lg">—</span>
                )}
              </p>
              <p className="text-[10px] text-white/25 mt-1">
                mentions captured
              </p>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 min-h-0">
              {stats?.recentSignals && stats.recentSignals.length > 0 ? (
                stats.recentSignals.map((s) => <SignalPill key={s.id} s={s} />)
              ) : (
                <p className="text-[10px] text-white/20">No signals yet</p>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col px-4 py-4 rounded-xl card gap-3 min-h-0 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-white/40 uppercase tracking-widest">
                Signals Today
              </p>
              <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-white/4 border border-white/6">
                <TrendingUp size={13} className="text-white/50" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-white leading-none stat-num-glow">
                {stats?.signalsToday ?? (
                  <span className="text-white/20 text-lg">—</span>
                )}
              </p>
              <p className="text-[10px] text-white/25 mt-1">in last 24h</p>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 min-h-0">
              {stats?.topSignals && stats.topSignals.length > 0 ? (
                stats.topSignals.map((s) => <SignalPill key={s.id} s={s} />)
              ) : (
                <p className="text-[10px] text-white/20">No signals today</p>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col px-4 py-4 rounded-xl card gap-3 min-h-0 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-white/40 uppercase tracking-widest">
                Keywords
              </p>
              <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-white/4 border border-white/6">
                <Tag size={13} className="text-white/50" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-white leading-none stat-num-glow">
                {stats?.keywordsTracked ?? (
                  <span className="text-white/20 text-lg">—</span>
                )}
              </p>
              <p className="text-[10px] text-white/25 mt-1">being tracked</p>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 min-h-0">
              {stats?.keywords && stats.keywords.length > 0 ? (
                stats.keywords.map((kw) => (
                  <div
                    key={kw.keyword}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/3 border border-white/5"
                  >
                    <span className="flex items-center gap-1 shrink-0">
                      {(kw.platforms ?? []).map((p) => (
                        <PlatformIcon key={p} platform={p} size={9} />
                      ))}
                    </span>
                    <span className="text-[10px] text-white/50 truncate flex-1">
                      {kw.keyword}
                    </span>
                    <span className="text-[9px] text-white/25 shrink-0">
                      {kw.mention_count} hits
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-white/20">No keywords yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-4 gap-4 min-h-0 min-w-0">
        <div className="flex-1 rounded-xl auth-panel p-5 flex flex-col min-h-0 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">Hunt Board</h2>
              {totalHunted > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-white/40 font-semibold">
                  {totalHunted} leads
                </span>
              )}
            </div>
            <a
              href="/dashboard/hunt-board"
              className="flex items-center gap-1 text-[10px] text-white/25 hover:text-white/50 transition-colors"
            >
              Open board <ArrowUpRight size={10} />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {huntColumns.map(({ key, label, color, dot }) => (
              <div
                key={key}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/3 border border-white/5"
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
                <span className={`text-xs font-medium flex-1 ${color}`}>
                  {label}
                </span>
                <span className="text-sm font-bold text-white">
                  {stats ? stats.huntCounts[key] : "—"}
                </span>
              </div>
            ))}
          </div>

          {stats?.huntLeads && stats.huntLeads.length > 0 ? (
            <div className="flex flex-col gap-1.5 flex-1 min-h-0 overflow-y-auto">
              {stats.huntLeads.map((lead) => (
                <SignalPill key={lead.id} s={lead} status={lead.status} />
              ))}
              <a
                href="/dashboard/hunt-board"
                className="flex items-center justify-center gap-2 py-2 rounded-lg border border-white/8 text-xs text-white/30 hover:text-white/60 hover:border-white/15 transition-colors mt-auto"
              >
                Manage leads <ArrowUpRight size={11} />
              </a>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/3 flex items-center justify-center">
                <Target size={14} className="text-white/15" />
              </div>
              <p className="text-xs text-white/25">No leads yet</p>
              <p className="text-[10px] text-white/15">
                Add signals to the Hunt Board
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 px-5 py-4 rounded-xl card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Last Scanned</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock size={11} className="text-white/20" />
                <p className="text-xs text-white/25">
                  {stats?.lastScannedAt
                    ? timeAgo(stats.lastScannedAt)
                    : "Never"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {sources.map(({ label, icon: Icon, active }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon
                    size={13}
                    className={active ? "text-white/40" : "text-white/15"}
                  />
                  <Circle
                    size={5}
                    className={
                      active
                        ? "fill-green-400 text-green-400"
                        : "fill-white/20 text-white/20"
                    }
                  />
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={scan}
            disabled={scanning}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md text-white text-sm font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: scanning
                ? "rgba(255,255,255,0.06)"
                : "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
            onMouseEnter={(e) => {
              if (!scanning) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,255,255,0.12)";
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "rgba(255,255,255,0.2)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.08)";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "rgba(255,255,255,0.12)";
            }}
          >
            <ScanLine size={15} className={scanning ? "animate-spin" : ""} />
            {scanning ? SCAN_STEPS[Math.min(scanPhase ?? 0, 2)] : "Scan Now"}
          </button>

          <AnimatePresence>
            {scanPhase !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-1.5 overflow-hidden pt-1"
              >
                {SCAN_STEPS.map((step, i) => {
                  const done = scanPhase > i;
                  const active = scanPhase === i;
                  return (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: scanPhase < i ? 0.2 : 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-2"
                    >
                      {done ? (
                        <Check
                          size={11}
                          className="text-emerald-400 shrink-0"
                        />
                      ) : active ? (
                        <Loader
                          size={11}
                          className="text-red-400 animate-spin shrink-0"
                        />
                      ) : (
                        <div className="w-2.75 h-2.75 rounded-full border border-white/15 shrink-0" />
                      )}
                      <span
                        className={`text-[11px] ${done ? "text-emerald-400/60" : active ? "text-white/60" : "text-white/20"}`}
                      >
                        {step}
                      </span>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
