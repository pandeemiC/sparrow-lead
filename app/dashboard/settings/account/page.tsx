"use client";

import { useState, useRef, useEffect } from "react";
import { useUser, useClerk, useSession } from "@clerk/nextjs";
import { MoreHorizontal } from "lucide-react";
import { usePlan } from "@/components/dashboard/PlanContext";
import { useToastStore } from "@/store/toastStore";
import { apiFetch } from "@/lib/apiFetch";
import type { AccountSession } from "@/types";
import { SettingsCard } from "@/components/ui/SettingsUI";
import { GhostButton, SectionTitle } from "@/components/sp/ui";

function SessionMenu({ onTerminate }: { onTerminate: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-md text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-10 bg-[#111111] border border-white/8 rounded-md overflow-hidden shadow-2xl">
          <button
            onClick={() => {
              onTerminate();
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors whitespace-nowrap"
          >
            Terminate session
          </button>
        </div>
      )}
    </div>
  );
}

export default function SettingsAccount() {
  const { user } = useUser();
  const { session: currentSession } = useSession();
  const { signOut } = useClerk();
  const { plan } = usePlan();
  const toast = useToastStore((s) => s.show);
  const [sessions, setSessions] = useState<AccountSession[]>([]);

  const [editingName, setEditingName] = useState(false);
  const [draftFirst, setDraftFirst] = useState("");
  const [draftLast, setDraftLast] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const clerkUser = user;

    async function loadSessions() {
      try {
        const clerkSessions = await clerkUser.getSessions();
        setSessions(
          clerkSessions.map((cs) => {
            const activity = cs.latestActivity;
            const browser = activity?.browserName ?? "Unknown browser";
            const device =
              activity?.deviceType ??
              (activity?.isMobile ? "Mobile" : "Desktop");
            const location =
              [activity?.city, activity?.country].filter(Boolean).join(", ") ||
              "Unknown";
            return {
              id: cs.id,
              device: `${browser} on ${device}`,
              location,
              lastActive: cs.lastActiveAt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              isCurrent: cs.id === currentSession?.id,
              revoke: () => cs.revoke(),
            };
          }),
        );
      } catch {
        toast("Couldn't load your active sessions");
      }
    }
    loadSessions();
  }, [user, currentSession?.id, toast]);

  if (!user) return null;

  const name = user.firstName
    ? `${user.firstName} ${user.lastName ?? ""}`.trim()
    : (user.emailAddresses[0]?.emailAddress ?? "User");
  const email = user.emailAddresses[0]?.emailAddress ?? "";
  const isOAuthUser = (user.externalAccounts ?? []).length > 0;
  const isPaidPlan = plan !== "free";

  async function terminateSession(session: AccountSession) {
    try {
      await session.revoke();
      setSessions((prev) => prev.filter((s) => s.id !== session.id));
      toast("Session signed out", "success");
    } catch {
      toast("Couldn't sign out that session");
    }
  }

  async function logOutEverywhere() {
    try {
      for (const session of sessions) {
        if (!session.isCurrent) await session.revoke();
      }
    } catch {
      toast("Couldn't sign out every device. Signing out here.");
    }
    await signOut({ redirectUrl: "/sign-in" });
  }

  // first click asks, second click deletes the data and the clerk user
  async function deleteAccount() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await apiFetch("/api/account", { method: "DELETE" });
      // the session is gone with the user, a full load clears clerk's state
      window.location.href = "/";
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Couldn't delete your account",
      );
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  function editName() {
    if (!user) return;
    setDraftFirst(user.firstName ?? "");
    setDraftLast(user.lastName ?? "");
    setEditingName(true);
  }

  async function saveDisplayName() {
    if (!user) return;
    setSaving(true);
    try {
      await user.update({
        firstName: draftFirst,
        lastName: draftLast || undefined,
      });
      setEditingName(false);
    } catch {
      toast("Couldn't update your name");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <SettingsCard>
        <SectionTitle>Account</SectionTitle>
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1.5">
              <p className="text-sm font-medium text-white">Display Name</p>

              {editingName ? (
                <div className="flex gap-2 pt-0.5">
                  <input
                    value={draftFirst}
                    onChange={(e) => setDraftFirst(e.target.value)}
                    placeholder="First name"
                    className="bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/20 w-32"
                  />
                  <input
                    value={draftLast}
                    onChange={(e) => setDraftLast(e.target.value)}
                    placeholder="Last name"
                    className="bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/20 w-32"
                  />
                </div>
              ) : (
                <p className="text-sm text-white/35">{name}</p>
              )}
            </div>

            {editingName ? (
              <div className="flex gap-2 shrink-0">
                <GhostButton onClick={() => setEditingName(false)}>
                  Cancel
                </GhostButton>
                <GhostButton onClick={saveDisplayName} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </GhostButton>
              </div>
            ) : (
              <GhostButton onClick={editName} className="shrink-0">
                Edit
              </GhostButton>
            )}
          </div>
          <div className="h-px bg-white/5" />
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-white">Email</p>
              <p className="text-sm text-white/35 truncate max-w-xs">{email}</p>
            </div>
            {!isOAuthUser && <GhostButton>Change</GhostButton>}
          </div>
        </div>
      </SettingsCard>

      <SettingsCard>
        <SectionTitle>Password</SectionTitle>
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-white">Change Password</p>
            <p className="text-sm text-white/35">••••••••••••</p>
          </div>
          {!isOAuthUser && <GhostButton>Change</GhostButton>}
        </div>
      </SettingsCard>

      <SettingsCard>
        <SectionTitle>Sessions</SectionTitle>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-white">
              Log out of all devices
            </p>
            <p className="text-sm text-white/35">
              Revokes all active sessions across every device
            </p>
          </div>
          <GhostButton onClick={logOutEverywhere}>Log Out All</GhostButton>
        </div>
      </SettingsCard>

      <SettingsCard>
        <SectionTitle>Danger Zone</SectionTitle>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-white">
              Delete your account
            </p>
            {isPaidPlan ? (
              <p className="text-sm text-white/35">
                To delete your account, please cancel your{" "}
                <span className="capitalize">{plan}</span> subscription first.
              </p>
            ) : confirmDelete ? (
              <p className="text-sm text-red-400">
                This deletes your keywords, signals and Hunt Board for good.
                Click again to confirm.
              </p>
            ) : (
              <p className="text-sm text-white/35">
                Permanently deletes your account and all data. This cannot be
                undone.
              </p>
            )}
          </div>
          <button
            disabled={isPaidPlan || deleting}
            onClick={deleteAccount}
            className="text-sm cursor-pointer px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all shrink-0 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            {deleting
              ? "Deleting…"
              : confirmDelete
                ? "Yes, delete everything"
                : "Delete Account"}
          </button>
        </div>
      </SettingsCard>

      <SettingsCard>
        <SectionTitle>Active Sessions</SectionTitle>
        <div className="space-y-1">
          <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 px-3 py-2">
            <span className="text-xs text-white/25 uppercase tracking-wider">
              Device
            </span>
            <span className="text-xs text-white/25 uppercase tracking-wider">
              Location
            </span>
            <span className="text-xs text-white/25 uppercase tracking-wider">
              Last Active
            </span>
            <span />
          </div>
          <div className="h-px bg-white/5" />
          {sessions.map((s) => (
            <div
              key={s.id}
              className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 px-3 py-3 items-center hover:bg-white/3 rounded-lg transition-colors"
            >
              <span className="text-sm text-white/70">{s.device}</span>
              <span className="text-sm text-white/50">{s.location}</span>
              <span className="text-sm text-white/50">{s.lastActive}</span>
              {s.isCurrent ? (
                <span className="text-xs text-white/40 px-1.5">
                  This device
                </span>
              ) : (
                <SessionMenu onTerminate={() => terminateSession(s)} />
              )}
            </div>
          ))}
        </div>
      </SettingsCard>
    </div>
  );
}
