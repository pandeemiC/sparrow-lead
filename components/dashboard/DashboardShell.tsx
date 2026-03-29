"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Bell, Search, Target } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] overflow-hidden">
      <header className="flex items-center h-16 shrink-0 border-b border-white/5 bg-[#0a0a0a]">
        <motion.div
          className="flex items-center gap-3 px-4 h-full border-r border-white/5 shrink-0 overflow-hidden"
          transition={{ duration: 0.2, ease: "easeInOut" }}
          animate={{ width: isOpen ? 240 : 64 }}
        >
          {user.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt={user.name}
              width={32}
              height={32}
              className="rounded-full shrink-0 ring-1 ring-white/10"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-sparrow-red/30 flex items-center justify-center shrink-0 text-white text-xs font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden min-w-0"
            >
              <p className="text-sm font-semibold text-white whitespace-nowrap truncate leading-tight">
                {user.name}
              </p>
              <p className="text-xs text-white/40 whitespace-nowrap truncate leading-tight mt-0.5">
                {user.email}
              </p>
            </motion.div>
          )}
        </motion.div>

        <div className="flex-1 flex items-center justify-end gap-2 px-6">
          <button className="p-2 text-white/30 hover:text-white/70 transition-colors rounded-lg hover:bg-white/5">
            <Search size={18} />
          </button>
          <button className="relative p-2 text-white/30 hover:text-white/70 transition-colors rounded-lg hover:bg-white/5">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-sparrow-red rounded-full" />
          </button>
          <Link
            href="/dashboard/hunt"
            className="flex items-center gap-2 px-4 py-1.5 bg-sparrow-red hover:bg-sparrow-bright text-white text-sm font-semibold rounded-lg transition-colors ml-1"
          >
            <Target size={14} /> Hunt
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        <main className="flex-1 bg-[#111111] rounded-tr2xl rounded-br-2xl overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
