"use client";

import { useState } from "react";

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-5.5 w-9 shrink-0 cursor-pointer rounded-full border border-white/10 transition-colors duration-200 ${enabled ? "bg-[rgba(175,4,4,0.7)]" : "bg-white/10"}`}
    >
      <span
        className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform duration-200 ${enabled ? "translate-x-4" : "translate-x-0.5"}`}
      />
    </button>
  );
}

function Row({
  title,
  description,
  right,
}: {
  title: string;
  description: string;
  right: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="space-y-1">
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-sm text-white/35">{description}</p>
      </div>
      {right}
    </div>
  );
}

export default function SettingsNotifications() {
  const [newSignals, setNewSignals] = useState(true);
  const [digestFreq, setDigestFreq] = useState("daily");
  const [minRelevance, setMinRelevance] = useState("medium");
  const [scanComplete, setScanComplete] = useState(false);
  const [huntBoard, setHuntBoard] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);

  return (
    <div className="space-y-4">
      <div className="rounded-xl glass-red border border-white/5 p-6 glow-right">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-6">
          Signal Alerts
        </h2>
        <div className="space-y-5">
          <Row
            title="New Signal Alerts"
            description="Email when a scan finds new mentions matching your keywords"
            right={<Toggle enabled={newSignals} onChange={setNewSignals} />}
          />
          <div className="h-px bg-white/5" />
          <Row
            title="Alert Digest Frequency"
            description="How often to bundle and send signal notifications"
            right={
              <select
                value={digestFreq}
                onChange={(e) => setDigestFreq(e.target.value)}
                className="select-act"
              >
                <option value="instant" className="bg-[#1a1a1a]">
                  Instant
                </option>
                <option value="daily" className="bg-[#1a1a1a]">
                  Daily
                </option>
                <option value="weekly" className="bg-[#1a1a1a]">
                  Weekly
                </option>
              </select>
            }
          />
          <div className="h-px bg-white/5" />
          <Row
            title="Minimum Relevance Threshold"
            description="Only alert on signal at or above this relevance score"
            right={
              <select
                value={minRelevance}
                onChange={(e) => setMinRelevance(e.target.value)}
                className="select-act"
              >
                <option value="any" className="bg-[#1a1a1a]">
                  Any
                </option>
                <option value="low" className="bg-[#1a1a1a]">
                  Low
                </option>
                <option value="medium" className="bg-[#1a1a1a]">
                  Medium
                </option>
                <option value="high" className="bg-[#1a1a1a]">
                  High
                </option>
              </select>
            }
          />
        </div>
      </div>

      <div className="rounded-xl glass-red border border-white/5 p-6 glow-t-right">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-6">
          Scans
        </h2>
        <Row
          title="Scan Completion"
          description="Notify when a manual scan finishes running"
          right={<Toggle enabled={scanComplete} onChange={setScanComplete} />}
        />
      </div>

      <div className="rounded-xl glass-red border border-white/5 p-6">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-6">
          Hunt Board
        </h2>
        <Row
          title="Lead Status Updates"
          description="Notify when a lead moves to a new stage on the Hunt Board"
          right={<Toggle enabled={huntBoard} onChange={setHuntBoard} />}
        />
      </div>

      <div className="rounded-xl glass-red border border-white/5 p-6">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-6">
          Digest
        </h2>
        <Row
          title="Weekly Summary"
          description="Weekly email with total signals found, keywords performance and hunt Board activity"
          right={<Toggle enabled={weeklySummary} onChange={setWeeklySummary} />}
        />
      </div>
    </div>
  );
}
