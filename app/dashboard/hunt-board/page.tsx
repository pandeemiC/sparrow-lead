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
import { cn } from "@/lib/utils";
import {
  GhostButton,
  IconButton,
  KwTag,
  Label,
  Loading,
  Seg,
  SegButton,
  StageDot,
  Watermark,
  ghostClass,
} from "@/components/sp/ui";
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
        "[data-col]",
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: "power2.out" },
      );
      gsap.fromTo(
        "[data-lead]",
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
        "[data-lead] [data-wm]",
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
    flipState.current = Flip.getState("[data-lead]");
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
    gsap.to("[data-scrim]", { opacity: 0, duration: 0.25 });
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
      gsap.fromTo(
        "[data-scrim]",
        { opacity: 0 },
        { opacity: 1, duration: 0.25 },
      );
      gsap.fromTo(
        drawerRef.current,
        { x: "110%" },
        { x: "0%", duration: 0.5, ease: "power3.out" },
      );
      gsap.fromTo(
        drawerRef.current.querySelectorAll("[data-drawer-body] > div"),
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
    return <Loading>LOADING YOUR PIPELINE…</Loading>;
  }

  const visible = leads.filter(
    (l) => platform === "all" || l.platform === platform,
  );
  const won = leads.filter((l) => l.status === "hunted").length;
  const open = leads.find((l) => l.id === openId) ?? null;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4.5">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-wrap items-center gap-3 text-[13.5px] text-ink-2">
          <span>
            {leads.length} lead{leads.length === 1 ? "" : "s"} in pipeline
          </span>
          <span>·</span>
          <span className="font-medium text-[#7be3a0]">{won} hunted</span>
        </div>
        <Seg>
          {[{ value: "all" as const, label: "All" }, ...PLATFORMS].map((p) => (
            <SegButton
              key={p.value}
              active={platform === p.value}
              onClick={() => {
                captureFlip();
                setPlatform(p.value);
              }}
            >
              {p.value !== "all" && (
                <PlatformIcon platform={p.value} size={13} />
              )}
              {p.label}
            </SegButton>
          ))}
        </Seg>
      </div>

      <div
        className="grid min-h-0 flex-1 grid-cols-[repeat(4,minmax(250px,1fr))] gap-3.5 overflow-x-auto pb-1"
        ref={boardRef}
      >
        {STAGES.map((stage, i) => {
          const items = visible.filter((l) => l.status === stage.key);
          const next = STAGES[i + 1];
          return (
            <section
              key={stage.key}
              data-col
              className={cn(
                "flex min-h-0 flex-col rounded-[18px] border border-line bg-white/1.5 transition-[border-color,background-color] duration-200",
                overCol === stage.key &&
                  "border-[color-mix(in_oklab,var(--sc)_55%,transparent)] bg-[color-mix(in_oklab,var(--sc)_5%,transparent)]",
              )}
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
              <div className="flex flex-none items-center gap-2.5 border-b border-line px-4 pt-3.5 pb-3">
                <StageDot color={stage.color} className="size-2" />
                <b className="text-[14px] font-medium">{stage.label}</b>
                <small className="text-[12px] text-ink-3">{stage.hint}</small>
                <span className="ml-auto grid h-5.5 min-w-6 place-items-center rounded-full border border-line-2 px-1.75 font-mono text-[11px] leading-[normal] font-medium text-ink-2">
                  {leads.filter((l) => l.status === stage.key).length}
                </span>
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-2.5">
                {items.length ? (
                  items.map((lead) => (
                    <article
                      key={lead.id}
                      data-lead
                      className={cn(
                        "group relative flex-none cursor-grab overflow-hidden rounded-[14px] border border-line bg-linear-to-b from-white/4 to-white/1.5 px-3.5 pt-3.5 pb-3 transition-[border-color] duration-200 select-none hover:border-line-2 [&>*:not([data-wm])]:relative before:pointer-events-none before:absolute before:-top-17.5 before:-left-15 before:size-47.5 before:rounded-full before:bg-[radial-gradient(circle,color-mix(in_oklab,var(--pc)_22%,transparent),transparent_65%)]",
                        dragId === lead.id && "opacity-35",
                      )}
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
                      <Watermark
                        platform={lead.platform}
                        className="-top-6.5 -left-5.5 size-26 opacity-11 drop-shadow-[0_0_10px_currentColor] group-hover:opacity-16 group-hover:[transform:rotate(-12deg)_scale(1.04)]"
                      />
                      <div className="flex min-h-8.5 items-center gap-2 pl-8.5 text-[12px] text-ink-3">
                        <span className="min-w-0 truncate text-ink-2">
                          {PLATFORM_LABELS[lead.platform]} · {lead.source}
                        </span>
                        <ScoreArc score={lead.score} className="ml-auto" />
                      </div>
                      <h4 className="mt-2 mb-2.5 line-clamp-3 text-[14px] leading-[1.4] font-medium text-pretty wrap-anywhere">
                        {lead.title}
                      </h4>
                      <KwTag className="inline-block max-w-full">
                        {lead.keyword}
                      </KwTag>
                      {lead.notes && (
                        <div className="mt-2.5 flex items-start gap-1.5 text-[12px] leading-[1.45] text-ink-2 [&_svg]:mt-0.75 [&_svg]:size-3 [&_svg]:flex-none [&_svg]:text-ink-3">
                          <StickyNote />
                          <span>{lead.notes}</span>
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-2 border-t border-line pt-2.5 text-[11.5px] text-ink-3">
                        <span>found {shortAgo(lead.createdAt)} ago</span>
                        {next ? (
                          <button
                            className="ml-auto inline-flex h-6.5 items-center gap-1.25 rounded-full border border-line-2 bg-transparent px-2.5 text-[11.5px] whitespace-nowrap text-ink-2 transition-all duration-150 hover:border-[color-mix(in_oklab,var(--nc)_70%,transparent)] hover:bg-[color-mix(in_oklab,var(--nc)_10%,transparent)] hover:text-ink [&_svg]:size-2.75"
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
                          <span className="ml-auto inline-flex items-center gap-1.25 font-mono text-[10.5px] leading-[normal] font-medium tracking-[0.12em] text-[#7be3a0] [&_svg]:size-3">
                            <Check />
                            HUNTED
                          </span>
                        )}
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="grid min-h-35 flex-1 place-items-center rounded-[14px] border border-dashed border-line-2 p-4.5 text-center text-[12.5px] text-ink-3 [&_svg]:mx-auto [&_svg]:mb-2 [&_svg]:block [&_svg]:size-5.5 [&_svg]:opacity-60">
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
          <div
            data-scrim
            className="fixed inset-0 z-30 bg-[rgba(5,2,3,0.5)] backdrop-blur-[2px]"
            onClick={closeDrawer}
          />
          <aside
            ref={drawerRef}
            className="fixed top-3 right-3 bottom-3 z-31 flex w-[min(440px,calc(100vw-24px))] flex-col overflow-hidden rounded-[20px] border border-line-2 bg-[rgba(18,9,11,0.96)] shadow-[0_30px_80px_rgba(0,0,0,0.6)] backdrop-blur-[20px]"
            style={
              { "--pc": platformVar(open.platform) } as React.CSSProperties
            }
          >
            <div className="relative overflow-hidden border-b border-line px-5 pt-5 pb-4 [&>*:not([data-wm])]:relative before:pointer-events-none before:absolute before:-top-22.5 before:-left-20 before:size-65 before:rounded-full before:bg-[radial-gradient(circle,color-mix(in_oklab,var(--pc)_22%,transparent),transparent_65%)]">
              <Watermark
                platform={open.platform}
                className="-top-9 -left-7.5 size-37.5"
              />
              <div className="flex min-h-8 items-center gap-2 pl-11.5 text-[12.5px] text-ink-3">
                <span>
                  {PLATFORM_LABELS[open.platform]} · {open.source}
                </span>
                <IconButton
                  className="ml-auto"
                  onClick={closeDrawer}
                  title="Close"
                >
                  <X />
                </IconButton>
              </div>
              <h3 className="mt-3.5 mb-2 font-display text-[22px] leading-[1.25] font-normal tracking-[-0.01em] text-pretty wrap-anywhere">
                {open.title}
              </h3>
              <KwTag>{open.keyword}</KwTag>
            </div>
            <div
              data-drawer-body
              className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-4.5"
            >
              <div>
                <Label className="mb-2">Stage</Label>
                <div className="grid grid-cols-4 gap-1 rounded-xl border border-line bg-white/4 p-0.75">
                  {STAGES.map((s) => {
                    const on = open.status === s.key;
                    return (
                      <button
                        key={s.key}
                        className={cn(
                          "flex flex-col items-center gap-1.25 rounded-[9px] border-0 bg-transparent px-1 py-2 text-[12px] text-ink-3",
                          on &&
                            "bg-[color-mix(in_oklab,var(--sc)_14%,transparent)] text-ink shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--sc)_40%,transparent)]",
                        )}
                        style={{ "--sc": s.color } as React.CSSProperties}
                        onClick={() => move(open.id, s.key)}
                      >
                        <i
                          className={cn(
                            "size-1.75 rounded-full bg-(--sc) opacity-40",
                            on && "opacity-100 shadow-[0_0_8px_var(--sc)]",
                          )}
                        />
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {open.body && (
                <div>
                  <Label className="mb-2">Post</Label>
                  <p className="m-0 text-[13.5px] leading-[1.6] text-pretty wrap-anywhere text-ink-2">
                    {open.body}
                  </p>
                </div>
              )}
              {open.reason && (
                <div>
                  <Label className="mb-2">
                    AI read · intent {open.score ?? "–"}/10
                  </Label>
                  <div className="rounded-xl border border-line bg-black/30 px-3.5 py-3 text-[13px] leading-[1.55] text-ink-2">
                    {open.reason}
                  </div>
                </div>
              )}
              <div>
                <Label className="mb-2">Notes</Label>
                <textarea
                  className="min-h-24 w-full resize-y rounded-xl border border-line bg-black/30 p-3 font-body text-[13.5px] leading-[1.55] text-ink outline-0 focus:border-r1/45"
                  value={noteDraft}
                  onChange={(e) => onNoteChange(e.target.value)}
                  placeholder="Next step, contact details, what you sent…"
                />
                <div className="mt-1.5 font-mono text-[10px] leading-[normal] font-medium tracking-[0.14em] text-ink-3">
                  {noteState === "saving"
                    ? "SAVING…"
                    : noteState === "saved"
                      ? "SAVED"
                      : " "}
                </div>
              </div>
            </div>
            <div className="flex gap-2 border-t border-line px-5 py-3.5">
              <a
                className={ghostClass()}
                href={open.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink />
                Open post
              </a>
              <span className="flex-1" />
              <GhostButton
                tone="danger"
                onClick={() => removeFromBoard(open.id)}
              >
                <X />
                Remove
              </GhostButton>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
