"use client";

import { useState } from "react";
import { Toggle, Row, Select } from "@/components/ui/SettingsUI";

export default function SettingsScanPreferences() {
  const [scanFreq, setScanFreq] = useState("manual");
  const [scanDepth, setScanDepth] = useState("standard");
  const [reddit, setReddit] = useState(true);
  const [hackernews, setHackernews] = useState(true);
  const [twitter, setTwitter] = useState(false);
  const [deduplication, setDeduplication] = useState(true);

  return (
    <div className="space-y-4">
      <div className="rounded-xl glass-red border border-white/5 p-6 glow-right">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-6">
          Scan Schedule
        </h2>
        <Row
          title="Scan Frequency"
          description="How often Sparrow automatically scans for new signals"
          right={
            <Select
              value={scanFreq}
              onChange={setScanFreq}
              options={[
                { label: "Manual only", value: "manual" },
                { label: "Daily", value: "daily" },
                { label: "Twice a day", value: "twice_daily" },
                { label: "Weekly", value: "weekly" },
              ]}
            />
          }
        />
      </div>

      <div className="rounded-xl glass-red border border-white/5 p-6 glow-t-right">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-6">
          Sources
        </h2>
        <div className="space-y-5">
          <Row
            title="Reddit"
            description="Scan subreddits and comments for keyword mentions"
            right={<Toggle enabled={reddit} onChange={setReddit} />}
          />
          <div className="h-px bg-white/5" />
          <Row
            title="Hacker News"
            description="Scan posts and threads on Hacker News"
            right={<Toggle enabled={hackernews} onChange={setHackernews} />}
          />
          <div className="h-px bg-white/5" />
          <Row
            title="Twitter / X"
            description="Scan tweets and replies — coming soon"
            right={<Toggle enabled={twitter} onChange={setTwitter} />}
          />
        </div>
      </div>

      <div className="rounded-xl glass-red border border-white/5 p-6">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-6">
          Results
        </h2>
        <div className="space-y-5">
          <Row
            title="Scan Depth"
            description="How far back each scan searches for mentions"
            right={
              <Select
                value={scanDepth}
                onChange={setScanDepth}
                options={[
                  { label: "Light — last 24h", value: "light" },
                  { label: "Standard — last 7d", value: "standard" },
                  { label: "Deep — last 30d", value: "deep" },
                ]}
              />
            }
          />
          <div className="h-px bg-white/5" />
          <Row
            title="Deduplication"
            description="Filter out signals already seen in a previous scan"
            right={
              <Toggle enabled={deduplication} onChange={setDeduplication} />
            }
          />
        </div>
      </div>
    </div>
  );
}
