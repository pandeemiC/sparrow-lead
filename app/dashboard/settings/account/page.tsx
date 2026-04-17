"use client";

import { useState, useRef, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { MoreHorizontal } from "lucide-react";

const currentPlan = "free";

const mockSessions = [
  {
    id: "1",
    device: "Chrome on macOS",
    location: "Istanbul, TR",
    created: "Mar 28, 2026",
  },
  {
    id: "2",
    device: "Safari on iPhone",
    location: "Istanbul, TR",
    created: "Mar 30, 2026",
  },
];

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
  const { signOut } = useClerk();
  const [sessions, setSessions] = useState(mockSessions);

  if (!user) return null;

  const name = user.firstName
    ? `${user.firstName} ${user.lastName ?? ""}`.trim()
    : (user.emailAddresses[0]?.emailAddress ?? "User");
  const email = user.emailAddresses[0]?.emailAddress ?? "";
  const isOAuthUser = (user.externalAccounts ?? []).length > 0;
  const isPaidPlan = currentPlan !== "free";

  function terminateSession(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl glass-red border border-white/5 p-6 glow-right">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-6">
          Account
        </h2>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-white">Display Name</p>
              <p className="text-sm text-white/35">{name}</p>
            </div>
            <button className="edit-btn">Edit</button>
          </div>
          <div className="h-px bg-white/5" />
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-white">Email</p>
              <p className="text-sm text-white/35 truncate max-w-xs">{email}</p>
            </div>
            {!isOAuthUser && <button className="edit-btn">Change</button>}
          </div>
        </div>
      </div>

      <div className="rounded-xl glass-red border border-white/5 p-6 glow-t-right">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-6">
          Password
        </h2>
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-white">Change Password</p>
            <p className="text-sm text-white/35">••••••••••••</p>
          </div>
          {!isOAuthUser && <button className="edit-btn">Change</button>}
        </div>
      </div>

      <div className="rounded-xl glass-red border border-white/5 p-6">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-6">
          Sessions
        </h2>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-white">
              Log out of all devices
            </p>
            <p className="text-sm text-white/35">
              Revokes all active sessions across every device
            </p>
          </div>
          <button
            onClick={() => signOut({ redirectUrl: "/sign-in" })}
            className="edit-btn"
          >
            Log Out All
          </button>
        </div>
      </div>

      <div className="rounded-xl glass-red border border-white/10 p-6">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-6">
          Danger Zone
        </h2>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-white">
              Delete your account
            </p>
            {isPaidPlan ? (
              <p className="text-sm text-white/35">
                To delete your account, please cancel your{" "}
                <span className="capitalize">{currentPlan}</span> subscription
                first.
              </p>
            ) : (
              <p className="text-sm text-white/35">
                Permanently deletes your account and all data. This cannot be
                undone.
              </p>
            )}
          </div>
          <button
            disabled={isPaidPlan}
            onClick={() => user.delete()}
            className="text-sm px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all shrink-0 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            Delete Account
          </button>
        </div>
      </div>

      <div className="rounded-xl glass-red border border-white/5 p-6">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-6">
          Active Sessions
        </h2>
        <div className="space-y-1">
          <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 px-3 py-2">
            <span className="text-xs text-white/25 uppercase tracking-wider">
              Device
            </span>
            <span className="text-xs text-white/25 uppercase tracking-wider">
              Location
            </span>
            <span className="text-xs text-white/25 uppercase tracking-wider">
              Created
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
              <span className="text-sm text-white/50">{s.created}</span>
              <SessionMenu onTerminate={() => terminateSession(s.id)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
