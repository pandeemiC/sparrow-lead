"use client";

import { Radio, Tag, Target, ScanLine } from "lucide-react";

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
            <Radio size={32} className="text-white/8" />
            <p className="text-sm text-white/25">
              No signals yet — run a scan to get started
            </p>
          </div>
        </div>

        <div className="flex gap-4 basis-1/2">
          <div className="flex-1 flex items-center gap-4 px-5 py-4 rounded-xl glass-red border border-white/5">
            <Radio size={18} className="text-sparrow-red shrink-0" />
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest leading-none mb-1.5">
                Total Signals
              </p>
              <p className="text-2xl font-bold text-white leading-none">0</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-4 px-5 py-4 rounded-xl glass-red border border-white/5">
            <Radio size={18} className="text-sparrow-red shrink-0" />
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest leading-none mb-1.5">
                Signals Today
              </p>
              <p className="text-2xl font-bold text-white leading-none">0</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-4 px-5 py-4 rounded-xl glass-red border border-white/5">
            <Tag size={18} className="text-sparrow-red shrink-0" />
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest leading-none mb-1.5">
                Keywords Tracked
              </p>
              <p className="text-2xl font-bold text-white leading-none">0</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-4 gap-4 min-h-0">
        <div className="flex-1 rounded-xl glass-red border border-white/5 p-5 flex flex-col min-h-0 glow-b-left">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-white">Hunt Board</h2>
            <Target size={14} className="text-white/20" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <Target size={32} className="text-white/8" />
            <p className="text-sm text-white/25 text-center">
              No leads tracked yet
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between px-5 py-4 rounded-xl glass-red border border-white/5">
          <div>
            <p className="text-sm font-medium text-white/50">Last scanned</p>
            <p className="text-xs text-white/20 mt-0.5">Never</p>
          </div>
          <button className="flex items-center justify-center gap-2 w-full py-2 bg-sparrow-red hover:bg-sparrow-bright text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer">
            <ScanLine size={15} />
            Scan Now
          </button>
        </div>
      </div>
    </div>
  );
}
