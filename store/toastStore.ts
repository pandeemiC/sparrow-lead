import { create } from "zustand";

type ToastKind = "error" | "success";

export type Toast = {
  id: number;
  message: string;
  kind: ToastKind;
};

type ToastStore = {
  toasts: Toast[];
  show: (message: string, kind?: ToastKind) => void;
  dismiss: (id: number) => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  show: (message, kind = "error") => {
    const id = Date.now();
    set((s) => ({ toasts: [...s.toasts, { id, message, kind }] }));
    setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      3500,
    );
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
