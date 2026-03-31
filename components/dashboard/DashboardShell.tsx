"use client";

import Link from "next/link";
import { Bell, Search, Target } from "lucide-react";
import Image from "next/image";
import Sidebar from "./Sidebar";

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
  return (
    <div className="flex h-screen bg-[#1a1a1a] overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center h-16 shrink-0 px-6 gap-4">
          {user.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt={user.name}
              width={34}
              height={34}
              className="rounded-full shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-sparrow-red/30 flex items-center justify-center shrink-0 text-white text-xs font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <p className="text-sm font-semibold text-white leading-tight truncate">
              {user.name}
            </p>
            <p className="text-xs text-white/35 leading-tight truncate mt-0.5">
              {user.email}
            </p>
          </div>

          <div className="w-px h-6 bg-white/10 mx-2" />

          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1.5 px-4 py-2 rounded-md glass-red border border-white/5 min-w-28">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">
                  Signals
                </p>
                <span className="text-[10px] text-white/25">0 / 100</span>
              </div>
              <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[rgba(175,4,4,0.6)]"
                  style={{ width: "0%" }}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5 px-4 py-2 rounded-md glass-red border border-white/5 min-w-28">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">
                  Keywords
                </p>
                <span className="text-[10px] text-white/25">0 / 5</span>
              </div>
              <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[rgba(175,4,4,0.6)]"
                  style={{ width: "0%" }}
                />
              </div>
            </div>
          </div>

          <div className="flex-1" />

          <button className="p-2 text-white/30 hover:text-white/70 transition-colors rounded-lg hover:bg-white/5 cursor-pointer">
            <Search size={17} />
          </button>
          <button className="relative p-2 text-white/30 hover:text-white/70 transition-colors rounded-lg hover:bg-white/5 cursor-pointer">
            <Bell size={17} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-sparrow-red rounded-full" />
          </button>
          <Link
            href="/dashboard/hunt"
            className="flex items-center gap-2 px-4 py-2.5   bg-sparrow-red hover:bg-sparrow-bright text-white text-md font-semibold rounded-lg transition-colors"
          >
            <Target size={15} />
            Hunt
          </Link>
        </header>

        <main className="flex-1 bg-sparrow-base rounded-tl-2xl overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
