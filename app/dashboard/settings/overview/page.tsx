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

  return (
    <div className="space-y-4">
      <div className="rounded-xl glass-red border border-white/5 p-6 glow-b-right">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-5">
          Profile
        </h2>
        <div className="flex items-center gap-5">
          {user?.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt={name}
              width={56}
              height={56}
              className="rounded-full ring-1 ring-wihte/10"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-sparrow-red/30 flex items-center justify-center text-white text-xl font-bold">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-base font-semibold text-white">{name}</p>
            <p className="text-sm text-white/40 mt-0.5">{email}</p>
            {isOAuthUser && (
              <div className="flex items-center gap-1.5 mt-2">
                <Shield size={12} className="text-white/25" />
                <span className="text-xs text-white/25 capitalize">
                  Signed in with {provider}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl glass-red border border-white/5 p-6 glow-t-right">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-5">
          Account
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-white">Display Name</p>
              <p className="text-xs text-white/35 mt-0.5">{name}</p>
            </div>
            <button className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all">
              Edit
            </button>
          </div>

          <div className="h-px bg-white/5" />

          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-white">Email</p>
              <p className="text-xs text-white/35 mt-0.5">{email}</p>
            </div>
            {!isOAuthUser && (
              <button className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all">
                Change
              </button>
            )}
          </div>

          {!isOAuthUser && (
            <>
              <div className="h-px bg-white/5" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Password</p>
                  <p className="text-xs text-white/35 mt-0.5">
                    Last changed never
                  </p>
                </div>
                <button className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-all">
                  Change
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div></div>
    </div>
  );
}
