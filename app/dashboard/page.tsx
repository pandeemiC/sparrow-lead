"use client";

import {
  Radio,
  Tag,
  ScanLine,
  TrendingUp,
  Target,
  Clock,
  Circle,
} from "lucide-react";
import { SiReddit, SiYcombinator } from "react-icons/si";
import type { Stats } from "@/types";
import { useState, useEffect } from "react";

const huntColumns = [
  { key: "hunting",    label: "Hunting" },
  { key: "interested", label: "Interested" },
  { key: "engaged",    label: "Engaged" },
  { key: "hunted",     label: "Hunted" },
] as const;

const sources = [
  { label: "Reddit", icon: SiReddit, active: true },
  { label: "Hacker News", icon: SiYcombinator, active: true },
];

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function DashboardPage() {
  const [scanning, setScanning] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);

  async function loadStats() {
    const res = await fetch("/api/stats");
    const data = await res.json();
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

  const statCards = [
    { label: "Total Signals", icon: Radio, value: stats?.totalSignals },
    { label: "Signals Today", icon: TrendingUp, value: stats?.signalsToday },
    { label: "Keywords Tracked", icon: Tag, value: stats?.keywordsTracked },
  ];

  return (
    <div className="p-5 h-full flex gap-4">
      <div className="flex flex-col flex-6 gap-4 min-h-0">
        <div className="flex-1 rounded-xl glass-red border border-white/5 p-5 flex flex-col min-h-0 basis-1/2 glow-b-right">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-white">Recent Signals</h2>
            <Radio size={14} className="text-white/20" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/3 flex items-center justify-center">
              <Radio size={18} className="text-white/15" />
            </div>
            <p className="text-sm text-white/25">No signals yet</p>
            <p className="text-xs text-white/15">
              Run a scan to start listening
            </p>
          </div>
        </div>

        <div className="flex gap-4 basis-1/2">
          {statCards.map(({ label, value }) => (
            <div
              key={label}
              className="flex-1 flex flex-col px-5 py-4 rounded-xl glass-red border border-white/5"
            >
              <div className="flex items-center justify-between mb-auto">
                <p className="text-[10px] text-white/40 uppercase tracking-widest leading-none">
                  {label}
                </p>
                {label === "Total Signals" && (
                  <Radio size={13} className="text-white/20" />
                )}
                {label === "Signals Today" && (
                  <TrendingUp size={13} className="text-white/20" />
                )}
                {label === "Keywords Tracked" && (
                  <Tag size={13} className="text-white/20" />
                )}
              </div>
              <div className="flex-1 flex items-center justify-center py-3">
                {value !== undefined ? (
                  <p className="text-2xl font-bold text-white">{value}</p>
                ) : (
                  <p className="text-xs text-white/20">—</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col flex-4 gap-4 min-h-0">
        <div className="flex-1 rounded-xl glass-red border border-white/5 p-5 flex flex-col min-h-0 glow-t-right">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-white">Hunt Board</h2>
            <Target size={14} className="text-white/20" />
          </div>

          <div className="grid grid-cols-4 gap-2 mb-5">
            {huntColumns.map(({ key, label }) => (
              <div
                key={key}
                className="flex flex-col items-center gap-1.5 py-2.5 rounded-lg bg-white/3 border border-white/5"
              >
                <span className="text-lg font-bold text-white">
                  {stats ? stats.huntCounts[key] : "—"}
                </span>
                <span className="text-[10px] text-white/30 uppercase tracking-wider">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/3 flex items-center justify-center">
              <Target size={18} className="text-white/15" />
            </div>
            <p className="text-sm text-white/25">No leads yet</p>
            <p className="text-xs text-white/15">Signal replies become leads</p>
          </div>
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
