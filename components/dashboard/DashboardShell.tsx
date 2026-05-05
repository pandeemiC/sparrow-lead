"use client";

import Link from "next/link";
import { Bell, Search, Target } from "lucide-react";
import Image from "next/image";
import Sidebar from "./Sidebar";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

type UserData = {
  name: string;
  email: string;
  imageUrl: string;
};

export default function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: UserData;
}) {
  const { user: clerkUser } = useUser();

  const [stats, setStats] = useState({ keywordsTracked: 0, totalSignals: 0 });

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.keywordsTracked !== undefined) {
          setStats({
            keywordsTracked: data.keywordsTracked,
            totalSignals: data.totalSignals,
          });
        }
      });
  }, []);

  const displayName = clerkUser?.firstName
    ? `${clerkUser.firstName} ${clerkUser.lastName ?? ""}`.trim()
    : (clerkUser?.emailAddresses[0]?.emailAddress ?? user.name);

  const keyPercent = Math.min((stats.keywordsTracked / 5) * 100, 100);
  const sigPercent = Math.min((stats.totalSignals / 100) * 100, 100);
  return (
    <div className="flex h-screen bg-[#080204] overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center h-14 shrink-0 px-6 gap-4 border-b border-white/6">
          {user.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt={user.name}
              width={28}
              height={28}
              className="rounded-full shrink-0 ring-1 ring-white/10"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-white text-xs font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <p className="text-sm font-medium text-white leading-tight truncate">
              {displayName}
            </p>
            <p className="text-[11px] text-white/30 leading-tight truncate">
              {user.email}
            </p>
          </div>

          <div className="w-px h-5 bg-white/6 mx-1" />

          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1.5 px-3 py-1.5 rounded-md border border-white/6 bg-white/2 min-w-28">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-medium text-white/30 uppercase tracking-widest">
                  Signals
                </p>
                <span className="text-[10px] text-white/20 tabular-nums">
                  {stats.totalSignals} / 100
                </span>
              </div>
              <div className="h-px rounded-full bg-white/6 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white/20"
                  style={{ width: `${sigPercent}` }}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5 px-3 py-1.5 rounded-md border border-white/6 bg-white/2 min-w-28">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-medium text-white/30 uppercase tracking-widest">
                  Keywords
                </p>
                <span className="text-[10px] text-white/20 tabular-nums">
                  {stats.keywordsTracked} / 5
                </span>
              </div>
              <div className="h-px rounded-full bg-white/6 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white/20"
                  style={{ width: `${keyPercent}` }}
                />
              </div>
            </div>
          </div>

          <div className="flex-1" />

          <button className="p-1.5 text-white/25 hover:text-white/60 transition-colors rounded-md hover:bg-white/4 cursor-pointer">
            <Search size={16} />
          </button>
          <button className="relative p-1.5 text-white/25 hover:text-white/60 transition-colors rounded-md hover:bg-white/4 cursor-pointer">
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-1 h-1 bg-white/60 rounded-full" />
          </button>
          <Link
            href="/dashboard/hunt-board"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-white/10 bg-white/4 text-white text-sm font-medium hover:bg-white/7 hover:border-white/16 transition-all"
          >
            <Target size={13} />
            Hunt
          </Link>
        </header>

        <main
          className="flex-1 overflow-y-auto"
          style={{ background: "#080204" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
