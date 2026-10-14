"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { usePlan } from "@/components/dashboard/PlanContext";
import { SiGoogle, SiGithub } from "react-icons/si";
import { SettingsCard } from "@/components/ui/SettingsUI";
import { GhostButton, SectionTitle } from "@/components/sp/ui";

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
  const { plan, limits } = usePlan();
  const [used, setUsed] = useState({ keywords: 0, signals: 0 });

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.keywordsTracked !== undefined) {
          setUsed({
            keywords: data.keywordsTracked,
            signals: data.totalSignals,
          });
        }
      });
  }, []);

  const isOAuthUser = (user?.externalAccounts ?? []).length > 0;
  const provider = user?.externalAccounts?.[0]?.provider;

  const name = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ""}`.trim()
    : (user?.emailAddresses[0]?.emailAddress ?? "User");
  const email = user?.emailAddresses[0]?.emailAddress ?? "";

  const connectedProviders = (user?.externalAccounts ?? []).map((a) =>
    a.provider.toLowerCase(),
  );

  const C = 94;

  const kwPerc = Math.min((used.keywords / limits.keywords) * 100, 100);
  const sigPerc = Math.min((used.signals / limits.signals) * 100, 100);

  const kwFill = (kwPerc / 100) * C;
  const sigFill = (sigPerc / 100) * C;

  if (!user) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-4 items-stretch">
        <div className="col-span-4 flex flex-col gap-4">
          <SettingsCard>
            <SectionTitle>Profile</SectionTitle>
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
                <div className="w-14 h-14 rounded-full bg-white/8 flex items-center justify-center text-white text-xl font-medium shrink-0">
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
          </SettingsCard>

          <SettingsCard className="flex-1">
            <SectionTitle>Appearance</SectionTitle>
            {/* sparrow is dark only for now, so the picker just shows that */}
            <div className="flex gap-3">
              {themes.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  disabled
                  className={`flex-1 cursor-not-allowed rounded-lg border py-3 text-sm font-medium ${
                    t.value === "dark"
                      ? "border-white/15 text-white/70"
                      : "border-white/5 text-white/35"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </SettingsCard>
        </div>

        <SettingsCard className="col-span-2 flex flex-col gap-6">
          <SectionTitle className="mb-0">Plan</SectionTitle>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <p className="text-base font-semibold text-white">{plan}</p>
              <p className="text-sm text-white/35">
                {limits.keywords} keywords · {limits.signals} signals/mo
              </p>
            </div>
            <GhostButton>Upgrade</GhostButton>
          </div>
          <div className="flex gap-4 justify-center flex-1 items-center">
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
                    stroke="rgba(220, 38, 38, 0.8)"
                    strokeWidth="2.5"
                    strokeDasharray={`${kwFill} ${C - kwFill}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white">
                  {Math.round(kwPerc)}%
                </span>
              </div>
              <p className="text-sm text-white/40 text-center">Keywords</p>
              <p className="text-xs text-white/25">
                {used.keywords} / {limits.keywords}
              </p>
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
                    stroke="rgba(220, 38, 38, 0.8)"
                    strokeWidth="2.5"
                    strokeDasharray={`${sigFill} ${C - sigFill}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white">
                  {Math.round(sigPerc)}%
                </span>
              </div>
              <p className="text-sm text-white/40 text-center">Signals</p>
              <p className="text-xs text-white/25">
                {used.signals} / {limits.signals}
              </p>
            </div>
          </div>
        </SettingsCard>
      </div>

      <SettingsCard>
        <SectionTitle>Connected Accounts</SectionTitle>
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
                  <GhostButton>
                    {connected ? "Disconnect" : "Connect"}
                  </GhostButton>
                </div>
              </div>
            );
          })}
        </div>
      </SettingsCard>
    </div>
  );
}
