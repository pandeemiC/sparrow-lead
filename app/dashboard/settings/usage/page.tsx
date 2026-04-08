"use client";

import { BarChart2 } from "lucide-react";

const currentPlan = "free";

const limits: Record<
  string,
  { keywords: number; signals: number; scans: number }
> = {
  free: { keywords: 5, signals: 100, scans: 30 },
  pro: { keywords: 25, signals: 2000, scans: -1 },
  growth: { keywords: -1, signals: 10000, scans: -1 },
};

const used = { keywords: 0, signals: 0, scans: 0 };
const limit = limits[currentPlan];
const resetDate = "Apr 30, 2026";

function UsageBar({
  label,
  used,
  limit,
  unit,
}: {
  label: string;
  used: number;
  limit: number;
  unit?: string;
}) {
  const unlimited = limit === -1;
  const pct = unlimited ? 0 : Math.min((used / limit) * 100, 100);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-sm text-white/40">
          {used.toLocaleString()}
          {unlimited
            ? " / Unlimited"
            : ` / ${limit.toLocaleString()}${unit ? ` ${unit}` : ""}`}
        </p>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full bg-[rgba(175,4,4,0.6)] transition-all"
          style={{ width: unlimited ? "0%" : `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function SettingsUsage() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl glass-red border border-white/5 p-6 glow-right flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-lg glass-red border border-white/10">
            <BarChart2 size={22} className="text-white/50" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-white capitalize">
              {currentPlan} plan
            </p>
            <p className="text-sm text-white/35">Usage resets on {resetDate}</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 text-white/40 shrink-0">
          Current period
        </span>
      </div>

      <div className="rounded-xl glass-red border border-white/5 p-6 glow-t-right">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-6">
          This Period
        </h2>
        <div className="space-y-6">
          <UsageBar
            label="Keywords"
            used={used.keywords}
            limit={limit.keywords}
          />
          <div className="h-px bg-white/5" />
          <UsageBar
            label="Signals Scanned"
            used={used.signals}
            limit={limit.signals}
          />
          <div className="h-px bg-white/5" />
          <UsageBar
            label="Scans Run"
            used={used.scans}
            limit={limit.scans}
            unit="scans"
          />
        </div>
      </div>

      <div className="rounded-xl glass-red border border-white/5 p-6">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-6">
          Recent Scans
        </h2>
        <div className="space-y-1">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-4 px-3 py-2">
            <span className="text-xs text-white/25 uppercase tracking-wider">
              Date
            </span>
            <span className="text-xs text-white/25 uppercase tracking-wider">
              Signals Found
            </span>
            <span className="text-xs text-white/25 uppercase tracking-wider">
              Keywords
            </span>
          </div>
          <div className="h-px bg-white/5" />
          <div className="px-3 py-6 text-center">
            <p className="text-sm text-white/25">No scans run yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
