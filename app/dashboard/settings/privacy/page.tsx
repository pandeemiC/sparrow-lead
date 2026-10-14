"use client";

import { useState } from "react";
import { RiShieldKeyholeLine } from "react-icons/ri";
import { SettingsCard, Row } from "@/components/ui/SettingsUI";
import { useToastStore } from "@/store/toastStore";
import { GhostButton, SectionTitle } from "@/components/sp/ui";

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
      <SettingsCard>
        <div className="flex items-center gap-3 mb-6 bg-panel-2 border border-line-2 rounded-lg px-3 py-2 w-fit">
          <RiShieldKeyholeLine size={20} className="text-white/40 shrink-0" />
          <SectionTitle className="mb-0">Privacy</SectionTitle>
        </div>
        <Row
          title="Export Your Data"
          description="Download a JSON file with your account settings, keywords, and signals"
          right={
            <GhostButton onClick={exportData} disabled={exporting}>
              {exporting ? "Exporting…" : "Export"}
            </GhostButton>
          }
        />
      </SettingsCard>
    </div>
  );
}
