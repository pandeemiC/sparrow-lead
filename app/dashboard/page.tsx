"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { SiReddit, SiYcombinator } from "react-icons/si";
import { FaRedditAlien, FaYCombinator } from "react-icons/fa6";
import type { Stats } from "@/types";
import { timeAgo } from "@/lib/utils";

const sources = [
  { label: "Reddit", icon: SiReddit, active: true },
  { label: "Hacker News", icon: SiYcombinator, active: true },
];

const huntColumns = [
  {
    key: "hunting",
    label: "Hunting",
    color: "text-white/50",
    dot: "bg-white/20",
  },
  {
    key: "interested",
    label: "Interested",
    color: "text-blue-400",
    dot: "bg-blue-400",
  },
  {
    key: "engaged",
    label: "Engaged",
    color: "text-amber-400",
    dot: "bg-amber-400",
  },
  {
    key: "hunted",
    label: "Hunted",
    color: "text-emerald-400",
    dot: "bg-emerald-400",
  },
] as const;


export default function DashboardPage() {
  const [scanning, setScanning] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);

  async function loadStats() {
    const r = await fetch("/api/stats");
    const data = await r.json();
    setStats(data);
  }

  useEffect(() => {
    async function load() {
      await loadStats();
    }
    load();
  }, []);

  async function scan() {
    setScanning(true);
    await fetch("/api/scan", { method: "POST" });
    setScanning(false);
    loadStats();
  }

  const totalHunted = stats
    ? Object.values(stats.huntCounts).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="p-5 h-full flex gap-4">
      <div className="flex flex-col flex-6 gap-4 min-h-0 min-w-0">
        <div className="flex-1 rounded-xl glass-red border border-white/5 p-5 flex flex-col min-h-0 glow-b-right">
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
                <div className="flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/3 border border-white/5">
                  <FaRedditAlien
                    size={13}
                    className="text-orange-400 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">
                      Reddit
                    </p>
                    <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-orange-500/40"
                        style={{ width: "60%" }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-white/60 shrink-0">
                    Active
                  </span>
                </div>
                <div className="flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/3 border border-white/5">
                  <FaYCombinator
                    size={13}
                    className="text-orange-300 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">
                      Hacker News
                    </p>
                    <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-orange-400/30"
                        style={{ width: "40%" }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-white/60 shrink-0">
                    Active
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/3 border border-white/5">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: "rgba(175,4,4,0.15)" }}
                >
                  <Zap size={12} className="text-sparrow-red" />
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
                  style={{ background: "rgba(175,4,4,0.15)" }}
                >
                  <Zap size={12} className="text-sparrow-red" />
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
          <div className="flex-1 flex flex-col px-4 py-4 rounded-xl glass-red border border-white/5 gap-3 min-h-0 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Total Signals</p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(175,4,4,0.12)" }}>
                <Radio size={13} className="text-sparrow-red" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-white leading-none">
                {stats?.totalSignals ?? <span className="text-white/20 text-lg">—</span>}
              </p>
              <p className="text-[10px] text-white/25 mt-1">mentions captured</p>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 min-h-0">
              {stats?.recentSignals && stats.recentSignals.length > 0 ? (
                stats.recentSignals.map((s) => (
                  <a
                    key={s.id}
                    href={s.post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/3 border-l-2 hover:bg-white/5 transition-colors ${
                      s.ai_score !== null && s.ai_score >= 8 ? "border-l-red-600/50" :
                      s.ai_score !== null && s.ai_score >= 5 ? "border-l-amber-600/50" :
                      "border-l-white/10"
                    }`}
                  >
                    {s.platform === "reddit"
                      ? <FaRedditAlien size={9} className="text-orange-400 shrink-0" />
                      : <FaYCombinator size={9} className="text-orange-300 shrink-0" />
                    }
                    <span className="text-[10px] text-white/50 truncate flex-1">{s.post_title}</span>
                    {s.ai_score !== null && (
                      <span className={`text-[9px] font-bold shrink-0 ${
                        s.ai_score >= 8 ? "text-red-400" :
                        s.ai_score >= 5 ? "text-amber-400" : "text-white/25"
                      }`}>{s.ai_score}</span>
                    )}
                  </a>
                ))
              ) : (
                <p className="text-[10px] text-white/20">No signals yet</p>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col px-4 py-4 rounded-xl glass-red border border-white/5 gap-3 min-h-0 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Signals Today</p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(59,130,246,0.1)" }}>
                <TrendingUp size={13} className="text-blue-400" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-white leading-none">
                {stats?.signalsToday ?? <span className="text-white/20 text-lg">—</span>}
              </p>
              <p className="text-[10px] text-white/25 mt-1">in last 24h</p>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 min-h-0">
              {stats?.topSignals && stats.topSignals.length > 0 ? (
                stats.topSignals.map((s) => (
                  <a
                    key={s.id}
                    href={s.post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/3 border-l-2 hover:bg-white/5 transition-colors ${
                      s.ai_score !== null && s.ai_score >= 8 ? "border-l-red-600/50" :
                      s.ai_score !== null && s.ai_score >= 5 ? "border-l-amber-600/50" :
                      "border-l-white/10"
                    }`}
                  >
                    {s.platform === "reddit"
                      ? <FaRedditAlien size={9} className="text-orange-400 shrink-0" />
                      : <FaYCombinator size={9} className="text-orange-300 shrink-0" />
                    }
                    <span className="text-[10px] text-white/50 truncate flex-1">{s.post_title}</span>
                    {s.ai_score !== null && (
                      <span className={`text-[9px] font-bold shrink-0 ${
                        s.ai_score >= 8 ? "text-red-400" :
                        s.ai_score >= 5 ? "text-amber-400" : "text-white/25"
                      }`}>{s.ai_score}</span>
                    )}
                  </a>
                ))
              ) : (
                <p className="text-[10px] text-white/20">No signals today</p>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col px-4 py-4 rounded-xl glass-red border border-white/5 gap-3 min-h-0 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Keywords</p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(16,185,129,0.1)" }}>
                <Tag size={13} className="text-emerald-400" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-white leading-none">
                {stats?.keywordsTracked ?? <span className="text-white/20 text-lg">—</span>}
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
                    {kw.platform === "reddit"
                      ? <FaRedditAlien size={9} className="text-orange-400 shrink-0" />
                      : <FaYCombinator size={9} className="text-orange-300 shrink-0" />
                    }
                    <span className="text-[10px] text-white/50 truncate flex-1">{kw.keyword}</span>
                    <span className="text-[9px] text-white/25 shrink-0">{kw.mention_count} hits</span>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-white/20">No keywords yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-4 gap-4 min-h-0">
        <div className="flex-1 rounded-xl glass-red border border-white/5 p-5 flex flex-col min-h-0 glow-t-right">
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
                <a
                  key={lead.id}
                  href={lead.post_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/3 border-l-2 hover:bg-white/5 transition-colors ${
                    lead.ai_score !== null && lead.ai_score >= 8 ? "border-l-red-600/50" :
                    lead.ai_score !== null && lead.ai_score >= 5 ? "border-l-amber-600/50" :
                    "border-l-white/10"
                  }`}
                >
                  {lead.platform === "reddit"
                    ? <FaRedditAlien size={9} className="text-orange-400 shrink-0" />
                    : <FaYCombinator size={9} className="text-orange-300 shrink-0" />
                  }
                  <span className="text-[10px] text-white/50 truncate flex-1">{lead.post_title}</span>
                  <span className={`text-[9px] font-bold shrink-0 ${
                    lead.status === "interested" ? "text-blue-400" : "text-white/30"
                  }`}>
                    {lead.status === "interested" ? "Interested" : "Hunting"}
                  </span>
                  {lead.ai_score !== null && (
                    <span className={`text-[9px] font-bold shrink-0 ${
                      lead.ai_score >= 8 ? "text-red-400" :
                      lead.ai_score >= 5 ? "text-amber-400" : "text-white/25"
                    }`}>{lead.ai_score}</span>
                  )}
                </a>
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
              <p className="text-[10px] text-white/15">Add signals to the Hunt Board</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 px-5 py-4 rounded-xl glass-red border border-white/5">
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
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-sparrow-red hover:bg-sparrow-bright text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ScanLine size={15} className={scanning ? "animate-spin" : ""} />
            {scanning ? "Scanning..." : "Scan Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
