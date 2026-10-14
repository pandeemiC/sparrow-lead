"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, Label, Loading } from "@/components/sp/ui";
import { Select } from "@/components/ui/SettingsUI";
import SaveProfileDialog from "@/components/dashboard/SaveProfileDialog";
import { apiFetch } from "@/lib/apiFetch";
import {
  PROFILE_MAX_LENGTH,
  profileForReply,
  profileForScoring,
} from "@/lib/huntProfile";
import { ROLE_OPTIONS } from "@/lib/constants";
import { cn, timeAgo } from "@/lib/utils";
import { useStatsStore } from "@/store/statsStore";
import { useToastStore } from "@/store/toastStore";
import type {
  HuntProfile,
  HuntProfileCounts,
  HuntProfileSaveMode,
} from "@/types";

type ProfileResponse = {
  profile: HuntProfile;
  counts: HuntProfileCounts;
  rescoring?: number;
};

type TextField = Exclude<keyof HuntProfile, "role" | "updatedAt">;

type FieldSpec = {
  key: TextField;
  label: string;
  help: string;
  placeholder: string;
  rows: number;
};

const GROUPS: { title: string; fields: FieldSpec[] }[] = [
  {
    title: "About you",
    fields: [
      {
        key: "offer",
        label: "What you offer, or what you're after",
        help: "The product, service or skill you have, or the thing you're trying to find.",
        placeholder:
          "e.g. I build client portals for freelance designers, or: I'm looking for a remote frontend role",
        rows: 3,
      },
    ],
  },
  {
    title: "Who you're looking for",
    fields: [
      {
        key: "lookingFor",
        label: "Who should Sparrow find?",
        help: "Describe the person behind a perfect post.",
        placeholder:
          "e.g. Small agencies frustrated with their current tools and asking for alternatives",
        rows: 3,
      },
      {
        key: "signals",
        label: "Signs of a great post",
        help: "Posts that show these get scored higher.",
        placeholder:
          "e.g. mentions a budget, a deadline, or switching away from a tool",
        rows: 2,
      },
      {
        key: "ignore",
        label: "What to ignore",
        help: "Posts about these get scored low, so they sink in your inbox.",
        placeholder:
          "e.g. job ads, students asking for homework help, self-promotion",
        rows: 2,
      },
    ],
  },
  {
    title: "Your replies",
    fields: [
      {
        key: "replyTone",
        label: "How your replies should sound",
        help: "Used when Sparrow drafts a reply for you.",
        placeholder:
          "e.g. friendly and short, like a peer who has solved this before",
        rows: 2,
      },
    ],
  },
];

const textareaClass =
  "w-full resize-none rounded-xl border border-line-2 bg-black/30 px-3.5 py-3 text-[14px] leading-relaxed text-ink outline-0 transition-colors placeholder:text-ink-3 focus:border-r1/50";

const FIELDS: (keyof HuntProfile)[] = [
  "role",
  "offer",
  "lookingFor",
  "signals",
  "ignore",
  "replyTone",
];
const sameProfile = (a: HuntProfile, b: HuntProfile) =>
  FIELDS.every((k) => (a[k] ?? "").trim() === (b[k] ?? "").trim());

