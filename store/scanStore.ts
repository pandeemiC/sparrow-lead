import { create } from "zustand";

type ScanStore = {
  newSignalsCount: number;
  setNewSignalsCount: (count: number) => void;
  clearNewSignals: () => void;
};

export const useScanStore = create<ScanStore>((set) => ({
  newSignalsCount: 0,
  setNewSignalsCount: (count) => set({ newSignalsCount: count }),
  clearNewSignals: () => set({ newSignalsCount: 0 }),
}));
