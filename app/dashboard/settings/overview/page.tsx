"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Shield } from "lucide-react";
import { useState } from "react";
import { SiGoogle, SiGithub } from "react-icons/si";

const themes = [
  { label: "Light", value: "light" },
  { label: "Auto", value: "auto" },
  { label: "Dark", value: "dark" },
];

const providers = [
  { key: "google", label: "Google", icon: SiGoogle },
  { key: "github", label: "GitHub", icon: SiGithub },
];

export default function SettingsOverview() {
  const { user } = useUser();
  const [theme, setTheme] = useState("dark");

  const isOAuthUser = (user?.externalAccounts ?? []).length > 0;
  const provider = user?.externalAccounts?.[0]?.provider;

  const name = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ""}`.trim()
    : (user?.emailAddresses[0]?.emailAddress ?? "User");
  const email = user?.emailAddresses[0]?.emailAddress ?? "";

  const connectedProviders = (user?.externalAccounts ?? []).map((a) =>
    a.provider.toLowerCase()
  );

  if (!user) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-4 items-stretch">
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
                <p className="text-base font-semibold text-white truncate">{name}</p>
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

          <div className="rounded-xl glass-red border border-white/5 p-6 glow-t-right flex-1">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-6">
              Appearance
            </h2>
            <div className="flex gap-3">
              {themes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-all ${
                    theme === t.value
                      ? "border-white/20 text-white bg-white/5"
                      : "border-white/5 text-white/35 hover:border-white/10 hover:text-white/50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-2 rounded-xl glass-red glow-t-left border border-white/5 p-6 flex flex-col gap-6">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
            Plan
          </h2>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <p className="text-base font-semibold text-white">Free</p>
              <p className="text-sm text-white/35">5 keywords · 100 signals/mo</p>
            </div>
            <button className="edit-btn">Upgrade</button>
          </div>
          <div className="flex gap-4 justify-center flex-1 items-center">
            <div className="flex-1 flex flex-col items-center gap-3">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(175,4,4,0.5)" strokeWidth="2.5" strokeDasharray="0 94" strokeLinecap="round" />
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
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(175,4,4,0.5)" strokeWidth="2.5" strokeDasharray="0 94" strokeLinecap="round" />
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
          Connected Accounts
        </h2>
        <div className="space-y-5">
          {providers.map(({ key, label, icon: Icon }, i) => {
            const connected = connectedProviders.includes(key);
            return (
              <div key={key}>
                {i > 0 && <div className="h-px bg-white/5 mb-5" />}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon size={18} className="text-white/40 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-white">{label}</p>
                      <p className="text-xs text-white/35">
                        {connected ? `Connected via ${label}` : "Not connected"}
                      </p>
                    </div>
                  </div>
                  <button className="edit-btn">
                    {connected ? "Disconnect" : "Connect"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
