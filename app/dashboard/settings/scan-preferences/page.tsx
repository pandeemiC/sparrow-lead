"use client";

import { useState } from "react";
import { SettingsCard, Toggle, Row, Select } from "@/components/ui/SettingsUI";
import { useSettings } from "@/hooks/useSettings";
import { useToastStore } from "@/store/toastStore";
import { ROLE_OPTIONS } from "@/lib/constants";
import type { UserSettings } from "@/types";
import { GhostButton, SectionTitle } from "@/components/sp/ui";

const textareaClass =
  "w-full px-3.5 py-3 rounded-lg bg-white/3 border border-white/8 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 resize-none";

function ScanProfileForm({
  initial,
  onSave,
}: {
  initial: UserSettings;
  onSave: (changes: Partial<UserSettings>) => Promise<boolean>;
}) {
  const toast = useToastStore((s) => s.show);
  const [saved, setSaved] = useState(initial);
  const [role, setRole] = useState(initial.role);
  const [description, setDescription] = useState(initial.description);
  const [listenerContext, setListenerContext] = useState(
    initial.listenerContext,
  );
  const [saving, setSaving] = useState(false);

  const changed =
    role !== saved.role ||
    description !== saved.description ||
    listenerContext !== saved.listenerContext;

  async function saveProfile() {
    setSaving(true);
    const ok = await onSave({ role, description, listenerContext });
    setSaving(false);
    if (ok) {
      setSaved({ ...saved, role, description, listenerContext });
      toast("Scan profile saved", "success");
    }
  }

  return (
    <div className="space-y-5">
      <Row
        title="Your Role"
        description="What best describes you"
        right={
          <Select value={role} onChange={setRole} options={ROLE_OPTIONS} />
        }
      />
      <div className="space-y-2">
        <p className="text-sm font-medium text-white">
          What you&apos;re building
        </p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={1000}
          className={textareaClass}
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-white">
          What you&apos;re hunting for
        </p>
        <textarea
          value={listenerContext}
          onChange={(e) => setListenerContext(e.target.value)}
          rows={4}
          maxLength={1000}
          className={textareaClass}
        />
      </div>
      <div className="flex justify-end">
        <GhostButton onClick={saveProfile} disabled={!changed || saving}>
          {saving ? "Saving…" : "Save profile"}
        </GhostButton>
      </div>
    </div>
  );
}

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

      <SettingsCard>
        <SectionTitle className="mb-2">Scan Profile</SectionTitle>
        <p className="text-sm text-white/35 mb-6">
          The AI reads this when scoring every signal. The more specific, the
          better your scores.
        </p>
        <ScanProfileForm initial={settings} onSave={save} />
      </SettingsCard>
    </div>
  );
}
