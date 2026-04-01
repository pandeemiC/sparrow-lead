"use client";

import { useState } from "react";
import {
  Radio,
  Sparkles,
  ExternalLink,
  XCircle,
  Target,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { FaRedditAlien, FaYCombinator } from "react-icons/fa6";
import Fire from "@/public/animations/fire.json";
import Lottie from "lottie-react";
import type { Signal, SignalType } from "@/types";
import { MOCK_SIGNALS, SIGNAL_TYPE_LABELS } from "@/lib/constants";

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <span className="animate-pulse inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border bg-white/5 text-white/20 border-white/10">
        <span className="w-12 h-2 rounded bg-white/10" />
      </span>
    );
  }
  if (score >= 8) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border bg-[rgba(175,4,4,0.3)] text-red-300 border-red-500/30">
        <Lottie animationData={Fire} loop style={{ width: 16, height: 16 }} />
        {score}/10 HOT
      </span>
    );
  }
  if (score >= 5) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border bg-[rgba(180,120,0,0.2)] text-amber-300 border-amber-500/30">
        {score}/10 WARM
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border bg-white/5 text-white/30 border-white/10">
      {score}/10 COLD
    </span>
  );
}

function TypeTag({ type }: { type: SignalType }) {
  return (
    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-white/40 border border-white/8">
      {SIGNAL_TYPE_LABELS[type]}
    </span>
  );
}

function PlatformIcon({ platform }: { platform: Signal["platform"] }) {
  if (platform === "reddit")
    return <FaRedditAlien size={13} className="text-orange-500 shrink-0" />;
  return <FaYCombinator size={13} className="text-orange-400 shrink-0" />;
}

function SignalCard({ signal }: { signal: Signal }) {
  const [dismissed, setDismissed] = useState(false);
  const [hunting, setHunting] = useState(signal.status === "hunting");

  if (dismissed) return null;

  return (
    <div className="signal-card rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <PlatformIcon platform={signal.platform} />
          <span className="text-xs text-white/50 font-medium">
            {signal.source}
          </span>
          <span className="text-white/20 text-xs">·</span>
          <span className="text-xs text-white/30">{signal.timeAgo}</span>
        </div>
        <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/8 text-white/40 font-medium">
          {signal.keyword}
        </span>
      </div>

      <div>
        <p className="text-sm font-semibold text-white leading-snug mb-1.5">
          {signal.title}
        </p>
        <p className="text-sm text-white/40 leading-relaxed line-clamp-2">
          {signal.body}
        </p>
      </div>

      <div className="rounded-lg bg-white/[0.02] border border-white/8 p-3.5 flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-white/40">
            <Sparkles size={12} className="text-sparrow-red" />
            <span className="text-[10px] font-semibold uppercase tracking-widest">
              AI Analysis
            </span>
          </div>
          <ScoreBadge score={signal.aiScore} />
        </div>

        {signal.aiScore !== null ? (
          <div className="flex items-start gap-2 flex-wrap">
            <p className="text-xs text-white/55 leading-relaxed flex-1 min-w-0">
              {signal.aiReason}
            </p>
            {signal.aiType && <TypeTag type={signal.aiType} />}
          </div>
        ) : (
          <p className="text-xs text-white/30 italic">Scoring this signal...</p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setHunting(true)}
          disabled={hunting}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            hunting
              ? "bg-sparrow-red/20 text-sparrow-red border border-sparrow-red/30 cursor-default"
              : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/8 hover:text-white hover:border-white/20"
          }`}
        >
          <Target size={12} />
          {hunting ? "In Hunt Board" : "+ Hunt Board"}
        </button>

        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[rgba(175,4,4,0.15)] text-red-300 border border-red-500/20 hover:bg-[rgba(175,4,4,0.25)] transition-colors">
          <Sparkles size={12} />
          Get Reply
        </button>

        <a
          href={signal.postUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-white/50 border border-white/10 hover:text-white hover:border-white/20 transition-colors"
        >
          <ExternalLink size={12} />
          View
        </a>

        <button
          onClick={() => setDismissed(true)}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/25 hover:text-white/60 transition-colors"
        >
          <XCircle size={12} />
          Dismiss
        </button>
      </div>
    </div>
  );
}

type Filters = {
  platform: "all" | "reddit" | "hackernews";
  intent: "all" | "high" | "medium" | "low";
  sort: "score" | "newest" | "oldest";
  type: "all" | SignalType;
};

function FilterSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-3"
      >
        <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">
          {label}
        </span>
        <ChevronDown
          size={12}
          className={`text-white/30 transition-transform ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && children}
    </div>
  );
}

function RadioGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors ${
            value === opt.value
              ? "bg-sparrow-red/15 text-red-300 border border-red-500/20"
              : "text-white/40 hover:text-white/70 hover:bg-white/5"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function SignalsPage() {
  const [filters, setFilters] = useState<Filters>({
    platform: "all",
    intent: "all",
    sort: "score",
    type: "all",
  });

  const set = <K extends keyof Filters>(key: K, val: Filters[K]) =>
    setFilters((f) => ({ ...f, [key]: val }));

  const filtered = MOCK_SIGNALS.filter((s) => {
    if (filters.platform !== "all" && s.platform !== filters.platform)
      return false;
    if (filters.type !== "all" && s.aiType !== filters.type) return false;
    if (filters.intent === "high" && (s.aiScore === null || s.aiScore < 8))
      return false;
    if (
      filters.intent === "medium" &&
      (s.aiScore === null || s.aiScore < 5 || s.aiScore > 7)
    )
      return false;
    if (filters.intent === "low" && (s.aiScore === null || s.aiScore > 4))
      return false;
    return true;
  }).sort((a, b) => {
    if (filters.sort === "score") return (b.aiScore ?? -1) - (a.aiScore ?? -1);
    return 0;
  });

  const hotCount = MOCK_SIGNALS.filter(
    (s) => s.aiScore !== null && s.aiScore >= 8,
  ).length;

  return (
    <div className="p-5 h-full flex gap-4 min-h-0">
      <div className="flex-2 rounded-xl glass-red border border-white/5 p-5 flex flex-col gap-4 min-h-0 overflow-y-auto shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Filters</h2>
          <SlidersHorizontal size={14} className="text-white/20" />
        </div>

        <div className="flex flex-col gap-4">
          <FilterSection label="Platform">
            <RadioGroup
              value={filters.platform}
              onChange={(v) => set("platform", v)}
              options={[
                { label: "All Platforms", value: "all" },
                { label: "Reddit", value: "reddit" },
                { label: "Hacker News", value: "hackernews" },
              ]}
            />
          </FilterSection>

          <FilterSection label="Intent Score">
            <RadioGroup
              value={filters.intent}
              onChange={(v) => set("intent", v)}
              options={[
                { label: "All", value: "all" },
                { label: "High  8+", value: "high" },
                { label: "Medium  5–7", value: "medium" },
                { label: "Low  <5", value: "low" },
              ]}
            />
          </FilterSection>

          <FilterSection label="Signal Type">
            <RadioGroup
              value={filters.type}
              onChange={(v) => set("type", v)}
              options={[
                { label: "All Types", value: "all" },
                { label: "Seeking Rec", value: "seeking_recommendation" },
                { label: "Pain Point", value: "pain_point" },
                { label: "Competitor", value: "competitor_complaint" },
                { label: "Question", value: "question" },
                { label: "General", value: "general" },
              ]}
            />
          </FilterSection>

          <FilterSection label="Sort By">
            <RadioGroup
              value={filters.sort}
              onChange={(v) => set("sort", v)}
              options={[
                { label: "AI Score", value: "score" },
                { label: "Newest", value: "newest" },
                { label: "Oldest", value: "oldest" },
              ]}
            />
          </FilterSection>
        </div>
      </div>

      <div className="flex-8 flex flex-col gap-4 min-h-0 min-w-0">
        <div className="rounded-xl glass-red border border-white/5 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Radio size={14} className="text-sparrow-red" />
            <h2 className="text-sm font-semibold text-white">Signals Inbox</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40 font-semibold">
              {filtered.length} signals
            </span>
          </div>
          {hotCount > 0 && (
            <div className="flex items-center gap-1 text-red-300 text-xs font-semibold">
              <Lottie animationData={Fire} loop style={{ width: 16, height: 16 }} />
              {hotCount} hot lead{hotCount !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-3 pr-0.5">
          {filtered.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-24">
              <div className="w-12 h-12 rounded-full bg-white/3 flex items-center justify-center">
                <Radio size={20} className="text-white/15" />
              </div>
              <p className="text-sm text-white/25">
                No signals match your filters
              </p>
              <p className="text-xs text-white/15">
                Try adjusting or clearing the filters
              </p>
            </div>
          ) : (
            filtered.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
