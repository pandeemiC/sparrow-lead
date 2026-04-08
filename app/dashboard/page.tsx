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

const stats = [
  { label: "Total Signals", value: "0", icon: Radio },
  { label: "Signals Today", value: "0", icon: TrendingUp },
  { label: "Keywords Tracked", value: "0", icon: Tag },
];

const huntColumns = [
  { label: "Hunting", value: 0 },
  { label: "Interested", value: 0 },
  { label: "Engaged", value: 0 },
  { label: "Hunted", value: 0 },
];

const sources = [
  { label: "Reddit", icon: SiReddit, active: true },
  { label: "Hacker News", icon: SiYcombinator, active: true },
];

export default function DashboardPage() {
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
          {stats.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="flex-1 flex flex-col px-5 py-4 rounded-xl glass-red border border-white/5"
            >
              <div className="flex items-center justify-between mb-auto">
                <p className="text-[10px] text-white/40 uppercase tracking-widest leading-none">
                  {label}
                </p>
                <Icon size={13} className="text-white/20" />
              </div>
              <div className="flex-1 flex items-center justify-center py-3">
                <p className="text-xs text-white/20">No data yet</p>
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
            {huntColumns.map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 py-2.5 rounded-lg bg-white/3 border border-white/5"
              >
                <span className="text-lg font-bold text-white">{value}</span>
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
                <p className="text-xs text-white/25">Never</p>
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
          <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-sparrow-red hover:bg-sparrow-bright text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer">
            <ScanLine size={15} />
            Scan Now
          </button>
        </div>
      </div>
    </div>
  );
}
