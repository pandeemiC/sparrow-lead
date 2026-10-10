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
      className="sp-scard"
      style={{ "--pc": platformVar(mention.platform) } as React.CSSProperties}
    >
      <div className="sp-wm">
        <PlatformIcon platform={mention.platform} size={168} plain />
      </div>

      <div className="sp-c-top">
        <span className="src">
          <PlatformIcon platform={mention.platform} size={15} />
          {PLATFORM_LABELS[mention.platform]}
          <span>· {mention.source}</span>
        </span>
        <span>{shortAgo(mention.createdAt)} ago</span>
        {isNew && <span className="sp-new" title="New since your last visit" />}
        <span className="sp-kwt" title="Matched keyword">
          {mention.keyword}
        </span>
      </div>

      <div className="sp-c-main">
        <div>
          <h3>{mention.title}</h3>
          {mention.body && (
            <>
              <p className={`sp-ex ${expanded ? "open" : ""}`}>
                {mention.body}
              </p>
              {long && (
                <button
                  className="sp-more"
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
        <div className="sp-ai">
          <div className="sp-ai-l">
            <Sparkles />
            AI READ
          </div>
          <p>
            {mention.type && (
              <span className={`sp-type ${mention.type}`}>
                {SIGNAL_TYPE_LABELS[mention.type]}
              </span>
            )}
            {mention.reason}
          </p>
        </div>
      )}

      <div className="sp-c-act">
        <button
          className={`sp-ghost ${onBoard ? "done" : ""}`}
          onClick={() => !onBoard && onHunt(mention)}
          disabled={onBoard}
        >
          <Target />
          {onBoard ? "On Hunt Board" : "Hunt Board"}
        </button>
        <button className="sp-ghost" onClick={toggleDraft}>
          <Sparkles />
          {draftOpen ? "Hide reply" : "Draft reply"}
        </button>
        <a
          className="sp-ghost"
          href={mention.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink />
          Open
        </a>
        <span className="grow" />
        <button
          className="sp-ghost x"
          onClick={() => ref.current && onDismiss(mention, ref.current)}
          title="Dismiss"
        >
          <X />
          Dismiss
        </button>
      </div>

      {draftOpen && (
        <div className="sp-draft" ref={draftRef}>
          <div className="sp-draft-in">
            <div className="sp-draft-h">
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
            />
            <div className="sp-draft-f">
              <button
                className="sp-btn sm pri"
                onClick={copyReply}
                disabled={draftState !== "ready"}
              >
                Copy reply
              </button>
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
      const cards = listRef.current?.querySelectorAll(".sp-scard");
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
        listRef.current!.querySelectorAll(".sp-wm"),
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
    return <div className="sp-loading">LOADING SIGNALS…</div>;
  }

  return (
    <div className="sp-sig-wrap">
      <div className="sp-head">
        <div>
          <div className="sp-sub">
            <span>
              {all.length} signals{newCount > 0 && ` · ${newCount} new`}
            </span>
            <span>·</span>
            <span className="hot">{hotCount} hot leads</span>
          </div>
        </div>
        <div className="sp-head-r">
          <button
            className="sp-btn sm sp-fbtn"
            onClick={() => setRailOpen((v) => !v)}
          >
            <SlidersHorizontal />
            Filters
          </button>
          <div className="sp-seg">
            <button
              className={sort === "intent" ? "on" : ""}
              onClick={() => setSort("intent")}
            >
              Highest intent
            </button>
            <button
              className={sort === "newest" ? "on" : ""}
              onClick={() => setSort("newest")}
            >
              Newest
            </button>
          </div>
        </div>
      </div>

      <aside className={`sp-rail ${railOpen ? "show" : ""}`}>
        <div className="sp-rail-h">
          <b>Filters</b>
          <button className="sp-clr" onClick={() => setFilters(EMPTY_FILTERS)}>
            Clear all
          </button>
        </div>

        <div className="sp-fg">
          <div className="sp-tg">
            New since last visit
            <button
              className={`sp-switch ${filters.newOnly ? "on" : ""}`}
              onClick={() => setFilter("newOnly", !filters.newOnly)}
              aria-label="New since last visit"
            >
              <i />
            </button>
          </div>
        </div>

        <div className="sp-fg">
          <h6>PLATFORM</h6>
          {[
            { value: "all" as const, label: "All platforms" },
            ...PLATFORMS,
          ].map((p) => {
            const c = count(
              "platform",
              (m) => p.value === "all" || m.platform === p.value,
            );
            return (
              <button
                key={p.value}
                className={`sp-fo ${filters.platform === p.value ? "on" : ""} ${c ? "" : "zero"}`}
                onClick={() => setFilter("platform", p.value)}
              >
                {p.value !== "all" && (
                  <span className="ic">
                    <PlatformIcon platform={p.value} size={13} />
                  </span>
                )}
                <span className="lbl">{p.label}</span>
                <span className="c">{c}</span>
              </button>
            );
          })}
        </div>

        <div className="sp-fg">
          <h6>INTENT</h6>
          <button
            className={`sp-fo ${filters.intent === "all" ? "on" : ""}`}
            onClick={() => setFilter("intent", "all")}
          >
            <span className="lbl">Any intent</span>
            <span className="c">{count("intent", () => true)}</span>
          </button>
          {INTENT_OPTIONS.map((o) => {
            const c = count("intent", (m) => scoreTier(m.score) === o.value);
            return (
              <button
                key={o.value}
                className={`sp-fo ${filters.intent === o.value ? "on" : ""} ${c ? "" : "zero"}`}
                onClick={() => setFilter("intent", o.value)}
              >
                <span className="dot" style={{ background: o.color }} />
                <span className="lbl">{o.label}</span>
                <span className="c">{c}</span>
              </button>
            );
          })}
        </div>

        <div className="sp-fg">
          <h6>SIGNAL TYPE</h6>
          <button
            className={`sp-fo ${filters.type === "all" ? "on" : ""}`}
            onClick={() => setFilter("type", "all")}
          >
            <span className="lbl">All types</span>
            <span className="c">{count("type", () => true)}</span>
          </button>
          {(Object.keys(SIGNAL_TYPE_LABELS) as SignalType[]).map((t) => {
            const c = count("type", (m) => m.type === t);
            return (
              <button
                key={t}
                className={`sp-fo ${filters.type === t ? "on" : ""} ${c ? "" : "zero"}`}
                onClick={() => setFilter("type", t)}
              >
                <span className="lbl">{SIGNAL_TYPE_LABELS[t]}</span>
                <span className="c">{c}</span>
              </button>
            );
          })}
        </div>

        {keywordOptions.length > 0 && (
          <div className="sp-fg">
            <h6>KEYWORD</h6>
            <button
              className={`sp-fo ${filters.keyword === "all" ? "on" : ""}`}
              onClick={() => setFilter("keyword", "all")}
            >
              <span className="lbl">All keywords</span>
              <span className="c">{count("keyword", () => true)}</span>
            </button>
            {keywordOptions.map((k) => {
              const c = count("keyword", (m) => m.keyword === k);
              return (
                <button
                  key={k}
                  className={`sp-fo ${filters.keyword === k ? "on" : ""} ${c ? "" : "zero"}`}
                  onClick={() => setFilter("keyword", k)}
                >
                  <span className="lbl">{k}</span>
                  <span className="c">{c}</span>
                </button>
              );
            })}
          </div>
        )}
      </aside>

      <section className="sp-feed">
        <div className="sp-feed-bar">
          <span>Showing {visible.length}</span>
          {chips.map((c) => (
            <button
              key={c.key}
              className="sp-pillf"
              onClick={() => clearChip(c.key)}
            >
              {c.label}
              <X />
            </button>
          ))}
        </div>
        <div
          ref={listRef}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
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
            <div className="sp-empty">
              <h4>{all.length ? "Nothing here yet." : "No signals yet."}</h4>
              {all.length ? (
                <>
                  No signals match these filters.{" "}
                  <button
                    className="sp-clr"
                    style={{ color: "var(--r1)" }}
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
