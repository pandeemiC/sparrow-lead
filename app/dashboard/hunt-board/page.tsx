"use client";

import { useState } from "react";
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Target,
  StickyNote,
} from "lucide-react";
import { FaRedditAlien, FaYCombinator } from "react-icons/fa6";
import Fire from "@/public/animations/fire.json";
import Lottie from "lottie-react";
import type { Lead, HuntStatus } from "@/types";
import { MOCK_LEADS, HUNT_COLUMNS } from "@/lib/constants";

const COLUMN_ORDER: HuntStatus[] = ["hunting", "interested", "replied", "won"];

function scoreVariant(
  score: number | null,
): "hot" | "warm" | "cold" | "unscored" {
  if (score === null) return "unscored";
  if (score >= 8) return "hot";
  if (score >= 5) return "warm";
  return "cold";
}

function ScoreBadge({ score }: { score: number | null }) {
  const variant = scoreVariant(score);

  if (variant === "unscored") {
    return (
      <span className="animate-pulse inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border badge-cold">
        <span className="w-8 h-2 rounded bg-white/10" />
      </span>
    );
  }
  if (variant === "hot") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border badge-hot">
        <Lottie
          animationData={Fire}
          loop
          style={{ width: 14, height: 14, marginBottom: "0.3rem" }}
        />
        {score}/10
      </span>
    );
  }
  if (variant === "warm") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border badge-warm">
        {score}/10
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border badge-cold">
      {score}/10
    </span>
  );
}

function PlatformIcon({ platform }: { platform: Lead["platform"] }) {
  if (platform === "reddit")
    return <FaRedditAlien size={11} className="text-orange-400 shrink-0" />;
  return <FaYCombinator size={11} className="text-orange-300 shrink-0" />;
}

function LeadCard({
  lead,
  onMove,
}: {
  lead: Lead;
  onMove: (id: string, status: HuntStatus) => void;
}) {
  const currentIndex = COLUMN_ORDER.indexOf(lead.status);
  const prev = COLUMN_ORDER[currentIndex - 1] as HuntStatus | undefined;
  const next = COLUMN_ORDER[currentIndex + 1] as HuntStatus | undefined;
  const nextLabel = HUNT_COLUMNS.find((c) => c.id === next)?.label;
  const variant = scoreVariant(lead.aiScore);

  return (
    <div
      className={`signal-card signal-card-${variant} rounded-xl p-4 flex flex-col gap-3`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <PlatformIcon platform={lead.platform} />
          <span className="text-xs text-white/40">{lead.source}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] px-1.5 py-0.5 rounded border keyword-tag font-medium">
            {lead.keyword}
          </span>
          <ScoreBadge score={lead.aiScore} />
        </div>
      </div>

      {/* title row */}
      <p className="text-sm font-semibold text-white leading-snug">
        {lead.title}
      </p>
      {lead.aiReason && (
        <div
          className={`rounded-lg border p-2.5 ai-block-${variant === "unscored" ? "cold" : variant}`}
        >
          <div className="flex items-center gap-1 mb-1">
            <Sparkles size={10} className="text-sparrow-red" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
              AI
            </span>
          </div>
          <p className="text-xs text-white/50 leading-relaxed">
            {lead.aiReason}
          </p>
        </div>
      )}

      {lead.notes && (
        <div className="flex items-start gap-1.5 px-2.5 py-2 rounded-lg bg-white/3 border border-white/5">
          <StickyNote size={10} className="text-white/25 shrink-0 mt-0.5" />
          <p className="text-white/40 leading-relaxed">{lead.notes}</p>
        </div>
      )}
    </div>
  );
}

export default function HuntBoardPage() {
  return (
    <div>
      <p>Hunt-Board Page</p>
    </div>
  );
}
