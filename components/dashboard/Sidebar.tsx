"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Radio,
  Tag,
  Target,
  Settings,
  ChevronLeft,
} from "lucide-react";
import sparrowLogo from "@/public/sparrow-no-text-logo.png";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Signals", href: "/dashboard/signals", icon: Radio },
  { label: "Keywords", href: "/dashboard/keywords", icon: Tag },
  { label: "Hunt Board", href: "/dashboard/hunt", icon: Target },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  return (
    <motion.aside
      animate={{ width: isOpen ? 240 : 64 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex flex-col h-full bg-[#0d0d0d]/80 border-r border-white/5 shrink-0 overflow-hidden"
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5 shrink-0">
        <Image
          src={sparrowLogo}
          alt="Sparrow"
          width={28}
          height={28}
          style={{ width: "auto", height: "auto" }}
        />
        {isOpen && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-white font-black text-md whitespace-nowrap uppercase"
          >
            Sparrow
          </motion.span>
        )}
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${active ? "bg-white/8 text-white" : "text-white/40 hover:text-white hover:bg-white/5"}`}
            >
              <Icon size={18} className="shrink-0" />
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm font-medium whitespace-nowrap"
                >
                  {label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="py-4 px-2 border-t border-white/5 space-y-1">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Settings size={18} className="shrink-0" />
          {isOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-medium whitespace-nowrap"
            >
              Settings
            </motion.span>
          )}
        </Link>

        <button
          onClick={() => setIsOpen((o) => !o)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/20 hover:text-white hover:bg-white/5 transition-colors"
        >
          <motion.div
            animate={{ rotate: isOpen ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronLeft size={18} />
          </motion.div>
          {isOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm whitespace-nowrap"
            >
              Collapse
            </motion.span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
