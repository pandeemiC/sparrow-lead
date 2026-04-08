"use client";

import { useState } from "react";
import { Toggle, Row, Select } from "@/components/ui/SettingsUI";

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
              <Select
                value={digestFreq}
                onChange={setDigestFreq}
                options={[
                  { label: "Instant", value: "instant" },
                  { label: "Daily", value: "daily" },
                  { label: "Weekly", value: "weekly" },
                ]}
              />
            }
          />
          <div className="h-px bg-white/5" />
          <Row
            title="Minimum Relevance Threshold"
            description="Only alert on signals at or above this relevance score"
            right={
              <Select
                value={minRelevance}
                onChange={setMinRelevance}
                options={[
                  { label: "Any", value: "any" },
                  { label: "Low", value: "low" },
                  { label: "Medium", value: "medium" },
                  { label: "High", value: "high" },
                ]}
              />
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
          description="Weekly email with total signals found, keyword performance, and Hunt Board activity"
          right={<Toggle enabled={weeklySummary} onChange={setWeeklySummary} />}
        />
      </div>
    </div>
  );
}
