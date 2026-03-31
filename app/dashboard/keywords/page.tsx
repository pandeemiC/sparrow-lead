"use client";

import { Tag, Radio } from "lucide-react";
import KeywordManager from "@/components/dashboard/KeywordManager";
import MentionsList from "@/components/dashboard/MentionsList";

export default function KeywordsPage() {
  return (
    <div className="p-5 h-full flex gap-4 min-h-0">
      <div className="flex-3 rounded-xl glass-red border border-white/5 p-5 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-white">Keywords</h2>
          <Tag size={14} className="text-white/20" />
        </div>
        <KeywordManager />
      </div>

      <div className="flex-7 rounded-xl glass-red border border-white/5 p-5 flex flex-col min-h-0 glow-b-right">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-white">Signals</h2>
          <Radio size={14} className="text-white/20" />
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          <MentionsList />
        </div>
      </div>
    </div>
  );
}
