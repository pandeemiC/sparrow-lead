"use client";

import { useState } from "react";
import { ScanLine } from "lucide-react";
import KeywordManager from "@/components/dashboard/KeywordManager";
import { useScanStore } from "@/store/scanStore";
import { apiFetch } from "@/lib/apiFetch";
import { useToastStore } from "@/store/toastStore";

export default function KeywordsPage() {
  const setNewSignalsCount = useScanStore((s) => s.setNewSignalsCount);
  const [scanning, setScanning] = useState(false);

  const toast = useToastStore((s) => s.show);

  async function scan() {
    if (scanning) return;
    setScanning(true);

    try {
      const base = await apiFetch<{ totalSignals: number }>("/api/stats");
      const prevTotal = base.totalSignals ?? 0;
      await apiFetch("/api/scan/trigger", { method: "POST" });

      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        try {
          const data = await apiFetch<{ totalSignals: number }>("/api/stats");
          if (data.totalSignals > prevTotal || attempts >= 15) {
            clearInterval(poll);
            const newCount = data.totalSignals - prevTotal;
            if (newCount > 0) {
              setNewSignalsCount(newCount);
              toast(
                `${newCount} new signal${newCount > 1 ? "s" : ""} found`,
                "success",
              );
            }
            setScanning(false);
          }
        } catch {
          clearInterval(poll);
          setScanning(false);
          toast("Lost track of the scan. Check Signals in a minute.");
        }
      }, 3000);
    } catch (err) {
      setScanning(false);
      toast(err instanceof Error ? err.message : "Could not start the scan.");
    }
  }

  return (
    <div className="p-5 h-full flex gap-4 min-h-0">
      <div className="flex-1 rounded-xl glass-red border border-white/5 p-5 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-white">Keywords</h2>
          <button
            onClick={scan}
            disabled={scanning}
            className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-sparrow-red hover:bg-sparrow-bright text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <ScanLine size={14} className={scanning ? "animate-spin" : ""} />
            {scanning ? "Scanning…" : "Scan Now"}
          </button>
        </div>
        <KeywordManager />
      </div>

      <div className="flex-2 rounded-xl glass-red border border-white/5 p-5 flex flex-col min-h-0 glow-b-right">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">
            How Keywords Work
          </h2>
        </div>
        <div className="flex flex-col gap-5 text-sm text-white/40 leading-relaxed mt-5">
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-widest">
              1. Add a keyword
            </p>
            <p>
              Enter any term you want to track — your product name, a
              competitor, a pain point your customers talk about. Choose the
              platform (Reddit or Hacker News).
            </p>
          </div>
          <div className="w-full h-px bg-white/5" />
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-widest">
              2. Run a scan
            </p>
            <p>
              Sparrow scans Reddit and Hacker News for posts and comments
              mentioning your keywords. New mentions land in your Signals inbox.
            </p>
          </div>
          <div className="w-full h-px bg-white/5" />
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-widest">
              3. AI scores every signal
            </p>
            <p>
              Every mention is scored 1–10 for buyer intent. High-intent signals
              surface first. You see{" "}
              <em className="text-white/60 not-italic">who has a problem</em>{" "}
              and{" "}
              <em className="text-white/60 not-italic">how ready they are</em>{" "}
              to act on it.
            </p>
          </div>
          <div className="w-full h-px bg-white/5" />
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-widest">
              4. Act on it
            </p>
            <p>
              Add hot leads to your Hunt Board, generate a contextual reply, or
              dismiss noise — all from the Signals page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
