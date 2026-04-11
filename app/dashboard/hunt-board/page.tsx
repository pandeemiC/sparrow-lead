"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Target,
  StickyNote,
  ExternalLink,
} from "lucide-react";
import { FaRedditAlien, FaYCombinator } from "react-icons/fa6";
import Fire from "@/public/animations/fire.json";
import Lottie from "lottie-react";
import type { Lead, HuntStatus } from "@/types";
import { HUNT_COLUMNS } from "@/lib/constants";
import { timeAgo, extractSub } from "@/lib/utils";

const COLUMN_ORDER: HuntStatus[] = [
  "hunting",
  "interested",
  "engaged",
  "hunted",
];

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
  onUpdateNotes,
}: {
  lead: Lead;
  onMove: (id: string, status: HuntStatus) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(lead.notes ?? "");
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

      {editingNotes ? (
        <textarea
          autoFocus
          value={notesValue}
          onChange={(e) => setNotesValue(e.target.value)}
          onBlur={() => {
            setEditingNotes(false);
            onUpdateNotes(lead.id, notesValue);
          }}
          placeholder="Add a note..."
          rows={2}
          className="w-full text-xs text-white/50 bg-white/3 border border-white/10 rounded-lg px-2.5 py-2 resize-none outline-none focus:border-white/20 leading-relaxed placeholder:text-white/20"
        />
      ) : (
        <button
          onClick={() => setEditingNotes(true)}
          className="w-full flex items-start gap-1.5 px-2.5 py-2 rounded-lg bg-white/3 border border-white/5 text-left hover:border-white/10 transition-colors"
        >
          <StickyNote size={10} className="text-white/25 shrink-0 mt-0.5" />
          {lead.notes ? (
            <p className="text-xs text-white/40 leading-relaxed">
              {lead.notes}
            </p>
          ) : (
            <p className="text-xs text-white/20">Add a note...</p>
          )}
        </button>
      )}

      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/20">{lead.timeAgo}</span>
          <a
            href={lead.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-white/25 hover:text-white/50 transition-colors"
          >
            <ExternalLink size={9} /> View Post
          </a>
        </div>
        <div className="flex items-center gap-1.5">
          {prev && (
            <button
              onClick={() => onMove(lead.id, prev)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold text-white/30 hover:text-white/60 border border-white/8 hover:border-white/20 transition-colors"
            >
              <ChevronLeft size={10} /> Back
            </button>
          )}
          {next && (
            <button
              onClick={() => onMove(lead.id, next)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-white/5 text-white/60 border border-white/10 hover:bg-white/8 hover:text-white hover:border-white/20 transition-colors"
            >
              {nextLabel} <ChevronRight size={10} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({
  id,
  label,
  color,
  leads,
  onMove,
  onUpdateNotes,
}: {
  id: HuntStatus;
  label: string;
  color: string;
  leads: Lead[];
  onMove: (id: string, status: HuntStatus) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}) {
  return (
    <div className="flex-1 flex flex-col gap-3 min-h-0">
      <div className="rounded-xl glass-red border border-white/5 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Target size={13} className={color} />
          <span className={`text-sm font-semibold ${color}`}>{label}</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-white/40 font-semibold">
          {leads.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-2.5 pr-0.5">
        {leads.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12 rounded-xl border border-dashed border-white/8">
            <p className="text-xs text-white/20">No leads here</p>
          </div>
        ) : (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onMove={onMove}
              onUpdateNotes={onUpdateNotes}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function HuntBoardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch(
        "/api/mentions?status=hunting,interested,engaged,hunted&sort=newest&limit=100",
      );
      const rows = await res.json();
      setLeads(
        rows.map((row: Record<string, unknown>) => ({
          id: row.id as string,
          title: (row.post_title as string) ?? "(no title)",
          source: extractSub(row.platform as string, row.post_url as string),
          platform: row.platform as Lead["platform"],
          postUrl: row.post_url as string,
          keyword: row.keyword as string,
          timeAgo: timeAgo(row.created_at as string),
          aiScore: row.ai_score as number | null,
          aiReason: row.ai_reason as string | null,
          status: row.status as HuntStatus,
          notes: row.notes as string | null,
        })),
      );
    }
    load();
  }, []);

  async function move(id: string, status: HuntStatus) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    await fetch(`/api/mentions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  function updateNotes(id: string, notes: string) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, notes } : l)));
  }
  return (
    <div className="p-5 h-full flex gap-4 min-h-0">
      {HUNT_COLUMNS.map((col) => (
        <KanbanColumn
          key={col.id}
          {...col}
          leads={leads.filter((l) => l.status === col.id)}
          onMove={move}
          onUpdateNotes={updateNotes}
        />
      ))}
    </div>
  );
}
