"use client";

import { useToastStore } from "@/store/toastStore";

export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`px-4 py-2 rounded-full text-sm border backdrop-blur cursor-pointer ${
            t.kind === "error"
              ? "bg-red-950/80 border-red-500/40 text-red-100"
              : "bg-white/10 border-white/15 text-white"
          }`}
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}
