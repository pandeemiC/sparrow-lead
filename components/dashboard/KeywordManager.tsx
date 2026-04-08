"use client";

import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { Tag, Plus } from "lucide-react";
import { FaRedditAlien, FaYCombinator } from "react-icons/fa6";
import { Select } from "@/components/ui/SettingsUI";
import { Keyword } from "@/types";

const PLATFORMS = [
  { label: "Reddit", value: "reddit" },
  { label: "Hacker News", value: "hackernews" },
  { label: "Twitter", value: "twitter" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "YouTube", value: "youtube" },
];

const platformIcon: Record<string, React.ReactNode> = {
  reddit: <FaRedditAlien className="text-orange-500" size={12} />,
  hackernews: <FaYCombinator className="text-orange-400" size={12} />,
};

export default function KeywordManager() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [platform, setPlatform] = useState("reddit");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/keywords")
      .then((r) => r.json())
      .then(setKeywords);
  }, []);

  async function addKeyword(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    setLoading(true);
    const res = await fetch("/api/keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword: newKeyword, platform }),
    });
    const created = await res.json();
    setKeywords((prev) => [created, ...prev]);
    setNewKeyword("");
    setLoading(false);
  }

  async function deleteKeyword(id: string) {
    await fetch("/api/keywords", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setKeywords((prev) => prev.filter((k) => k.id !== id));
  }

  return (
    <div className="flex flex-col gap-5 h-full">
      <form onSubmit={addKeyword} className="flex flex-col gap-3">
        <input
          type="text"
          onChange={(e) => setNewKeyword(e.target.value)}
          placeholder="Add a keyword..."
          value={newKeyword}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-sparrow-red/50 transition-colors"
        />
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Select
              value={platform}
              onChange={setPlatform}
              options={PLATFORMS}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !newKeyword.trim()}
            className="flex items-center gap-2 bg-sparrow-red hover:bg-sparrow-bright text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            <Plus size={15} />
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </form>

      <div className="h-px bg-white/5" />

      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">
          Tracked Keywords
        </p>
        <span className="text-xs text-white/25">{keywords.length} / 5</span>
      </div>

      {keywords.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white/3 flex items-center justify-center">
            <Tag size={18} className="text-white/15" />
          </div>
          <p className="text-sm text-white/25">No keywords yet</p>
          <p className="text-xs text-white/15">Add one above to start tracking</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 overflow-y-auto">
          {keywords.map((k) => (
            <div
              key={k.id}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/3 border border-white/5 hover:border-white/10 transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="shrink-0">
                  {platformIcon[k.platform] ?? (
                    <Tag size={12} className="text-white/20" />
                  )}
                </span>
                <span className="text-sm text-white truncate">{k.keyword}</span>
              </div>
              <button
                onClick={() => deleteKeyword(k.id)}
                className="text-white/20 hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
              >
                <IoClose size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
