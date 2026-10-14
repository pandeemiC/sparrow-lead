"use client";

import { useEffect, useState } from "react";
import { RotateCw, Save, Trash2, type LucideIcon } from "lucide-react";
import { Button, GhostButton } from "@/components/sp/ui";
import { cn } from "@/lib/utils";
import type { HuntProfileCounts, HuntProfileSaveMode } from "@/types";

type Option = {
  mode: HuntProfileSaveMode;
  icon: LucideIcon;
  title: string;
  body: string;
  disabled?: boolean;
  danger?: boolean;
};

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

// asked every time the hunt profile is saved: what should happen to existing data.
// the page mounts it only while open, so it always starts on the safe option
export default function SaveProfileDialog({
  counts,
  saving,
  onCancel,
  onConfirm,
}: {
  counts: HuntProfileCounts;
  saving: boolean;
  onCancel: () => void;
  onConfirm: (mode: HuntProfileSaveMode) => void;
}) {
  const [mode, setMode] = useState<HuntProfileSaveMode>("keep");
  const [confirmFresh, setConfirmFresh] = useState(false);

  useEffect(() => {
    const esc = (e: KeyboardEvent) =>
      e.key === "Escape" && !saving && onCancel();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [saving, onCancel]);

  const options: Option[] = [
    {
      mode: "keep",
      icon: Save,
      title: "Keep everything as is",
      body: "Save your profile and leave existing signals and scores untouched. New scans use the new profile.",
    },
    {
      mode: "rescore",
      icon: RotateCw,
      title: "Keep my data and re-score it",
      body:
        counts.untouched > 0
          ? `Re-score your ${plural(counts.untouched, "untouched signal")} with the new profile, in the background. Leads on your Hunt Board keep their scores.`
          : "You have no untouched signals to re-score right now.",
      disabled: counts.untouched === 0,
    },
    {
      mode: "fresh",
      icon: Trash2,
      title: "Start fresh",
      body: `Delete ${plural(counts.removable, "signal")} and your keywords, then build up again with the new profile. ${
        counts.onBoard > 0
          ? `Your ${plural(counts.onBoard, "Hunt Board lead")} stay, and the keywords they came from are paused instead of deleted.`
          : "Your Hunt Board is empty, so nothing there is affected."
      }`,
      danger: true,
    },
  ];

  const submit = () => {
    if (mode === "fresh" && !confirmFresh) {
      setConfirmFresh(true);
      return;
    }
    onConfirm(mode);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div
        className="absolute inset-0 bg-[rgba(5,2,3,0.65)] backdrop-blur-sm"
        onClick={() => !saving && onCancel()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-profile-title"
        className="relative w-full max-w-[520px] animate-[sp-row-in_0.3s_ease-out] rounded-[22px] border border-white/12 bg-[rgba(20,10,12,0.97)] p-6 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)]"
      >
        <h2
          id="save-profile-title"
          className="font-display text-[26px] leading-tight"
        >
          Save your Hunt Profile
        </h2>
        <p className="mt-2 text-[14px] text-ink-2">
          Your new profile is used for every scan from now on. What should
          happen to what you already have?
        </p>

        <div className="mt-5 flex flex-col gap-2.5">
          {options.map((o) => {
            const Icon = o.icon;
            const active = mode === o.mode;
            return (
              <button
                key={o.mode}
                type="button"
                disabled={o.disabled || saving}
                onClick={() => {
                  setMode(o.mode);
                  setConfirmFresh(false);
                }}
                className={cn(
                  "flex gap-3.5 rounded-2xl border p-4 text-left transition-colors disabled:opacity-40",
                  active
                    ? o.danger
                      ? "border-r1/60 bg-r1/10"
                      : "border-white/30 bg-white/5"
                    : "border-white/8 hover:border-white/18",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-8 flex-none place-items-center rounded-lg",
                    o.danger ? "bg-r1/15 text-r1" : "bg-white/6 text-ink-2",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span>
                  <span
                    className={cn(
                      "block text-[14.5px] font-medium",
                      o.danger && "text-[#ff6b78]",
                    )}
                  >
                    {o.title}
                  </span>
                  <span className="mt-1 block text-[13px] leading-relaxed text-ink-3">
                    {o.body}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {confirmFresh && (
          <p className="mt-4 rounded-xl border border-r1/40 bg-r1/8 px-4 py-3 text-[13px] text-[#ff8a95]">
            This can&apos;t be undone. Press “Delete and save” to confirm.
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <GhostButton
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="h-10 px-4"
          >
            Cancel
          </GhostButton>
          <Button
            type="button"
            variant="primary"
            onClick={submit}
            disabled={saving}
            className="h-10"
          >
            {saving
              ? "Saving…"
              : mode === "fresh"
                ? confirmFresh
                  ? "Delete and save"
                  : "Start fresh"
                : mode === "rescore"
                  ? "Save and re-score"
                  : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
