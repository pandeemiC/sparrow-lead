"use client";

import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { Keyword } from "@/types";

const PLATFORMS = ["reddit", "twitter", "hackernews", "linkedin", "youtube"];

export default function KeywordManager({ userId }: { userId: string }) {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [platform, setPlatform] = useState("reddit");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadKeywords() {
      const res = await fetch("/api/keywords");
      const data = await res.json();
      setKeywords(data);
    }
    loadKeywords();
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
    <div className="space-y-6">
      <form onSubmit={addKeyword} className="flex gap-3">
        <input
          type="text"
          onChange={(e) => setNewKeyword(e.target.value)}
          placeholder="Enter a keyword to track..."
          value={newKeyword}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-sparrow-red"
        />

        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sparrow-red"
        >
          {PLATFORMS.map((p) => (
            <option key={p} value={p} className="bg-neutral-900">
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading || !newKeyword.trim()}
          className="bg-sparrow-red hover:bg-sparrow-bright text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </form>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-white">Your Keywords</h2>
        {keywords.length === 0 ? (
          <p>No keywords yet. Add one above to start hunting.</p>
        ) : (
          <div className="grid gap-2">
            {keywords.map((k) => (
              <div
                key={k.id}
                className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-white/10 text-white/60 px-2 py-1 rounded">
                    {k.platform}
                  </span>
                  <span className="text-white">{k.keyword}</span>
                </div>
                <button
                  onClick={() => deleteKeyword(k.id)}
                  className="text-white/30 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <IoClose size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
