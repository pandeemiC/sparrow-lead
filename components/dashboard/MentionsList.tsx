"use client";

import { useState, useEffect } from "react";
import { FaRedditAlien, FaYCombinator } from "react-icons/fa6";
import { ExternalLink, RefreshCw } from "lucide-react";
import { Mention } from "@/types";

const platformIcon: Record<string, React.ReactNode> = {
  reddit: <FaRedditAlien className="text-orange-500" size={14} />,
  hackernews: <FaYCombinator className="text-orange-400" size={14} />,
};

export default function MentionsList({ userId }: { userId: string }) {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMentions();
  }, []);

  async function fetchMentions() {
    setLoading(true);
    const res = await fetch("/api/mentions");
    const data = await res.json();
    setMentions(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function handleScan() {
    setScanning(true);
    const res = await fetch("/api/scan", { method: "POST" });
    const data = await res.json();

    if (res.ok) {
      await fetchMentions();
    }

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
          className="flex items-center gap-2 bg-sparrow-red hover:bg-sparrow-bright disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors"
        >
          {scanning ? "Hunting..." : "Hunt Now"}
        </button>
      </div>
    </div>
  );
}
