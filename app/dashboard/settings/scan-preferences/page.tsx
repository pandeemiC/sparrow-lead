"use client";

import Link from "next/link";
import { SettingsCard, Toggle, Row } from "@/components/ui/SettingsUI";
import { useSettings } from "@/hooks/useSettings";
import { SectionTitle, ghostClass } from "@/components/sp/ui";

export default function SettingsScanPreferences() {
  const { settings, save } = useSettings();

  if (!settings) {
    return <p className="text-sm text-white/30">Loading settings…</p>;
  }

  return (
    <div className="space-y-4">
      <SettingsCard>
        <SectionTitle>Scan Schedule</SectionTitle>
        <Row
          title="Automatic Scanning"
          description="Scan your active keywords every 6 hours. Manual scans always work."
          right={
            <Toggle
              enabled={settings.autoScan}
              onChange={(value) => save({ autoScan: value })}
            />
          }
        />
      </SettingsCard>

      <SettingsCard className="flex items-center justify-between gap-4">
        <div>
          <SectionTitle className="mb-2">Hunt Profile</SectionTitle>
          <p className="text-sm text-ink-3">
            What the AI looks for when it scores signals and drafts replies now
            lives on its own page.
          </p>
        </div>
        <Link href="/dashboard/hunt-profile" className={ghostClass()}>
          Open Hunt Profile
        </Link>
      </SettingsCard>
    </div>
  );
}
