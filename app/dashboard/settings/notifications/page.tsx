"use client";

import { Toggle, Row, Select } from "@/components/ui/SettingsUI";
import { useSettings } from "@/hooks/useSettings";
import { ALERT_SCORE_OPTIONS } from "@/lib/constants";

export default function SettingsNotifications() {
  const { settings, save } = useSettings();

  if (!settings) {
    return <p className="text-sm text-white/30">Loading settings…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="sp-card">
        <h2 className="sp-section">Lead Alerts</h2>
        <div className="space-y-5">
          <Row
            title="Hot Lead Emails"
            description="Email me the top new leads found by the automatic scan every 6 hours"
            right={
              <Toggle
                enabled={settings.emailNotifications}
                onChange={(value) => save({ emailNotifications: value })}
              />
            }
          />
          <div className="h-px bg-white/5" />
          <Row
            title="Minimum Intent Score"
            description="Only include leads at or above this AI intent score in the email"
            right={
              <Select
                value={String(settings.alertMinScore)}
                onChange={(value) => save({ alertMinScore: Number(value) })}
                options={ALERT_SCORE_OPTIONS}
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
