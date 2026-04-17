"use client";

import { useState, useEffect } from "react";
import {
  Radio,
  Sparkles,
  ExternalLink,
  XCircle,
  Target,
  SlidersHorizontal,
  ChevronDown,
  Copy,
  Check,
} from "lucide-react";
import { FaRedditAlien, FaYCombinator } from "react-icons/fa6";
import Fire from "@/public/animations/fire.json";
import Lottie from "lottie-react";
import type { Signal, SignalType, SignalFilters } from "@/types";
import { SIGNAL_TYPE_LABELS, SIGNAL_TYPE_TAG_CLASS } from "@/lib/constants";
import { timeAgo, extractSub } from "@/lib/utils";

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
      <span className="animate-pulse inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border badge-cold">
        <span className="w-12 h-2 rounded bg-white/10" />
      </span>
    );
  }
  if (variant === "hot") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border badge-hot">
        <Lottie
          animationData={Fire}
          loop
          style={{ width: 16, height: 16, marginBottom: "0.3rem" }}
        />
        {score}/10 HOT
      </span>
    );
  }
  if (variant === "warm") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border badge-warm">
        {score}/10 WARM
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border badge-cold">
      {score}/10 COLD
    </span>
  );
}

function TypeTag({ type }: { type: SignalType }) {
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium border ${SIGNAL_TYPE_TAG_CLASS[type]}`}
    >
      {SIGNAL_TYPE_LABELS[type]}
    </span>
  );
}

function PlatformPill({
  platform,
  source,
}: {
  platform: Signal["platform"];
  source: string;
}) {
  if (platform === "reddit") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-medium text-orange-400 platform-pill-reddit">
        <FaRedditAlien size={11} />
        {source}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-medium text-orange-300 platform-pill-hn">
      <FaYCombinator size={11} />
      {source}
    </span>
  );
}

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
              ? "bg-white/8 text-white border border-white/16"
              : "text-white/35 hover:text-white/60 hover:bg-white/4"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ReplyModal({
  reply,
  loading,
  onClose,
}: {
  reply: string;
  loading: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function copyReply() {
    navigator.clipboard.writeText(reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 p-6 flex flex-col gap-5"
        style={{ background: "#111111" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-white/50" />
            <span className="text-sm font-semibold text-white">
              AI Suggested Reply
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/70 transition-colors"
          >
            <XCircle size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8">
            <Sparkles size={20} className="text-white/40 animate-pulse" />
            <p className="text-sm text-white/40">Generating reply...</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-white/70 leading-relaxed">{reply}</p>
            <button
              onClick={copyReply}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-white/10 bg-white/5 hover:bg-white/8 hover:text-white text-white/60 transition-colors"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied!" : "Copy Reply"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function SignalCard({ signal }: { signal: Signal }) {
  const [dismissed, setDismissed] = useState(false);
  const [hunting, setHunting] = useState(signal.status === "hunting");
  const [replyOpen, setReplyOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const variant = scoreVariant(signal.aiScore);

  async function addToHuntBoard() {
    setHunting(true);
    await fetch(`/api/mentions/${signal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "hunting" }),
    });
  }

  async function getReply() {
    setReplyOpen(true);
    if (reply) return;
    setReplyLoading(true);
    const res = await fetch("/api/ai/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mentionId: signal.id }),
    });
    const data = await res.json();
    setReply(data.reply ?? "Could not generate a reply.");
    setReplyLoading(false);
  }

  if (dismissed) return null;

  return (
    <>
      {replyOpen && (
        <ReplyModal
          reply={reply}
          loading={replyLoading}
          onClose={() => setReplyOpen(false)}
        />
      )}
      <div
        className={`signal-card signal-card-${variant} rounded-xl p-5 flex flex-col gap-4`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <PlatformPill platform={signal.platform} source={signal.source} />
            <span className="text-white/20 text-xs">·</span>
            <span className="text-xs text-white/30">{signal.timeAgo}</span>
          </div>
          <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-md border keyword-tag font-medium">
            {signal.keyword}
          </span>
        </div>

        <div>
          <p className="text-sm font-semibold text-white leading-snug mb-1.5">
            {signal.title}
          </p>
          {signal.body && (
            <p className="text-sm text-white/55 leading-relaxed line-clamp-2">
              {signal.body}
            </p>
          )}
        </div>

        <div
          className={`rounded-lg border p-3.5 flex flex-col gap-2.5 ai-block-${variant === "unscored" ? "cold" : variant}`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-white/40">
              <Sparkles size={12} className="text-white/50" />
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
            onClick={addToHuntBoard}
            disabled={hunting}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              hunting
                ? "bg-white/8 text-white border border-white/18 cursor-default"
                : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/8 hover:text-white hover:border-white/20"
            }`}
          >
            <Target size={12} />
            {hunting ? "In Hunt Board" : "+ Hunt Board"}
          </button>

          <button
            onClick={getReply}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/4 text-white/70 border border-white/10 hover:bg-white/7 hover:text-white hover:border-white/18 transition-colors"
          >
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
    </>
  );
}

function toSignal(row: Record<string, unknown>): Signal {
  return {
    id: row.id as string,
    platform: row.platform as Signal["platform"],
    source: extractSub(row.platform as string, row.post_url as string),
    author: (row.author as string) ?? "unknown",
    timeAgo: timeAgo(row.created_at as string),
    keyword: row.keyword as string,
    title: (row.post_title as string) ?? "(no title)",
    body: row.post_body as string,
    postUrl: row.post_url as string,
    aiScore: row.ai_score as number | null,
    aiReason: row.ai_reason as string | null,
    aiType: row.ai_type as Signal["aiType"],
    status: (row.status as Signal["status"]) ?? "new",
  };
}

export default function SignalsPage() {
  const [filters, setFilters] = useState<SignalFilters>({
    platform: "all",
    intent: "all",
    sort: "score",
    type: "all",
  });
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  const set = <K extends keyof SignalFilters>(key: K, val: SignalFilters[K]) =>
    setFilters((f) => ({ ...f, [key]: val }));

  useEffect(() => {
    const params = new URLSearchParams({
      platform: filters.platform,
      intent: filters.intent,
      type: filters.type,
      sort: filters.sort,
    });

    (async () => {
      setLoading(true);
      const r = await fetch(`/api/mentions?${params}`);
      const rows = await r.json();
      setSignals(rows.map(toSignal));
      setLoading(false);
    })();
  }, [filters]);

  const hotCount = signals.filter(
    (s) => s.aiScore !== null && s.aiScore >= 8,
  ).length;

  return (
    <div className="p-5 h-full flex gap-4 min-h-0">
      <div className="w-70 rounded-xl glass-red border border-white/5 p-5 flex flex-col gap-4 min-h-0 overflow-y-auto shrink-0">
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
            <Radio size={14} className="text-white/50" />
            <h2 className="text-sm font-semibold text-white">Signals Inbox</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40 font-semibold">
              {loading ? "—" : `${signals.length} signals`}
            </span>
          </div>
          {hotCount > 0 && (
            <div className="flex items-center gap-1 text-white/70 text-sm uppercase font-semibold">
              <Lottie
                animationData={Fire}
                loop
                style={{ width: 24, height: 24, marginBottom: "0.4rem" }}
              />
              {hotCount} hot lead{hotCount !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-3 pr-0.5">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-24">
              <div className="w-12 h-12 rounded-full bg-white/3 flex items-center justify-center">
                <Radio size={20} className="text-white/15 animate-pulse" />
              </div>
              <p className="text-sm text-white/25">Loading signals...</p>
            </div>
          ) : signals.length === 0 ? (
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
            signals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
