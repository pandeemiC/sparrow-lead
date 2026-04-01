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
    ></div>
  );
}

export default function HuntBoardPage() {
  return (
    <div>
      <p>Hunt-Board Page</p>
    </div>
  );
}
