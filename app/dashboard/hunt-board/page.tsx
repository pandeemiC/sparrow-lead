"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ExternalLink,
  StickyNote,
  Target,
  X,
} from "lucide-react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";
import PlatformIcon from "@/components/ui/PlatformIcon";
import ScoreArc from "@/components/sp/ScoreArc";
import { apiFetch } from "@/lib/apiFetch";
import { toMentionRow } from "@/lib/mentions";
import { platformVar, shortAgo } from "@/lib/score";
import { PLATFORMS, PLATFORM_LABELS } from "@/lib/constants";
import { useStatsStore } from "@/store/statsStore";
import { useToastStore } from "@/store/toastStore";
import type { HuntStatus, MentionRow, SignalPlatform } from "@/types";

gsap.registerPlugin(Flip);

const STAGES: {
  key: HuntStatus;
  label: string;
  hint: string;
  color: string;
  empty: string;
}[] = [
  {
    key: "hunting",
    label: "Hunting",
    hint: "New",
    color: "#B9B2B3",
    empty: "Hunt a signal from Signals to start.",
  },
  {
    key: "interested",
    label: "Interested",
    hint: "Worth a reply",
    color: "var(--amber)",
    empty: "Drag leads here once they look worth a reply.",
  },
  {
    key: "engaged",
    label: "Engaged",
    hint: "In conversation",
    color: "var(--r1)",
    empty: "Leads you’re talking to.",
  },
  {
    key: "hunted",
    label: "Hunted",
    hint: "Won",
    color: "var(--green)",
    empty: "Closed leads land here.",
  },
];

const STAGE_INDEX = Object.fromEntries(
  STAGES.map((s, i) => [s.key, i]),
) as Record<HuntStatus, number>;

