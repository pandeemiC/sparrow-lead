"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { ChevronDown, Pause, Play, Plus, RefreshCw } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import PlatformIcon from "@/components/ui/PlatformIcon";
import CountUp from "@/components/sp/CountUp";
import { apiFetch } from "@/lib/apiFetch";
import { toMentionRow } from "@/lib/mentions";
import { platformVar, scoreTier, shortAgo } from "@/lib/score";
import { timeAgo } from "@/lib/utils";
import { PLATFORMS, PLATFORM_LABELS } from "@/lib/constants";
import { usePlan } from "@/components/dashboard/PlanContext";
import { useScanStore } from "@/store/scanStore";
import { useStatsStore } from "@/store/statsStore";
import { useToastStore } from "@/store/toastStore";
import type { Keyword, MentionRow, SignalPlatform } from "@/types";

const DAY = 24 * 60 * 60 * 1000;
const HUNTED = ["hunting", "interested", "engaged", "hunted"];

type Row = Keyword & { paused: boolean };

type RowStats = {
  spark: number[];
  weekTotal: number;
  avg: number;
  hot: number;
  mentions: MentionRow[];
};

function intentColor(avg: number) {
  if (avg >= 7) return "var(--r1)";
  if (avg >= 5) return "var(--amber)";
  return "rgba(255,255,255,.35)";
}

function sparkPath(values: number[]) {
  const w = 92;
  const h = 28;
  const max = Math.max(...values, 1);
  const points = values.map((v, i) => [
    i * (w / (values.length - 1)),
    h - 2 - (v / max) * (h - 6),
  ]);
  const line = points
    .map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(" ");
  return {
    line,
    area: `${line} L${w} ${h} L0 ${h}Z`,
    last: points[points.length - 1],
  };
}

function Sparkline({ values, id }: { values: number[]; id: string }) {
  const { line, area, last } = sparkPath(values);
  const rising =
    values[values.length - 1] >= values[0] && values.some((v) => v > 0);
  const color = rising ? "#FF2438" : "rgba(255,255,255,.4)";
  return (
    <svg viewBox="0 0 92 28">
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity=".35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path className="ar" d={area} fill={`url(#g-${id})`} />
      <path
        className="ln"
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle className="dt" cx={last[0]} cy={last[1]} r="2.5" fill={color} />
    </svg>
  );
}

