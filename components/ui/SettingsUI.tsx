"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Card, GhostButton, Switch } from "@/components/sp/ui";

// data-card is what the settings layout animates in
export function SettingsCard({ className, ...props }: ComponentProps<"div">) {
  return (
    <Card data-card className={cn("px-6 py-[22px]", className)} {...props} />
  );
}

export function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (val: boolean) => void;
}) {
  return <Switch on={enabled} onClick={() => onChange(!enabled)} />;
}

export function Row({
  title,
  description,
  right,
}: {
  title: string;
  description: string;
  right: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="space-y-1">
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="text-sm text-ink-3">{description}</p>
      </div>
      {right}
    </div>
  );
}

export function Select({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative shrink-0">
      <GhostButton
        type="button"
        onClick={() => setOpen(!open)}
        className="min-w-[150px] justify-between text-ink"
      >
        <span>{selected?.label ?? "Select…"}</span>
        <ChevronDown
          size={13}
          className={cn(
            "transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </GhostButton>
      {open && (
        <div className="absolute top-full right-0 z-50 mt-1 min-w-40 overflow-hidden rounded-xl border border-line-2 bg-[rgba(22,11,13,0.96)] p-1 shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
          {options.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={cn(
                "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-white/5",
                opt.value === value ? "text-ink" : "text-ink-2",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
