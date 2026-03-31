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
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-white/10 transition-colors duration-200 ${enabled ? "bg-[rgba(175,4,4,0.7)]" : "bg-white/10"}`}
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
    <div>
      <p>SettingsNotification</p>
    </div>
  );
}
