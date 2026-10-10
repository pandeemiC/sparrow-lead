import { create } from "zustand";
import { apiFetch } from "@/lib/apiFetch";
import type { Stats } from "@/types";

type StatsStore = {
  stats: Stats | null;
  refresh: () => Promise<void>;
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
}));
