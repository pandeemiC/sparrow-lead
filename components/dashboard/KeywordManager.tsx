"use client";

import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { Tag, Plus, ChevronDown, RotateCcw } from "lucide-react";
import { FaRedditAlien, FaYCombinator } from "react-icons/fa6";
import { Keyword } from "@/types";
import { apiFetch } from "@/lib/apiFetch";
import { useToastStore } from "@/store/toastStore";

const PLATFORMS = [
  { label: "Reddit", value: "reddit" },
  { label: "Hacker News", value: "hackernews" },
];

const MAX = 5;

const platformIcon: Record<string, React.ReactNode> = {
  reddit: <FaRedditAlien className="text-orange-500" size={12} />,
  hackernews: <FaYCombinator className="text-orange-400" size={12} />,
};

export default function KeywordManager() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [archived, setArchived] = useState<Keyword[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [platforms, setPlatforms] = useState<string[]>(["reddit"]);
  const [loading, setLoading] = useState(false);

  const toast = useToastStore((s) => s.show);

  useEffect(() => {
    async function load() {
      try {
        const [active, archivedList] = await Promise.all([
          apiFetch<Keyword[]>("/api/keywords"),
          apiFetch<Keyword[]>("/api/keywords?archived=true"),
        ]);
        setKeywords(active);
        setArchived(archivedList);
      } catch (err) {
        toast(err instanceof Error ? err.message : "Couldn't load keywords");
      }
    }
    load();
  }, [toast]);

  const atLimit = keywords.length >= MAX;

  function togglePlatform(value: string) {
    setPlatforms((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value],
    );
  }

  async function addKeyword(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newKeyword.trim() || platforms.length === 0) return;
    setLoading(true);
    try {
      const created = await apiFetch<Keyword>("/api/keywords", {
        method: "POST",
        body: JSON.stringify({ keyword: newKeyword, platforms }),
      });
      setKeywords((prev) => [created, ...prev]);
      setNewKeyword("");
      setPlatforms(["reddit"]);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't add keyword.");
    } finally {
      setLoading(false);
    }
  }

  async function archiveKeyword(k: Keyword) {
    setKeywords((prev) => prev.filter((x) => x.id !== k.id));
    setArchived((prev) => [k, ...prev]);
    try {
      await apiFetch("/api/keywords", {
        method: "DELETE",
        body: JSON.stringify({ id: k.id }),
      });
    } catch (err) {
      setArchived((prev) => prev.filter((x) => x.id !== k.id));
      setKeywords((prev) => [k, ...prev]);
      toast(err instanceof Error ? err.message : "Couldn't archive keyword.");
    }
  }

  async function restoreKeyword(k: Keyword) {
    if (atLimit) return;
    setArchived((prev) => prev.filter((x) => x.id !== k.id));
    setKeywords((prev) => [k, ...prev]);
    try {
      await apiFetch<Keyword>("/api/keywords", {
        method: "PATCH",
        body: JSON.stringify({ id: k.id, active: true }),
      });
    } catch (err) {
      setKeywords((prev) => prev.filter((x) => x.id !== k.id));
      setArchived((prev) => [k, ...prev]);
      toast(err instanceof Error ? err.message : "Couldn't restore keyword");
    }
  }

  return (
    <div className="flex flex-col gap-5 h-full">
      <form onSubmit={addKeyword} className="flex flex-col gap-3">
        <input
          type="text"
          onChange={(e) => setNewKeyword(e.target.value)}
          placeholder="Add a keyword..."
          value={newKeyword}
          className="w-full bg-white/2 border border-white/8 rounded-md px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
        />
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 flex-1">
            {PLATFORMS.map((p) => {
              const active = platforms.includes(p.value);
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => togglePlatform(p.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-all cursor-pointer ${
                    active
                      ? "bg-red-500/10 border-red-500/50 text-white"
                      : "bg-white/2 border-white/8 text-white/40 hover:text-white/70 hover:border-white/15"
                  }`}
                >
                  {platformIcon[p.value]}
                  {p.label}
                </button>
              );
            })}
          </div>
          <button
            type="submit"
            disabled={loading || !newKeyword.trim() || platforms.length === 0}
            className="flex items-center gap-2 bg-white/6 hover:bg-white/10 text-white text-sm font-medium px-4 py-2 rounded-md border border-white/10 hover:border-white/18 transition-all disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            <Plus size={15} />
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </form>

      <div className="h-px bg-white/5" />

      <div className="flex items-center justify-between shrink-0">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">
          Tracked Keywords
        </p>
        <span className="text-xs text-white/25">
          {keywords.length} / {MAX}
        </span>
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
        {keywords.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/3 flex items-center justify-center">
              <Tag size={18} className="text-white/15" />
            </div>
            <p className="text-sm text-white/25">No keywords yet</p>
            <p className="text-xs text-white/15">
              Add one above to start tracking
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {keywords.map((k) => (
              <div
                key={k.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/3 border border-white/5 hover:border-white/10 transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex items-center gap-1.5 shrink-0">
                    {(k.platforms ?? []).map((p) => (
                      <span key={p}>
                        {platformIcon[p] ?? (
                          <Tag size={12} className="text-white/20" />
                        )}
                      </span>
                    ))}
                  </span>
                  <span className="text-sm text-white truncate">
                    {k.keyword}
                  </span>
                </div>
                <button
                  onClick={() => archiveKeyword(k)}
                  title="Archive (keeps signals)"
                  className="text-white/20 hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <IoClose size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {archived.length > 0 && (
        <div className="shrink-0 border-t border-white/5 pt-4">
          <button
            onClick={() => setShowArchived((v) => !v)}
            className="flex items-center justify-between w-full text-xs font-semibold text-white/40 uppercase tracking-widest hover:text-white/60 transition-colors cursor-pointer"
          >
            <span>Archived · {archived.length}</span>
            <ChevronDown
              size={13}
              className={`transition-transform ${showArchived ? "" : "-rotate-90"}`}
            />
          </button>
          {showArchived && (
            <div className="flex flex-col gap-2 mt-3">
              <p className="text-xs text-white/25">
                Archived keywords stop scanning but keep their signals.
              </p>
              {archived.map((k) => (
                <div
                  key={k.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/2 border border-white/5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex items-center gap-1.5 shrink-0 opacity-50">
                      {(k.platforms ?? []).map((p) => (
                        <span key={p}>
                          {platformIcon[p] ?? (
                            <Tag size={12} className="text-white/20" />
                          )}
                        </span>
                      ))}
                    </span>
                    <span className="text-sm text-white/45 truncate">
                      {k.keyword}
                    </span>
                  </div>
                  <button
                    onClick={() => restoreKeyword(k)}
                    disabled={atLimit}
                    title={
                      atLimit
                        ? `Archive one first — ${MAX}/${MAX} tracked`
                        : "Restore"
                    }
                    className="flex items-center gap-1.5 text-xs text-white/40 hover:text-emerald-400 transition-colors shrink-0 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
