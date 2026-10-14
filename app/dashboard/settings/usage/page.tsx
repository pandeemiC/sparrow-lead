"use client";

import { BarChart2 } from "lucide-react";
import { usePlan } from "@/components/dashboard/PlanContext";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { useToastStore } from "@/store/toastStore";
import type { Stats } from "@/types";
import { SettingsCard } from "@/components/ui/SettingsUI";
import { SectionTitle } from "@/components/sp/ui";

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
          className="h-full rounded-full bg-red-600/80 transition-all"
          style={{ width: unlimited ? "0%" : `${pct}%` }}
        />
      </div>
    </div>
  );
}

function nextResetDate() {
  const now = new Date();
  const firstOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return firstOfNextMonth.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function SettingsUsage() {
  const { plan, limits } = usePlan();
  const [used, setUsed] = useState({ keywords: 0, signals: 0 });
  const toast = useToastStore((s) => s.show);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch<Stats>("/api/stats");
        setUsed({ keywords: data.keywordsTracked, signals: data.totalSignals });
      } catch (err) {
        toast(err instanceof Error ? err.message : "Couldn't load usage");
      }
    }
    load();
  }, [toast]);

  const resetDate = nextResetDate();

  return (
    <div className="space-y-4">
      <SettingsCard className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-panel-2 border border-line-2">
            <BarChart2 size={22} className="text-white/50" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-white capitalize">
              {plan} plan
            </p>
            <p className="text-sm text-white/35">Usage resets on {resetDate}</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 text-white/40 shrink-0">
          Current period
        </span>
      </SettingsCard>

      <SettingsCard>
        <SectionTitle>This Period</SectionTitle>
        <div className="space-y-6">
          <UsageBar
            label="Keywords"
            used={used.keywords}
            limit={limits.keywords}
          />
          <div className="h-px bg-white/5" />
          <UsageBar
            label="Signals Scanned"
            used={used.signals}
            limit={limits.signals}
          />
        </div>
      </SettingsCard>
    </div>
  );
}