export default function KeywordsPage() {
  const { limits } = usePlan();
  const toast = useToastStore((s) => s.show);
  const setNewSignalsCount = useScanStore((s) => s.setNewSignalsCount);
  const stats = useStatsStore((s) => s.stats);
  const refreshStats = useStatsStore((s) => s.refresh);

  const [rows, setRows] = useState<Row[] | null>(null);
  const [mentions, setMentions] = useState<MentionRow[]>([]);
  const [draft, setDraft] = useState("");
  const [platforms, setPlatforms] = useState<SignalPlatform[]>([
    "reddit",
    "hackernews",
    "bluesky",
  ]);
  const [adding, setAdding] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [feedFilter, setFeedFilter] = useState<"all" | "hot" | SignalPlatform>(
    "all",
  );
  const [helpOpen, setHelpOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const tableRef = useRef<HTMLDivElement>(null);
  const xpRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  async function loadAll() {
    const [active, archived, list] = await Promise.all([
      apiFetch<Keyword[]>("/api/keywords"),
      apiFetch<Keyword[]>("/api/keywords?archived=true"),
      apiFetch<Record<string, unknown>[]>(
        "/api/mentions?limit=500&sort=newest",
      ),
    ]);
    setRows([
      ...active.map((k) => ({ ...k, paused: false })),
      ...archived.map((k) => ({ ...k, paused: true })),
    ]);
    setMentions(list.map(toMentionRow));
    setNow(Date.now());
  }

  useEffect(() => {
    async function load() {
      try {
        await loadAll();
      } catch (err) {
        toast(err instanceof Error ? err.message : "Couldn't load keywords");
        setRows([]);
      }
    }
    load();
  }, [toast]);

  useEffect(() => {
    if (!helpOpen) return;
    function close(e: MouseEvent) {
      if (popRef.current && !popRef.current.contains(e.target as Node))
        setHelpOpen(false);
    }
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") setHelpOpen(false);
    }
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [helpOpen]);

  function statsFor(keyword: string): RowStats {
    const list = mentions.filter((m) => m.keyword === keyword);
    const spark = Array.from({ length: 7 }, (_, i) => {
      const start = new Date(now - (6 - i) * DAY);
      start.setHours(0, 0, 0, 0);
      const end = start.getTime() + DAY;
      return list.filter((m) => {
        const t = new Date(m.createdAt).getTime();
        return t >= start.getTime() && t < end;
      }).length;
    });
    const scored = list.filter((m) => m.score !== null);
    const avg = scored.length
      ? scored.reduce((s, m) => s + (m.score ?? 0), 0) / scored.length
      : 0;
    return {
      spark,
      weekTotal: spark.reduce((a, b) => a + b, 0),
      avg,
      hot: list.filter((m) => (m.score ?? 0) >= 8).length,
      mentions: list,
    };
  }

  const activeCount = rows?.filter((r) => !r.paused).length ?? 0;
  const atLimit = activeCount >= limits.keywords;
  const canAdd = !!draft.trim() && platforms.length > 0 && !atLimit && !adding;

  useGSAP(
    () => {
      if (!rows) return;
      gsap.fromTo(
        ".sp-tr, .sp-empty-row",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out" },
      );
      tableRef.current
        ?.querySelectorAll<SVGPathElement>(".spark .ln")
        .forEach((p) => {
          const length = p.getTotalLength();
          gsap.fromTo(
            p,
            { strokeDasharray: length, strokeDashoffset: length },
            {
              strokeDashoffset: 0,
              duration: 1.2,
              ease: "power2.inOut",
              delay: 0.15,
            },
          );
        });
      gsap.fromTo(
        ".spark .ar, .spark .dt",
        { opacity: 0 },
        { opacity: 1, duration: 0.6, delay: 0.9 },
      );
      gsap.fromTo(
        ".sp-tr .intent .sp-bar i",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.8,
          stagger: 0.05,
          delay: 0.3,
          ease: "power3.out",
        },
      );
    },
    { scope: tableRef, dependencies: [rows === null] },
  );

  useGSAP(
    () => {
      const xp = xpRef.current;
      if (!xp) return;
      gsap.fromTo(
        xp,
        { height: 0 },
        { height: "auto", duration: 0.55, ease: "power3.out" },
      );
      gsap.fromTo(
        xp.querySelectorAll(
          ".sp-xk > div, .sp-imix, .sp-xp-meta, .sp-feed-h, .sp-sig, .sp-nodata, .sp-feed-f",
        ),
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.035,
          delay: 0.12,
          ease: "power2.out",
        },
      );
      gsap.fromTo(
        xp.querySelectorAll(".sp-stack i"),
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.8,
          stagger: 0.08,
          delay: 0.25,
          ease: "power3.out",
        },
      );
    },
    { dependencies: [openId] },
  );

  useGSAP(
    () => {
      if (!helpOpen || !popRef.current) return;
      const pop = popRef.current.querySelector(".sp-pop");
      if (!pop) return;
      gsap.fromTo(
        pop,
        { autoAlpha: 0, y: -8, scale: 0.97 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: "power3.out" },
      );
      gsap.fromTo(
        pop.querySelectorAll(".sp-pstep"),
        { opacity: 0, x: -8 },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          stagger: 0.05,
          delay: 0.06,
          ease: "power2.out",
        },
      );
    },
    { dependencies: [helpOpen] },
  );

  function togglePlatform(p: SignalPlatform) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  }

  async function addKeyword() {
    const keyword = draft.trim().toLowerCase();
    if (!canAdd) return;
    if (rows?.some((r) => r.keyword.toLowerCase() === keyword && !r.paused)) {
      toast(`Already tracking “${keyword}”`);
      return;
    }
    setAdding(true);
    try {
      const created = await apiFetch<Keyword>("/api/keywords", {
        method: "POST",
        body: JSON.stringify({ keyword, platforms }),
      });
      setRows((prev) => [{ ...created, paused: false }, ...(prev ?? [])]);
      setDraft("");
      setOpenId(created.id);
      setFeedFilter("all");
      toast(`Tracking “${keyword}” — run a scan to collect signals`, "success");
      refreshStats();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't add keyword");
    } finally {
      setAdding(false);
    }
  }

  async function setPaused(row: Row, paused: boolean) {
    if (!paused && atLimit) {
      toast(
        `You're at ${limits.keywords}/${limits.keywords} — pause another keyword first`,
      );
      return;
    }
    setRows(
      (prev) =>
        prev?.map((r) => (r.id === row.id ? { ...r, paused } : r)) ?? prev,
    );
    try {
      if (paused) {
        await apiFetch("/api/keywords", {
          method: "DELETE",
          body: JSON.stringify({ id: row.id }),
        });
        toast("Paused — no new signals; existing ones are kept");
      } else {
        await apiFetch("/api/keywords", {
          method: "PATCH",
          body: JSON.stringify({ id: row.id, active: true }),
        });
        toast("Resumed", "success");
      }
      refreshStats();
    } catch (err) {
      setRows(
        (prev) =>
          prev?.map((r) => (r.id === row.id ? { ...r, paused: !paused } : r)) ??
          prev,
      );
      toast(err instanceof Error ? err.message : "Couldn't update keyword");
    }
  }

  async function huntMention(m: MentionRow) {
    setMentions((prev) =>
      prev.map((x) => (x.id === m.id ? { ...x, status: "hunting" } : x)),
    );
    try {
      await apiFetch(`/api/mentions/${m.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "hunting" }),
      });
      toast("Added to Hunt Board", "success");
      refreshStats();
    } catch (err) {
      setMentions((prev) =>
        prev.map((x) => (x.id === m.id ? { ...x, status: m.status } : x)),
      );
      toast(err instanceof Error ? err.message : "Couldn't add to Hunt Board");
    }
  }

  async function scan() {
    if (scanning) return;
    setScanning(true);
    const prevTotal = stats?.totalSignals ?? 0;
    try {
      await apiFetch("/api/scan/trigger", { method: "POST" });
    } catch (err) {
      setScanning(false);
      toast(err instanceof Error ? err.message : "Couldn't start the scan");
      return;
    }
    let attempts = 0;
    const poll = setInterval(async () => {
      attempts++;
      try {
        await refreshStats();
        const total = useStatsStore.getState().stats?.totalSignals ?? prevTotal;
        if (total > prevTotal || attempts >= 15) {
          clearInterval(poll);
          const newCount = total - prevTotal;
          if (newCount > 0) setNewSignalsCount(newCount);
          toast(
            newCount > 0
              ? `Scan complete — ${newCount} new signals`
              : "Scan complete — nothing new yet",
            "success",
          );
          await loadAll();
          setScanning(false);
        }
      } catch {
        clearInterval(poll);
        setScanning(false);
        toast("Lost track of the scan. Check Signals in a minute.");
      }
    }, 3000);
  }

  if (rows === null) {
    return <div className="sp-loading">LOADING KEYWORDS…</div>;
  }

  const slotsLeft = Math.max(limits.keywords - activeCount, 0);

  return (
    <div className="sp-kw-wrap">
      <div className="sp-head">
        <div className="sp-sub" style={{ position: "relative" }} ref={popRef}>
          <span>
            {activeCount} of {limits.keywords} tracked
          </span>
          <button
            className={`sp-help ${helpOpen ? "on" : ""}`}
            onClick={() => setHelpOpen((v) => !v)}
            aria-label="How keywords work"
            aria-expanded={helpOpen}
          >
            ?
          </button>
          {helpOpen && (
            <div className="sp-pop" role="dialog">
              <h5>HOW KEYWORDS WORK</h5>
              <div className={`sp-pstep ${rows.length ? "done" : ""}`}>
                <div className="n">01</div>
                <div>
                  <h4>Add a keyword</h4>
                  <p>
                    A phrase buyers would actually type — a pain point, a
                    competitor, a request.
                  </p>
                </div>
              </div>
              <div className="sp-pstep">
                <div className="n">02</div>
                <div>
                  <h4>We scan</h4>
                  <p>
                    Reddit, Hacker News and Bluesky — when you hit scan, and
                    every 6 hours if automatic scanning is on.
                  </p>
                </div>
              </div>
              <div className="sp-pstep">
                <div className="n">03</div>
                <div>
                  <h4>AI scores intent</h4>
                  <p>
                    Every mention is rated 1–10 for buying readiness. High
                    intent surfaces first.
                  </p>
                </div>
              </div>
              <div className="sp-pstep">
                <div className="n">04</div>
                <div>
                  <h4>Act on it</h4>
                  <p>
                    Draft a reply, move it to your Hunt Board, or dismiss the
                    noise.
                  </p>
                </div>
              </div>
            </div>
          )}
          <span>·</span>
          <span>
            Last scan{" "}
            {stats?.lastScannedAt ? timeAgo(stats.lastScannedAt) : "never"}
          </span>
        </div>
        <button
          className={`sp-btn ${scanning ? "spin" : ""}`}
          onClick={scan}
          disabled={scanning}
        >
          <RefreshCw />
          {scanning ? "Scanning…" : "Run scan"}
        </button>
      </div>

      <div className="sp-card sp-composer">
        <div className="sp-cin">
          <Plus />
          <input
            value={draft}
            maxLength={60}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addKeyword()}
            placeholder="Add a phrase buyers would type — e.g. “looking for a web designer”"
          />
          <div className="sp-plats">
            {PLATFORMS.map((p) => (
              <button
                key={p.value}
                type="button"
                className={`sp-plat ${platforms.includes(p.value) ? "on" : ""}`}
                style={{ "--pc": platformVar(p.value) } as React.CSSProperties}
                onClick={() => togglePlatform(p.value)}
              >
                <span className="ic">
                  <PlatformIcon platform={p.value} size={13} />
                </span>
                {p.label}
              </button>
            ))}
          </div>
          <button
            className="sp-btn pri"
            onClick={addKeyword}
            disabled={!canAdd}
          >
            {adding ? "Adding…" : "Track"}
          </button>
        </div>
        {atLimit && (
          <div className="sp-limit">
            You’ve reached {limits.keywords} of {limits.keywords} keywords.
            Pause one, or upgrade for more.
          </div>
        )}
      </div>

      <div className="sp-card sp-tbl" ref={tableRef}>
        <div className="sp-th">
          <span>Keyword</span>
          <span>Sources</span>
          <span>Signals · 7d</span>
          <span>Avg intent</span>
          <span>Hot</span>
          <span />
        </div>

        {rows.length === 0 && (
          <div className="sp-empty-row">
            No keywords yet — add a phrase above to start hunting.
          </div>
        )}

        {rows.map((row) => {
          const s = statsFor(row.keyword);
          const open = openId === row.id;
          const feed = s.mentions.filter((m) =>
            feedFilter === "all"
              ? true
              : feedFilter === "hot"
                ? (m.score ?? 0) >= 7
                : m.platform === feedFilter,
          );
          const hi = s.mentions.filter(
            (m) => scoreTier(m.score) === "hi",
          ).length;
          const md = s.mentions.filter(
            (m) => scoreTier(m.score) === "md",
          ).length;
          const lo = s.mentions.length - hi - md;
          const total = Math.max(s.mentions.length, 1);

          return (
            <Fragment key={row.id}>
              <div
                className={`sp-tr ${open ? "sel" : ""} ${row.paused ? "paused" : ""}`}
                onClick={() => {
                  setOpenId(open ? null : row.id);
                  setFeedFilter("all");
                }}
              >
                <div className="kw">
                  <b>{row.keyword}</b>
                  <small>
                    {row.paused
                      ? "Paused"
                      : `Added ${new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                  </small>
                </div>
                <div className="pl">
                  {(row.platforms ?? []).map((p) => (
                    <PlatformIcon key={p} platform={p} size={16} />
                  ))}
                </div>
                <div className="spark">
                  <Sparkline values={s.spark} id={row.id} />
                  <span>{s.weekTotal}</span>
                </div>
                <div className="intent">
                  <div className="sp-bar">
                    <i
                      style={{
                        width: `${s.avg * 10}%`,
                        background: intentColor(s.avg),
                      }}
                    />
                  </div>
                  <span>{s.avg ? s.avg.toFixed(1) : "–"}</span>
                </div>
                <div className={`num ${s.hot ? "hot" : ""}`}>{s.hot}</div>
                <div className="acts">
                  <button
                    className="sp-icon-btn"
                    title={row.paused ? "Resume" : "Pause"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPaused(row, !row.paused);
                    }}
                  >
                    {row.paused ? <Play /> : <Pause />}
                  </button>
                  <button
                    className="sp-icon-btn chev"
                    title={open ? "Collapse" : "Expand"}
                  >
                    <ChevronDown />
                  </button>
                </div>
              </div>

              {open && (
                <div className="sp-xp" ref={xpRef}>
                  <div className="sp-xp-in">
                    <div className="sp-xp-side">
                      <div className="sp-xk">
                        <div>
                          <b>
                            <CountUp value={s.weekTotal} delay={0.15} />
                          </b>
                          <small>Signals · 7d</small>
                        </div>
                        <div>
                          <b style={{ color: intentColor(s.avg) }}>
                            <CountUp value={s.avg} decimals={1} delay={0.15} />
                          </b>
                          <small>Avg intent</small>
                        </div>
                        <div>
                          <b>
                            <CountUp value={s.hot} delay={0.15} />
                          </b>
                          <small>Hot leads</small>
                        </div>
                      </div>
                      <div className="sp-imix">
                        <div className="row">
                          <span>Intent mix</span>
                          <span>{s.mentions.length} total</span>
                        </div>
                        {s.mentions.length ? (
                          <>
                            <div className="sp-stack">
                              {hi > 0 && (
                                <i
                                  style={{
                                    flex: hi / total,
                                    background: "var(--r1)",
                                  }}
                                />
                              )}
                              {md > 0 && (
                                <i
                                  style={{
                                    flex: md / total,
                                    background: "var(--amber)",
                                  }}
                                />
                              )}
                              {lo > 0 && (
                                <i
                                  style={{
                                    flex: lo / total,
                                    background: "rgba(255,255,255,.18)",
                                  }}
                                />
                              )}
                            </div>
                            <div className="sp-legend">
                              <span>
                                <i style={{ background: "var(--r1)" }} />
                                High {hi}
                              </span>
                              <span>
                                <i style={{ background: "var(--amber)" }} />
                                Medium {md}
                              </span>
                              <span>
                                <i
                                  style={{
                                    background: "rgba(255,255,255,.18)",
                                  }}
                                />
                                Low {lo}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="row" style={{ margin: 0 }}>
                            Waiting for the first scan.
                          </div>
                        )}
                      </div>
                      <div className="sp-xp-meta">
                        Tracking on{" "}
                        {(row.platforms ?? [])
                          .map((p) => PLATFORM_LABELS[p as SignalPlatform])
                          .join(" + ")}
                        {row.paused && " · paused"}
                      </div>
                    </div>

                    <div className="sp-xp-feed">
                      <div className="sp-feed-h">
                        <b>Latest signals</b>
                        <div className="sp-seg">
                          {[
                            { key: "all" as const, label: "All" },
                            { key: "hot" as const, label: "Hot" },
                            ...(row.platforms ?? []).map((p) => ({
                              key: p as SignalPlatform,
                              label:
                                p === "hackernews"
                                  ? "HN"
                                  : PLATFORM_LABELS[p as SignalPlatform],
                            })),
                          ].map((f) => (
                            <button
                              key={f.key}
                              className={feedFilter === f.key ? "on" : ""}
                              onClick={() => setFeedFilter(f.key)}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      {s.mentions.length === 0 ? (
                        <div className="sp-nodata">
                          No signals yet — run a scan to start collecting.
                        </div>
                      ) : feed.length === 0 ? (
                        <div className="sp-nodata">
                          No signals match this filter yet.
                        </div>
                      ) : (
                        feed.slice(0, 6).map((m) => {
                          const onBoard = HUNTED.includes(m.status);
                          return (
                            <div key={m.id} className="sp-sig">
                              <div className={`sp-sc ${scoreTier(m.score)}`}>
                                {m.score ?? "–"}
                              </div>
                              <div>
                                <p>{m.title}</p>
                                <small>
                                  <PlatformIcon
                                    platform={m.platform}
                                    size={11}
                                  />
                                  {m.source}
                                  <span>·</span>
                                  {shortAgo(m.createdAt)} ago
                                  <button
                                    className={`go ${onBoard ? "added" : ""}`}
                                    disabled={onBoard}
                                    onClick={() => huntMention(m)}
                                  >
                                    {onBoard ? "On Hunt Board ✓" : "+ Hunt"}
                                  </button>
                                </small>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div className="sp-feed-f">
                        <Link href="/dashboard/signals">
                          View all in Signals →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Fragment>
          );
        })}

        {rows.length > 0 && slotsLeft > 0 && (
          <div className="sp-empty-row">
            {slotsLeft} slot{slotsLeft > 1 ? "s" : ""} left on your plan
          </div>
        )}
      </div>
    </div>
  );
}
