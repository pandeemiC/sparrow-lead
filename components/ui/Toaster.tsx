"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useToastStore } from "@/store/toastStore";

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
    <div className="sp-toasts" ref={ref}>
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`sp-toast ${t.kind}`}
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}