export default function HuntBoardPage() {
  const toast = useToastStore((s) => s.show);
  const refreshStats = useStatsStore((s) => s.refresh);

  const [leads, setLeads] = useState<MentionRow[] | null>(null);
  const [platform, setPlatform] = useState<"all" | SignalPlatform>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<HuntStatus | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteState, setNoteState] = useState<"idle" | "saving" | "saved">(
    "idle",
  );

  const boardRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const rows = await apiFetch<Record<string, unknown>[]>(
          "/api/mentions?status=hunting,interested,engaged,hunted&sort=newest&limit=500",
        );
        setLeads(rows.map(toMentionRow));
      } catch (err) {
        toast(err instanceof Error ? err.message : "Couldn't load your leads");
        setLeads([]);
      }
    }
    load();
  }, [toast]);

  useLayoutEffect(() => {
    if (!flipState.current) return;
    Flip.from(flipState.current, {
      duration: 0.45,
      ease: "power3.inOut",
      absolute: true,
      nested: true,
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.3 },
        ),
    });
    flipState.current = null;
  }, [leads, platform]);

  useGSAP(
    () => {
      if (!leads) return;
      gsap.fromTo(
        ".sp-col",
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: "power2.out" },
      );
      gsap.fromTo(
        ".sp-lead",
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.04,
          delay: 0.15,
          ease: "power2.out",
        },
      );
      gsap.fromTo(
        ".sp-lead .sp-wm",
        { rotate: -32, opacity: 0 },
        {
          rotate: -16,
          opacity: 0.11,
          duration: 0.9,
          stagger: 0.04,
          delay: 0.2,
          ease: "power3.out",
          clearProps: "transform,opacity",
        },
      );
    },
    { scope: boardRef, dependencies: [leads === null] },
  );

  function captureFlip() {
    flipState.current = Flip.getState(".sp-lead");
  }

  async function move(id: string, status: HuntStatus) {
    const lead = leads?.find((l) => l.id === id);
    if (!lead || lead.status === status) return;
    const previous = lead.status;
    captureFlip();
    setLeads(
      (prev) => prev?.map((l) => (l.id === id ? { ...l, status } : l)) ?? prev,
    );
    try {
      await apiFetch(`/api/mentions/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      const stage = STAGES[STAGE_INDEX[status]];
      toast(
        status === "hunted" ? "Hunted — nice work" : `Moved to ${stage.label}`,
        "success",
      );
      refreshStats();
    } catch (err) {
      captureFlip();
      setLeads(
        (prev) =>
          prev?.map((l) => (l.id === id ? { ...l, status: previous } : l)) ??
          prev,
      );
      toast(err instanceof Error ? err.message : "Couldn't move lead");
    }
  }

  async function removeFromBoard(id: string) {
    const lead = leads?.find((l) => l.id === id);
    if (!lead) return;
    closeDrawer();
    captureFlip();
    setLeads((prev) => prev?.filter((l) => l.id !== id) ?? prev);
    try {
      await apiFetch(`/api/mentions/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "new" }),
      });
      toast("Removed from Hunt Board — it's back in Signals");
      refreshStats();
    } catch (err) {
      setLeads((prev) => (prev ? [...prev, lead] : prev));
      toast(err instanceof Error ? err.message : "Couldn't remove lead");
    }
  }

  function openDrawer(id: string) {
    const lead = leads?.find((l) => l.id === id);
    if (!lead) return;
    setOpenId(id);
    setNoteDraft(lead.notes ?? "");
    setNoteState("idle");
  }

  function closeDrawer() {
    if (!drawerRef.current) {
      setOpenId(null);
      return;
    }
    gsap.to(drawerRef.current, {
      x: "110%",
      duration: 0.35,
      ease: "power2.in",
      onComplete: () => setOpenId(null),
    });
    gsap.to(".sp-scrim", { opacity: 0, duration: 0.25 });
  }

  useEffect(() => {
    if (!openId) return;
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") closeDrawer();
    }
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  });

  useGSAP(
    () => {
      if (!openId || !drawerRef.current) return;
      gsap.fromTo(".sp-scrim", { opacity: 0 }, { opacity: 1, duration: 0.25 });
      gsap.fromTo(
        drawerRef.current,
        { x: "110%" },
        { x: "0%", duration: 0.5, ease: "power3.out" },
      );
      gsap.fromTo(
        drawerRef.current.querySelectorAll(".sp-dr-b > div"),
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.05,
          delay: 0.15,
          ease: "power2.out",
        },
      );
    },
    { dependencies: [openId] },
  );

  function onNoteChange(value: string) {
    if (!openId) return;
    const id = openId;
    setNoteDraft(value);
    setNoteState("saving");
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(async () => {
      try {
        await apiFetch(`/api/mentions/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ notes: value }),
        });
        setLeads(
          (prev) =>
            prev?.map((l) => (l.id === id ? { ...l, notes: value } : l)) ??
            prev,
        );
        setNoteState("saved");
      } catch (err) {
        setNoteState("idle");
        toast(err instanceof Error ? err.message : "Couldn't save note");
      }
    }, 600);
  }

  if (leads === null) {
    return <div className="sp-loading">LOADING YOUR PIPELINE…</div>;
  }

  const visible = leads.filter(
    (l) => platform === "all" || l.platform === platform,
  );
  const won = leads.filter((l) => l.status === "hunted").length;
  const open = leads.find((l) => l.id === openId) ?? null;

  return (
    <div className="sp-hunt-body">
      <div className="sp-head">
        <div className="sp-sub">
          <span>
            {leads.length} lead{leads.length === 1 ? "" : "s"} in pipeline
          </span>
          <span>·</span>
          <span style={{ color: "#7be3a0", fontWeight: 500 }}>
            {won} hunted
          </span>
        </div>
        <div className="sp-seg">
          {[{ value: "all" as const, label: "All" }, ...PLATFORMS].map((p) => (
            <button
              key={p.value}
              className={platform === p.value ? "on" : ""}
              onClick={() => {
                captureFlip();
                setPlatform(p.value);
              }}
            >
              {p.value !== "all" && (
                <PlatformIcon platform={p.value} size={13} />
              )}
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="sp-board" ref={boardRef}>
        {STAGES.map((stage, i) => {
          const items = visible.filter((l) => l.status === stage.key);
          const next = STAGES[i + 1];
          return (
            <section
              key={stage.key}
              className={`sp-col ${overCol === stage.key ? "over" : ""}`}
              style={{ "--sc": stage.color } as React.CSSProperties}
              onDragOver={(e) => {
                if (!dragId) return;
                e.preventDefault();
                setOverCol(stage.key);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node))
                  setOverCol(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setOverCol(null);
                if (dragId) move(dragId, stage.key);
                setDragId(null);
              }}
            >
              <div className="sp-col-h">
                <span className="sp-dot" />
                <b>{stage.label}</b>
                <small>{stage.hint}</small>
                <span className="n">
                  {leads.filter((l) => l.status === stage.key).length}
                </span>
              </div>
              <div className="sp-col-b">
                {items.length ? (
                  items.map((lead) => (
                    <article
                      key={lead.id}
                      className={`sp-lead ${dragId === lead.id ? "dragging" : ""}`}
                      data-flip-id={lead.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", lead.id);
                        setDragId(lead.id);
                      }}
                      onDragEnd={() => {
                        setDragId(null);
                        setOverCol(null);
                      }}
                      onClick={() => openDrawer(lead.id)}
                      style={
                        {
                          "--pc": platformVar(lead.platform),
                        } as React.CSSProperties
                      }
                    >
                      <div className="sp-wm">
                        <PlatformIcon
                          platform={lead.platform}
                          size={104}
                          plain
                        />
                      </div>
                      <div className="sp-l-top">
                        <span className="src">
                          {PLATFORM_LABELS[lead.platform]} · {lead.source}
                        </span>
                        <ScoreArc score={lead.score} />
                      </div>
                      <h4>{lead.title}</h4>
                      <span className="sp-kwt">{lead.keyword}</span>
                      {lead.notes && (
                        <div className="sp-l-note">
                          <StickyNote />
                          <span>{lead.notes}</span>
                        </div>
                      )}
                      <div className="sp-l-f">
                        <span>found {shortAgo(lead.createdAt)} ago</span>
                        {next ? (
                          <button
                            className="sp-adv first"
                            style={
                              { "--nc": next.color } as React.CSSProperties
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              move(lead.id, next.key);
                            }}
                          >
                            {next.label}
                            <ArrowRight />
                          </button>
                        ) : (
                          <span className="sp-won">
                            <Check />
                            HUNTED
                          </span>
                        )}
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="sp-col-empty">
                    <div>
                      <Target />
                      {platform !== "all" ? "No matching leads" : stage.empty}
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {open && (
        <>
          <div className="sp-scrim" onClick={closeDrawer} />
          <aside
            className="sp-drawer"
            ref={drawerRef}
            style={
              { "--pc": platformVar(open.platform) } as React.CSSProperties
            }
          >
            <div className="sp-dr-h">
              <div className="sp-wm">
                <PlatformIcon platform={open.platform} size={150} plain />
              </div>
              <div className="sp-dr-top">
                <span>
                  {PLATFORM_LABELS[open.platform]} · {open.source}
                </span>
                <button
                  className="sp-icon-btn"
                  onClick={closeDrawer}
                  title="Close"
                >
                  <X />
                </button>
              </div>
              <h3>{open.title}</h3>
              <span className="sp-kwt">{open.keyword}</span>
            </div>
            <div className="sp-dr-b">
              <div>
                <div className="sp-label">Stage</div>
                <div className="sp-stages">
                  {STAGES.map((s) => (
                    <button
                      key={s.key}
                      className={open.status === s.key ? "on" : ""}
                      style={{ "--sc": s.color } as React.CSSProperties}
                      onClick={() => move(open.id, s.key)}
                    >
                      <i />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              {open.body && (
                <div>
                  <div className="sp-label">Post</div>
                  <p>{open.body}</p>
                </div>
              )}
              {open.reason && (
                <div>
                  <div className="sp-label">
                    AI read · intent {open.score ?? "–"}/10
                  </div>
                  <div className="sp-dr-ai">{open.reason}</div>
                </div>
              )}
              <div>
                <div className="sp-label">Notes</div>
                <textarea
                  className="sp-note"
                  value={noteDraft}
                  onChange={(e) => onNoteChange(e.target.value)}
                  placeholder="Next step, contact details, what you sent…"
                />
                <div className="sp-note-st">
                  {noteState === "saving"
                    ? "SAVING…"
                    : noteState === "saved"
                      ? "SAVED"
                      : " "}
                </div>
              </div>
            </div>
            <div className="sp-dr-f">
              <a
                className="sp-ghost"
                href={open.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink />
                Open post
              </a>
              <span className="grow" />
              <button
                className="sp-ghost x"
                onClick={() => removeFromBoard(open.id)}
              >
                <X />
                Remove
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
