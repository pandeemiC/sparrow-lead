import { create } from "zustand";
import { apiFetch } from "@/lib/apiFetch";
import type { Stats } from "@/types";

type Counter = "keywordsTracked" | "signalsThisMonth" | "totalSignals";

type StatsStore = {
  stats: Stats | null;
  refresh: () => Promise<void>;
  // optimistic change before the server confirms, e.g. a keyword was just added
  adjust: (key: Counter, by: number) => void;
};

export const useStatsStore = create<StatsStore>((set) => ({
  stats: null,
  refresh: async () => {
    try {
      const stats = await apiFetch<Stats>("/api/stats");
      set({ stats });
    } catch {
      set((s) => s);
    }
  },
  adjust: (key, by) =>
    set((s) =>
      s.stats
        ? { stats: { ...s.stats, [key]: Math.max(0, s.stats[key] + by) } }
        : s,
    ),
}));
