"use client";

import { useState } from "react";
import { RiShieldKeyholeLine } from "react-icons/ri";
import { Row } from "@/components/ui/SettingsUI";
import { useToastStore } from "@/store/toastStore";

export default function SettingsPrivacy() {
  const [exporting, setExporting] = useState(false);
  const toast = useToastStore((s) => s.show);

  async function exportData() {
    setExporting(true);
    try {
      const res = await fetch("/api/settings/export");
      if (!res.ok) throw new Error("Export failed. Please try again.");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sparrow-export-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl glass-red border border-white/5 p-6 glow-right">
        <div className="flex items-center gap-3 mb-6 glass-red border border-white/10 rounded-lg px-3 py-2 w-fit">
          <RiShieldKeyholeLine size={20} className="text-white/40 shrink-0" />
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
            Privacy
          </h2>
        </div>
        <Row
          title="Export Your Data"
          description="Download a JSON file with your account settings, keywords, and signals"
          right={
            <button
              onClick={exportData}
              disabled={exporting}
              className="edit-btn disabled:opacity-35 disabled:cursor-not-allowed"
            >
              {exporting ? "Exporting…" : "Export"}
            </button>
          }
        />
      </div>
    </div>
  );
}