export default function HuntProfilePage() {
  const toast = useToastStore((s) => s.show);
  const refreshStats = useStatsStore((s) => s.refresh);
  const [saved, setSaved] = useState<HuntProfile | null>(null);
  const [draft, setDraft] = useState<HuntProfile | null>(null);
  const [counts, setCounts] = useState<HuntProfileCounts | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch<ProfileResponse>("/api/hunt-profile");
        setSaved(data.profile);
        setDraft(data.profile);
        setCounts(data.counts);
      } catch (err) {
        toast(
          err instanceof Error ? err.message : "Couldn't load your profile",
        );
      }
    }
    load();
  }, [toast]);

  const closeDialog = useCallback(() => setDialogOpen(false), []);

  async function save(mode: HuntProfileSaveMode) {
    if (!draft) return;
    setSaving(true);
    try {
      const data = await apiFetch<ProfileResponse>("/api/hunt-profile", {
        method: "PUT",
        body: JSON.stringify({ profile: draft, mode }),
      });
      // the server's copy replaces what we had
      setSaved(data.profile);
      setDraft(data.profile);
      setCounts(data.counts);
      setDialogOpen(false);
      if (mode === "rescore") {
        toast(
          `Saved. Re-scoring ${data.rescoring} signals in the background`,
          "success",
        );
      } else if (mode === "fresh") {
        toast("Saved. Started fresh, add keywords to begin", "success");
      } else {
        toast("Hunt Profile saved", "success");
      }
      refreshStats();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't save your profile");
    } finally {
      setSaving(false);
    }
  }

  if (!draft || !saved || !counts) {
    return <Loading>LOADING YOUR HUNT PROFILE…</Loading>;
  }

  const dirty = !sameProfile(draft, saved);
  const set = (key: keyof HuntProfile, value: string) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  const scoring = profileForScoring(draft);
  const reply = profileForReply(draft);

  return (
    <div className="pb-28">
      <div className="max-w-[46rem]">
        <h1 className="font-display text-[clamp(30px,3vw,40px)] leading-tight">
          Hunt Profile
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
          Tell Sparrow what you&apos;re after. It reads this before scoring
          every post and drafting every reply, so the more specific you are, the
          better your signals get.
        </p>
      </div>

      <div className="mt-8 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-5">
          <Card className="flex flex-col gap-5 p-6">
            <Label>About you</Label>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[14.5px] font-medium">Your role</p>
                <p className="text-[13px] text-ink-3">
                  What best describes you
                </p>
              </div>
              <Select
                value={draft.role}
                options={ROLE_OPTIONS}
                onChange={(v) => set("role", v)}
              />
            </div>
            {GROUPS[0].fields.map((f) => (
              <Field key={f.key} spec={f} value={draft[f.key]} onChange={set} />
            ))}
          </Card>

          {GROUPS.slice(1).map((g) => (
            <Card key={g.title} className="flex flex-col gap-5 p-6">
              <Label>{g.title}</Label>
              {g.fields.map((f) => (
                <Field
                  key={f.key}
                  spec={f}
                  value={draft[f.key]}
                  onChange={set}
                />
              ))}
            </Card>
          ))}
        </div>

        {/* exactly what the AI receives, updated live as you type */}
        <Card className="flex flex-col gap-5 p-6 xl:sticky xl:top-0">
          <div>
            <Label>What the AI reads</Label>
            <p className="mt-2 text-[13px] text-ink-3">
              This is the exact context sent with every post.
            </p>
          </div>
          <Preview title="When scoring posts" text={scoring} />
          <Preview title="When drafting replies" text={reply} />
        </Card>
      </div>

      {/* floating save pill, works with the sidebar open or collapsed */}
      <div className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/12 bg-[rgba(20,10,12,0.88)] py-2 pr-2 pl-5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <span
          className={cn(
            "text-[13px] whitespace-nowrap",
            dirty ? "text-amber" : "text-ink-3",
          )}
        >
          {dirty
            ? "Unsaved changes"
            : saved.updatedAt
              ? `Saved ${timeAgo(saved.updatedAt)}`
              : "Not saved yet"}
        </span>
        <button
          type="button"
          disabled={!dirty}
          onClick={() => setDraft(saved)}
          className="rounded-full border border-line-2 px-4 py-2 text-[13px] text-ink-2 transition-colors hover:text-ink disabled:opacity-35"
        >
          Discard
        </button>
        <button
          type="button"
          disabled={!dirty}
          onClick={() => setDialogOpen(true)}
          className="rounded-full bg-linear-to-b from-r1 to-r2 px-5 py-2 text-[13px] font-medium text-white shadow-[0_8px_24px_-10px_rgba(255,36,56,0.7)] disabled:opacity-35"
        >
          Save
        </button>
      </div>

      {dialogOpen && (
        <SaveProfileDialog
          counts={counts}
          saving={saving}
          onCancel={closeDialog}
          onConfirm={save}
        />
      )}
    </div>
  );
}

function Field({
  spec,
  value,
  onChange,
}: {
  spec: FieldSpec;
  value: string;
  onChange: (key: keyof HuntProfile, value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span>
        <span className="block text-[14.5px] font-medium">{spec.label}</span>
        <span className="block text-[13px] text-ink-3">{spec.help}</span>
      </span>
      <textarea
        value={value}
        rows={spec.rows}
        maxLength={PROFILE_MAX_LENGTH}
        placeholder={spec.placeholder}
        onChange={(e) => onChange(spec.key, e.target.value)}
        className={textareaClass}
      />
    </label>
  );
}

function Preview({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="mb-2 text-[13px] font-medium text-ink-2">{title}</p>
      <pre className="min-h-16 rounded-xl border border-white/8 bg-black/40 px-3.5 py-3 font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap text-ink-2">
        {text || "Nothing yet. Fill in the fields to steer the AI."}
      </pre>
    </div>
  );
}
