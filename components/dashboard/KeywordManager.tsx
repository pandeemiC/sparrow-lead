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
    fetchKeywords();
  }, []);

  async function fetchKeywords() {
    const res = await fetch("/api/keywords");
    const data = await res.json();
    setKeywords(data);
  }

  async function addKeyword(e: React.FormEvent) {
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
    <div className="text-white">
      <h2 className="text-xl font-semibold">Your Keywords</h2>
      <p className="text-white/50 mt-2">Keyword management coming soon...</p>
    </div>
  );
}
