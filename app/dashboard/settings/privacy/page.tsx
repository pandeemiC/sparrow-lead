"use client";

import { useState } from "react";
import { RiShieldKeyholeLine } from "react-icons/ri";
import { Toggle, Row } from "@/components/ui/SettingsUI";

export default function SettingsPrivacy() {
  const [usageAnalytics, setUsageAnalytics] = useState(true);
  const [scanPersonalization, setScanPersonalization] = useState(true);

  return (
    <div className="space-y-4">
      <div className="rounded-xl glass-red border border-white/5 p-6 glow-right">
        <div className="flex items-center gap-3 mb-6 glass-red border border-white/10 rounded-lg px-3 py-2 w-fit">
          <RiShieldKeyholeLine size={20} className="text-white/40 shrink-0" />
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
            Privacy
          </h2>
        </div>
        <div className="space-y-5">
          <Row
            title="Usage Analytics"
            description="Share anonymous usage data to help improve Sparrow"
            right={
              <Toggle enabled={usageAnalytics} onChange={setUsageAnalytics} />
            }
          />
          <div className="h-px bg-white/5" />
          <Row
            title="Scan Personalization"
            description="Allow scan history to be used to improve your signal relevance scores"
            right={
              <Toggle
                enabled={scanPersonalization}
                onChange={setScanPersonalization}
              />
            }
          />
          <div className="h-px bg-white/5" />
          <Row
            title="Export Your Data"
            description="Download a copy of all your keywords, signals, and account data"
            right={<button className="edit-btn">Export</button>}
          />
        </div>
      </div>
    </div>
  );
}
