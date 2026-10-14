"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useToastStore } from "@/store/toastStore";
import { cn } from "@/lib/utils";

export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const last = ref.current?.lastElementChild;
      if (last) {
        gsap.fromTo(
          last,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" },
        );
      }
    },
    { scope: ref, dependencies: [toasts.length] },
  );

  return (
    <div
      ref={ref}
      className="fixed bottom-6 left-1/2 z-60 flex -translate-x-1/2 flex-col items-center gap-2"
    >
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={cn(
            "cursor-pointer rounded-full border border-line-2 bg-[#1a0f10] px-4 py-2.5 font-body text-[13px] leading-[normal] text-ink shadow-[0_16px_40px_rgba(0,0,0,0.5)]",
            t.kind === "error" && "border-r1/45",
            t.kind === "success" && "border-green/35",
          )}
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}
