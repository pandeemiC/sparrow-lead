"use client";

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

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <motion.aside
      animate={{ width: isOpen ? 240 : 64 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex flex-col h-full bg-[#0d0d0d] border-r border-white/5 shrink-0 overflow-hidden"
    >
      {/* Logo */}
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
            className="text-white font-black text-md whitespace-nowrap uppercase"
          >
            Sparrow
          </motion.span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all border ${
                active
                  ? "bg-sparrow-red/10 text-white border-sparrow-red/25 shadow-[0_0_14px_rgba(204,0,0,0.28),inset_0_0_8px_rgba(204,0,0,0.08)]"
                  : "text-white/40 hover:text-white hover:bg-white/5 border-transparent"
              }`}
            >
              <Icon
                size={18}
                className={`shrink-0 ${active ? "text-sparrow-red" : ""}`}
              />
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

      {/* Bottom */}
      <div className="py-4 px-2 border-t border-white/5 space-y-1">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 border border-transparent transition-all"
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
          onClick={() => setIsOpen(!isOpen)}
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
