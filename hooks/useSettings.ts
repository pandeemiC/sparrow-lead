"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { useToastStore } from "@/store/toastStore";
import type { UserSettings } from "@/types";

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const toast = useToastStore((s) => s.show);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch<UserSettings>("/api/settings");
        setSettings(data);
      } catch (err) {
        toast(err instanceof Error ? err.message : "Couldn't load settings");
      }
    }
    load();
  }, [toast]);

  async function save(changes: Partial<UserSettings>) {
    if (!settings) return false;

    const previous = settings;
    setSettings({ ...settings, ...changes });

    try {
      const updated = await apiFetch<UserSettings>("/api/settings", {
        method: "PATCH",
        body: JSON.stringify(changes),
      });
      setSettings(updated);
      return true;
    } catch (err) {
      setSettings(previous);
      toast(err instanceof Error ? err.message : "Couldn't save settings");
      return false;
    }
  }

  return { settings, save };
}
