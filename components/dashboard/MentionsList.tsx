"use client";

import { useState, useEffect } from "react";
import { FaRedditAlien, FaYCombinator } from "react-icons/fa6";
import { ExternalLink } from "lucide-react";
import { Mention } from "@/types";

const platformIcon: Record<string, React.ReactNode> = {
  reddit: <FaRedditAlien className="text-orange-500" size={14} />,
  hackernews: <FaYCombinator className="text-orange-400" size={14} />,
};

const ITEMS_PER_PAGE = 10;

export default function MentionsList() {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [page, setPage] = useState(1);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(true);

  const totalPages = Math.ceil(mentions.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const visibleMentions = mentions.slice(start, start + ITEMS_PER_PAGE);

  useEffect(() => {
    fetch("/api/mentions")
      .then((r) => r.json())
      .then((data) => {
        setMentions(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  async function fetchMentions() {
    const res = await fetch("/api/mentions");
    const data = await res.json();
    setMentions(Array.isArray(data) ? data : []);
    setPage(1);
  }

  async function handleScan() {
    setScanning(true);
    const res = await fetch("/api/scan", { method: "POST" });
    if (res.ok) await fetchMentions();
    setScanning(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Mentions</h2>
          <p className="text-white/40 text-sm mt-0.5">
            {mentions.length} signal{mentions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="flex items-center gap-2 bg-white/6 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-md border border-white/10 hover:border-white/18 transition-all"
        >
          {scanning ? "Hunting..." : "Hunt Now"}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-lg bg-white/5 border border-white/10 animate-pulse"
            />
          ))}
        </div>
      ) : mentions.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-lg">
          <p className="text-white/40 text-sm">No signals yet.</p>
          <p className="text-white/25 text-xs mt-1">
            Add keywords above and hit Hunt Now.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleMentions.map((mention) => (
            <div
              className="bg-white/2 border border-white/8 hover:border-white/14 rounded-md px-4 py-3 transition-colors"
              key={mention.id}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="mt-0.5 shrink-0">
                    {platformIcon[mention.platform] ?? null}
                  </span>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium leading-snug line-clamp-2">
                      {mention.post_title || "(no title)"}
                    </p>
                    {mention.post_body && (
                      <p className="text-white/40 text-xs mt-1 line-clamp-2">
                        {mention.post_body}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] bg-white/10 text-white/50 px-2 py-0.5 rounded">
                        {mention.platform}
                      </span>
                      {mention.author && (
                        <span className="text-[10px] text-white/30">
                          by {mention.author}
                        </span>
                      )}
                      <span className="text-[10px] text-white/20">
                        {new Date(mention.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <a
                  href={mention.post_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-white/20 hover:text-white transition-colors mt-0.5"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            className="px-3 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ←
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${page === p ? "bg-white/10 border-white/20 text-white" : "bg-white/3 border-white/8 text-white/40 hover:text-white hover:border-white/18"}`}
            >
              {p}
            </button>
          ))}
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
