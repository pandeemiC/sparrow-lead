"use client";

import { useEffect, useRef, useState } from "react";
import {
  ExternalLink,
  SlidersHorizontal,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import PlatformIcon from "@/components/ui/PlatformIcon";
import ScoreArc from "@/components/sp/ScoreArc";
import { apiFetch } from "@/lib/apiFetch";
import { toMentionRow } from "@/lib/mentions";
import { platformVar, scoreTier, shortAgo, type ScoreTier } from "@/lib/score";
import {
  PLATFORMS,
  PLATFORM_LABELS,
  SIGNAL_TYPE_LABELS,
} from "@/lib/constants";
import { useScanStore } from "@/store/scanStore";
import { useStatsStore } from "@/store/statsStore";
import { useToastStore } from "@/store/toastStore";
import { cn } from "@/lib/utils";
import {
  Button,
  GhostButton,
  KwTag,
  Loading,
  Seg,
  SegButton,
  Switch,
  Watermark,
  ghostClass,
} from "@/components/sp/ui";
import type { MentionRow, SignalPlatform, SignalType } from "@/types";

type Filters = {
  platform: "all" | SignalPlatform;
  intent: "all" | ScoreTier;
  type: "all" | SignalType;
  keyword: string;
  newOnly: boolean;
};

type Group = "platform" | "intent" | "type" | "keyword";

const EMPTY_FILTERS: Filters = {
  platform: "all",
  intent: "all",
  type: "all",
  keyword: "all",
  newOnly: false,
};

const INTENT_OPTIONS: { value: ScoreTier; label: string; color: string }[] = [
  { value: "hi", label: "High · 8+", color: "var(--r1)" },
  { value: "md", label: "Medium · 5–7", color: "var(--amber)" },
  { value: "lo", label: "Low · <5", color: "rgba(255,255,255,.35)" },
];

const HUNTED = ["hunting", "interested", "engaged", "hunted"];

const TYPE_TAG: Record<SignalType, string> = {
  seeking_recommendation: "bg-r1/13 text-[#ff7a86]",
  pain_point: "bg-amber/12 text-amber",
  competitor_complaint: "bg-[rgba(181,140,255,0.13)] text-[#c8adff]",
  question: "bg-white/7 text-ink-2",
  general: "bg-white/4 text-ink-3",
};

// the card sections line up after the 56px watermark gutter (none on mobile)
const gutter = "ml-14 max-[700px]:ml-0";
const gutterPad = "pl-14 max-[700px]:pl-0";

// one row in the filter rail
function FilterOption({
  active,
  zero = false,
  count,
  onClick,
  children,
}: {
  active: boolean;
  zero?: boolean;
  count: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.25 rounded-lg border-0 bg-transparent px-2 py-1.75 text-left text-[13px] text-ink-2 transition-colors hover:bg-panel-2 hover:text-ink",
        active &&
          "bg-r1/10 text-ink shadow-[inset_0_0_0_1px_rgba(255,36,56,0.22)] hover:bg-r1/10",
        zero && "opacity-40",
      )}
    >
      {children}
      <span
        className={cn(
          "ml-auto font-mono text-[11px] leading-[normal] font-medium",
          active ? "text-r1" : "text-ink-3",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-line px-2 pt-2.5 pb-3">
      {title && (
        <h6 className="mb-1.5 px-2 font-mono text-[10px] leading-[normal] font-medium tracking-[0.18em] text-ink-3">
          {title}
        </h6>
      )}
      {children}
    </div>
  );
}

const optionLabel = "min-w-0 truncate";
const clearClass =
  "border-0 bg-transparent p-0 text-[12px] text-ink-3 hover:text-r1";

function SignalCard({
  mention,
  isNew,
  onHunt,
  onDismiss,
}: {
  mention: MentionRow;
  isNew: boolean;
  onHunt: (m: MentionRow) => void;
  onDismiss: (m: MentionRow, el: HTMLElement) => void;
}) {
  const toast = useToastStore((s) => s.show);
  const ref = useRef<HTMLElement>(null);
  const draftRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [draftOpen, setDraftOpen] = useState(false);
  const [draftState, setDraftState] = useState<"idle" | "writing" | "ready">(
    "idle",
  );
  const [reply, setReply] = useState(mention.reply ?? "");
  const onBoard = HUNTED.includes(mention.status);
  const long = mention.body.length > 140;

  async function toggleDraft() {
    if (draftOpen) {
      gsap.to(draftRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => setDraftOpen(false),
      });
      return;
    }
    setDraftOpen(true);
    if (draftState === "ready") return;
    setDraftState("writing");
    try {
      const data = await apiFetch<{ reply?: string }>("/api/ai/reply", {
        method: "POST",
        body: JSON.stringify({ mentionId: mention.id }),
      });
      const text = (data.reply ?? "").trim() || "Could not generate a reply.";
      const typing = { n: 0 };
      gsap.to(typing, {
        n: text.length,
        duration: Math.min(2.2, text.length / 110),
        ease: "none",
        onUpdate: () => setReply(text.slice(0, Math.round(typing.n))),
        onComplete: () => setDraftState("ready"),
      });
    } catch (err) {
      setDraftOpen(false);
      setDraftState("idle");
      toast(err instanceof Error ? err.message : "Couldn't generate a reply");
    }
  }

  useGSAP(
    () => {
      if (draftOpen && draftRef.current) {
        gsap.fromTo(
          draftRef.current,
          { height: 0, opacity: 0 },
          { height: "auto", opacity: 1, duration: 0.45, ease: "power3.out" },
        );
      }
    },
    { dependencies: [draftOpen] },
  );

  async function copyReply() {
    try {
      await navigator.clipboard.writeText(textRef.current?.value ?? reply);
      toast("Reply copied", "success");
    } catch {
      toast("Couldn't copy — select the text and copy it manually");
    }
  }

  return (
    <article
      ref={ref}
      className="group relative overflow-hidden rounded-[18px] border border-line bg-linear-to-b from-white/3.5 to-white/1.5 px-5.5 pt-5 pb-4.5 transition-[border-color,background-color] duration-200 hover:border-line-2 [&>*:not([data-wm])]:relative before:pointer-events-none before:absolute before:-top-25 before:-left-22.5 before:size-75 before:rounded-full before:bg-[radial-gradient(circle,color-mix(in_oklab,var(--pc)_26%,transparent)_0%,color-mix(in_oklab,var(--pc)_8%,transparent)_40%,transparent_68%)] before:opacity-85 before:[transition:opacity_0.3s,transform_0.5s] hover:before:scale-108 hover:before:opacity-100"
      style={{ "--pc": platformVar(mention.platform) } as React.CSSProperties}
    >
      <Watermark
        platform={mention.platform}
        className="group-hover:opacity-17 group-hover:[transform:rotate(-12deg)_scale(1.04)]"
      />

      <div
        className={cn(
          "flex min-h-7 items-center gap-2.5 text-[12.5px] text-ink-3",
          gutterPad,
        )}
      >
        <span className="inline-flex min-w-0 items-center gap-1.75 font-medium text-ink">
          <PlatformIcon platform={mention.platform} size={15} />
          {PLATFORM_LABELS[mention.platform]}
          <span className="truncate font-normal text-ink-3">
            · {mention.source}
          </span>
        </span>
        <span>{shortAgo(mention.createdAt)} ago</span>
        {isNew && (
          <span
            className="size-1.75 flex-none rounded-full bg-r1 shadow-[0_0_8px_var(--r1)]"
            title="New since your last visit"
          />
        )}
        <KwTag className="ml-auto" title="Matched keyword">
          {mention.keyword}
        </KwTag>
      </div>

      <div
        className={cn(
          "mt-3.5 grid grid-cols-[minmax(0,1fr)_80px] gap-6 max-[700px]:grid-cols-[minmax(0,1fr)_64px] max-[700px]:gap-3.5",
          gutterPad,
        )}
      >
        <div>
          <h3 className="mt-0 mb-2 text-[16.5px] leading-[1.4] font-medium tracking-[-0.005em] text-pretty wrap-anywhere">
            {mention.title}
          </h3>
          {mention.body && (
            <>
              <p
                className={cn(
                  "m-0 text-[13.5px] leading-[1.6] text-pretty wrap-anywhere text-ink-2",
                  !expanded && "line-clamp-2",
                )}
              >
                {mention.body}
              </p>
              {long && (
                <button
                  className="mt-1 border-0 bg-transparent p-0 text-[12px] text-ink-3 hover:text-ink"
                  onClick={() => setExpanded((v) => !v)}
                >
                  {expanded ? "Show less" : "Show more"}
                </button>
              )}
            </>
          )}
        </div>
        <ScoreArc score={mention.score} size="dial" delay={0.2} />
      </div>

      {mention.reason && (
        <div
          className={cn(
            "mt-4 grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-xl border border-line bg-black/28 px-3.5 py-3",
            gutter,
          )}
        >
          <div className="flex items-center gap-1.5 pt-0.5 font-mono text-[10px] leading-[normal] font-medium tracking-[0.16em] whitespace-nowrap text-ink-3 [&_svg]:size-3 [&_svg]:text-r1">
            <Sparkles />
            AI READ
          </div>
          <p className="m-0 text-[13px] leading-[1.55] text-pretty text-ink-2">
            {mention.type && (
              <span
                className={cn(
                  "mr-2 inline-block rounded-md px-2 py-0.5 align-[1px] font-mono text-[10.5px] leading-[normal] font-medium tracking-[0.06em]",
                  TYPE_TAG[mention.type],
                )}
              >
                {SIGNAL_TYPE_LABELS[mention.type]}
              </span>
            )}
            {mention.reason}
          </p>
        </div>
      )}

      <div className={cn("mt-4 flex flex-wrap items-center gap-2", gutter)}>
        <GhostButton
          tone={onBoard ? "done" : "default"}
          onClick={() => !onBoard && onHunt(mention)}
          disabled={onBoard}
        >
          <Target />
          {onBoard ? "On Hunt Board" : "Hunt Board"}
        </GhostButton>
        <GhostButton onClick={toggleDraft}>
          <Sparkles />
          {draftOpen ? "Hide reply" : "Draft reply"}
        </GhostButton>
        <a
          className={ghostClass()}
          href={mention.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink />
          Open
        </a>
        <span className="flex-1" />
        <GhostButton
          tone="danger"
          onClick={() => ref.current && onDismiss(mention, ref.current)}
          title="Dismiss"
        >
          <X />
          Dismiss
        </GhostButton>
      </div>

      {draftOpen && (
        <div className={cn("mt-3 overflow-hidden", gutter)} ref={draftRef}>
          <div className="rounded-xl border border-r1/25 bg-r1/4 p-3.5">
            <div className="mb-2 flex items-center justify-between font-mono text-[10px] leading-[normal] font-medium tracking-[0.16em] text-ink-3">
              <span>
                DRAFT REPLY · {PLATFORM_LABELS[mention.platform].toUpperCase()}
              </span>
              <span>{draftState === "writing" ? "WRITING…" : "EDITABLE"}</span>
            </div>
            <textarea
              ref={textRef}
              value={reply}
              readOnly={draftState !== "ready"}
              onChange={(e) => setReply(e.target.value)}
              className="min-h-24 w-full resize-y border-0 bg-transparent p-0 font-body text-[13.5px] leading-[1.6] text-ink outline-0"
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={copyReply}
                disabled={draftState !== "ready"}
              >
                Copy reply
              </Button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default function SignalsPage() {
  const toast = useToastStore((s) => s.show);
  const clearNewSignals = useScanStore((s) => s.clearNewSignals);
  const refreshStats = useStatsStore((s) => s.refresh);

  const [mentions, setMentions] = useState<MentionRow[] | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<"intent" | "newest">("intent");
  const [railOpen, setRailOpen] = useState(false);
  const [lastVisitedAt] = useState<Date | null>(() => {
    if (typeof window === "undefined") return null;
    const prev = localStorage.getItem("signals_lastVisitedAt");
    return prev ? new Date(prev) : null;
  });
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("signals_lastVisitedAt", new Date().toISOString());
    clearNewSignals();
  }, [clearNewSignals]);

  useEffect(() => {
    async function load() {
      try {
        const rows = await apiFetch<Record<string, unknown>[]>(
          "/api/mentions?limit=500&sort=newest",
        );
        setMentions(rows.map(toMentionRow));
      } catch (err) {
        toast(err instanceof Error ? err.message : "Couldn't load signals");
        setMentions([]);
      }
    }
    load();
  }, [toast]);

  const isNew = (m: MentionRow) =>
    !!lastVisitedAt && new Date(m.createdAt) > lastVisitedAt;

  function passes(m: MentionRow, skip?: Group) {
    if (
      skip !== "platform" &&
      filters.platform !== "all" &&
      m.platform !== filters.platform
    )
      return false;
    if (
      skip !== "intent" &&
      filters.intent !== "all" &&
      scoreTier(m.score) !== filters.intent
    )
      return false;
    if (skip !== "type" && filters.type !== "all" && m.type !== filters.type)
      return false;
    if (
      skip !== "keyword" &&
      filters.keyword !== "all" &&
      m.keyword !== filters.keyword
    )
      return false;
    if (filters.newOnly && !isNew(m)) return false;
    return true;
  }

  const all = mentions ?? [];
  const visible = all
    .filter((m) => passes(m))
    .sort((a, b) =>
      sort === "intent"
        ? (b.score ?? 0) - (a.score ?? 0) ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  const keywordOptions = [...new Set(all.map((m) => m.keyword))].sort();
  const hotCount = all.filter((m) => (m.score ?? 0) >= 8).length;
  const newCount = all.filter(isNew).length;

  function count(group: Group, match: (m: MentionRow) => boolean) {
    return all.filter((m) => passes(m, group) && match(m)).length;
  }

  function setFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  const listKey = `${JSON.stringify(filters)}-${sort}-${mentions === null ? "x" : "ok"}`;
  useGSAP(
    () => {
      const cards = listRef.current?.querySelectorAll("article");
      if (!cards?.length) return;
      gsap.fromTo(
        cards,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.05,
          ease: "power2.out",
          clearProps: "transform",
        },
      );
      gsap.fromTo(
        listRef.current!.querySelectorAll("[data-wm]"),
        { rotate: -30, opacity: 0, x: -10 },
        {
          rotate: -16,
          opacity: 0.12,
          x: 0,
          duration: 0.9,
          stagger: 0.05,
          delay: 0.1,
          ease: "power3.out",
          clearProps: "transform,opacity",
        },
      );
    },
    { dependencies: [listKey] },
  );

  async function hunt(m: MentionRow) {
    setMentions(
      (prev) =>
        prev?.map((x) => (x.id === m.id ? { ...x, status: "hunting" } : x)) ??
        prev,
    );
    try {
      await apiFetch(`/api/mentions/${m.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "hunting" }),
      });
      toast("Added to Hunt Board", "success");
      refreshStats();
    } catch (err) {
      setMentions(
        (prev) =>
          prev?.map((x) => (x.id === m.id ? { ...x, status: m.status } : x)) ??
          prev,
      );
      toast(err instanceof Error ? err.message : "Couldn't add to Hunt Board");
    }
  }

  function dismiss(m: MentionRow, el: HTMLElement) {
    gsap.to(el, {
      opacity: 0,
      x: 40,
      duration: 0.25,
      ease: "power2.in",
      onComplete: async () => {
        setMentions((prev) => prev?.filter((x) => x.id !== m.id) ?? prev);
        try {
          await apiFetch(`/api/mentions/${m.id}`, {
            method: "PATCH",
            body: JSON.stringify({ status: "dismissed" }),
          });
          toast("Dismissed");
        } catch (err) {
          setMentions((prev) => (prev ? [...prev, m] : prev));
          toast(err instanceof Error ? err.message : "Couldn't dismiss");
        }
      },
    });
  }

  const chips: { key: keyof Filters; label: string }[] = [];
  if (filters.platform !== "all")
    chips.push({ key: "platform", label: PLATFORM_LABELS[filters.platform] });
  if (filters.intent !== "all")
    chips.push({
      key: "intent",
      label: INTENT_OPTIONS.find((o) => o.value === filters.intent)!.label,
    });
  if (filters.type !== "all")
    chips.push({ key: "type", label: SIGNAL_TYPE_LABELS[filters.type] });
  if (filters.keyword !== "all")
    chips.push({ key: "keyword", label: filters.keyword });
  if (filters.newOnly) chips.push({ key: "newOnly", label: "New only" });

  function clearChip(key: keyof Filters) {
    setFilters((f) => ({ ...f, [key]: key === "newOnly" ? false : "all" }));
  }

  if (mentions === null) {
    return <Loading>LOADING SIGNALS…</Loading>;
  }

  return (
    <div className="grid grid-cols-[232px_minmax(0,1fr)] items-start gap-6 max-[1100px]:grid-cols-[minmax(0,1fr)]">
      <div className="col-span-full flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 text-[13.5px] text-ink-2">
            <span>
              {all.length} signals{newCount > 0 && ` · ${newCount} new`}
            </span>
            <span>·</span>
            <span className="font-medium text-r1">{hotCount} hot leads</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            className="hidden max-[1100px]:inline-flex"
            onClick={() => setRailOpen((v) => !v)}
          >
            <SlidersHorizontal />
            Filters
          </Button>
          <Seg>
            <SegButton
              active={sort === "intent"}
              onClick={() => setSort("intent")}
            >
              Highest intent
            </SegButton>
            <SegButton
              active={sort === "newest"}
              onClick={() => setSort("newest")}
            >
              Newest
            </SegButton>
          </Seg>
        </div>
      </div>

      <aside
        className={cn(
          "sticky top-0 rounded-2xl border border-line bg-panel py-1.5 backdrop-blur-md max-[1100px]:static",
          !railOpen && "max-[1100px]:hidden",
        )}
      >
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <b className="text-[13.5px] font-medium">Filters</b>
          <button
            className={clearClass}
            onClick={() => setFilters(EMPTY_FILTERS)}
          >
            Clear all
          </button>
        </div>

        <FilterGroup>
          <div className="flex items-center justify-between px-2 py-1.5 text-[13px] text-ink-2">
            New since last visit
            <Switch
              on={filters.newOnly}
              onClick={() => setFilter("newOnly", !filters.newOnly)}
              aria-label="New since last visit"
            />
          </div>
        </FilterGroup>

        <FilterGroup title="PLATFORM">
          {[
            { value: "all" as const, label: "All platforms" },
            ...PLATFORMS,
          ].map((p) => {
            const c = count(
              "platform",
              (m) => p.value === "all" || m.platform === p.value,
            );
            return (
              <FilterOption
                key={p.value}
                active={filters.platform === p.value}
                zero={!c}
                count={c}
                onClick={() => setFilter("platform", p.value)}
              >
                {p.value !== "all" && (
                  <span className="grid size-3.5 flex-none place-items-center">
                    <PlatformIcon platform={p.value} size={13} />
                  </span>
                )}
                <span className={optionLabel}>{p.label}</span>
              </FilterOption>
            );
          })}
        </FilterGroup>

        <FilterGroup title="INTENT">
          <FilterOption
            active={filters.intent === "all"}
            count={count("intent", () => true)}
            onClick={() => setFilter("intent", "all")}
          >
            <span className={optionLabel}>Any intent</span>
          </FilterOption>
          {INTENT_OPTIONS.map((o) => {
            const c = count("intent", (m) => scoreTier(m.score) === o.value);
            return (
              <FilterOption
                key={o.value}
                active={filters.intent === o.value}
                zero={!c}
                count={c}
                onClick={() => setFilter("intent", o.value)}
              >
                <span
                  className="size-1.75 flex-none rounded-full"
                  style={{ background: o.color }}
                />
                <span className={optionLabel}>{o.label}</span>
              </FilterOption>
            );
          })}
        </FilterGroup>

        <FilterGroup title="SIGNAL TYPE">
          <FilterOption
            active={filters.type === "all"}
            count={count("type", () => true)}
            onClick={() => setFilter("type", "all")}
          >
            <span className={optionLabel}>All types</span>
          </FilterOption>
          {(Object.keys(SIGNAL_TYPE_LABELS) as SignalType[]).map((t) => {
            const c = count("type", (m) => m.type === t);
            return (
              <FilterOption
                key={t}
                active={filters.type === t}
                zero={!c}
                count={c}
                onClick={() => setFilter("type", t)}
              >
                <span className={optionLabel}>{SIGNAL_TYPE_LABELS[t]}</span>
              </FilterOption>
            );
          })}
        </FilterGroup>

        {keywordOptions.length > 0 && (
          <FilterGroup title="KEYWORD">
            <FilterOption
              active={filters.keyword === "all"}
              count={count("keyword", () => true)}
              onClick={() => setFilter("keyword", "all")}
            >
              <span className={optionLabel}>All keywords</span>
            </FilterOption>
            {keywordOptions.map((k) => {
              const c = count("keyword", (m) => m.keyword === k);
              return (
                <FilterOption
                  key={k}
                  active={filters.keyword === k}
                  zero={!c}
                  count={c}
                  onClick={() => setFilter("keyword", k)}
                >
                  <span className={optionLabel}>{k}</span>
                </FilterOption>
              );
            })}
          </FilterGroup>
        )}
      </aside>

      <section className="flex min-w-0 flex-col gap-3.5">
        <div className="flex min-h-7 flex-wrap items-center gap-2.5 text-[12.5px] text-ink-3">
          <span>Showing {visible.length}</span>
          {chips.map((c) => (
            <button
              key={c.key}
              className="inline-flex items-center gap-1.5 rounded-full border border-line-2 bg-transparent py-0.75 pr-1.5 pl-2.5 text-[12px] text-ink-2 hover:border-r1 hover:text-ink [&_svg]:size-2.75"
              onClick={() => clearChip(c.key)}
            >
              {c.label}
              <X />
            </button>
          ))}
        </div>
        <div ref={listRef} className="flex flex-col gap-3.5">
          {visible.length ? (
            visible.map((m) => (
              <SignalCard
                key={m.id}
                mention={m}
                isNew={isNew(m)}
                onHunt={hunt}
                onDismiss={dismiss}
              />
            ))
          ) : (
            <div className="rounded-[18px] border border-dashed border-line-2 px-6 py-12 text-center text-ink-3">
              <h4 className="mt-0 mb-1.5 font-display text-[24px] leading-[normal] font-normal text-ink">
                {all.length ? "Nothing here yet." : "No signals yet."}
              </h4>
              {all.length ? (
                <>
                  No signals match these filters.{" "}
                  <button
                    className={cn(clearClass, "text-r1")}
                    onClick={() => setFilters(EMPTY_FILTERS)}
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                "Add a keyword and run a scan — scored posts land here."
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
