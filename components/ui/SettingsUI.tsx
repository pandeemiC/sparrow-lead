"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

export function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`sp-switch ${enabled ? "on" : ""}`}
    >
      <i />
    </button>
  );
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
        <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>
          {title}
        </p>
        <p className="text-sm" style={{ color: "var(--ink-3)" }}>
          {description}
        </p>
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
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="sp-ghost"
        style={{
          minWidth: 150,
          justifyContent: "space-between",
          color: "var(--ink)",
        }}
      >
        <span>{selected?.label ?? "Select…"}</span>
        <ChevronDown
          size={13}
          style={{
            transform: open ? "rotate(180deg)" : undefined,
            transition: "transform .2s",
          }}
        />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 overflow-hidden min-w-40"
          style={{
            background: "rgba(22,11,13,.96)",
            border: "1px solid var(--line-2)",
            borderRadius: 12,
            boxShadow: "0 24px 60px rgba(0,0,0,.5)",
            padding: 4,
          }}
        >
          {options.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm rounded-lg transition-colors hover:bg-white/5"
              style={{
                color: opt.value === value ? "var(--ink)" : "var(--ink-2)",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
