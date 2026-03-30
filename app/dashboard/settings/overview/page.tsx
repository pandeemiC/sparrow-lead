"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Shield } from "lucide-react";

export default function SettingsOverview() {
  const { user } = useUser();

  const isOAuthUser = (user?.externalAccounts ?? []).length > 0;
  const provider = user?.externalAccounts?.[0]?.provider;

  const name = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ""}`.trim()
    : (user?.emailAddresses[0]?.emailAddress ?? "User");
  const email = user?.emailAddresses[0]?.emailAddress ?? "";

  if (!user) return null;

  const editBtn =
    "text-sm px-4 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all shrink-0";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-4 items-start">
        <div className="col-span-4 flex flex-col gap-4">
          <div className="rounded-xl glass-red border border-white/5 p-6 glow-right">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-6">
              Profile
            </h2>
            <div className="flex items-center gap-5">
              {user.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt={name}
                  width={60}
                  height={60}
                  className="rounded-full ring-1 ring-white/10 shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-sparrow-red/30 flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 space-y-1">
                <p className="text-base font-semibold text-white truncate">
                  {name}
                </p>
                <p className="text-sm text-white/40 truncate">{email}</p>
                {isOAuthUser && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <Shield size={12} className="text-white/25 shrink-0" />
                    <span className="text-xs text-white/25 capitalize">
                      Signed in with {provider}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl glass-red border border-white/5 p-6 glow-t-right">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-6">
              Account
            </h2>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-white">Display Name</p>
                  <p className="text-sm text-white/35">{name}</p>
                </div>
                <button className={editBtn}>Edit</button>
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-white">Email</p>
                  <p className="text-sm text-white/35 truncate max-w-35">
                    {email}
                  </p>
                </div>
                {!isOAuthUser && <button className={editBtn}>Change</button>}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-2 rounded-xl glass-red glow-t-left border border-white/5 p-6 flex flex-col gap-6 h-full">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
            Plan
          </h2>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <p className="text-base font-semibold text-white">Free</p>
              <p className="text-sm text-white/35">
                5 keywords · 100 signals/mo
              </p>
            </div>
            <button className={editBtn}>Upgrade</button>
          </div>
          <div className="flex gap-4 pt-10 justify-center">
            <div className="flex-1 flex flex-col items-center gap-3">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="2.5"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="rgba(175,4,4,0.5)"
                    strokeWidth="2.5"
                    strokeDasharray="0 94"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white">
                  0%
                </span>
              </div>
              <p className="text-sm text-white/40 text-center">Keywords</p>
              <p className="text-xs text-white/25">0 / 5</p>
            </div>

            <div className="flex-1 flex flex-col items-center gap-3">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="2.5"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="rgba(175,4,4,0.5)"
                    strokeWidth="2.5"
                    strokeDasharray="0 94"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white">
                  0%
                </span>
              </div>
              <p className="text-sm text-white/40 text-center">Signals</p>
              <p className="text-xs text-white/25">0 / 100</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl glass-red border border-white/5 p-6">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-6">
          Password
        </h2>
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-white">Change Password</p>
            <p className="text-sm text-white/35">••••••••••••</p>
          </div>
          {!isOAuthUser && <button className={editBtn}>Change</button>}
        </div>
      </div>
    </div>
  );
}
