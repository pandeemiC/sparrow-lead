"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SiDiscord, SiGithub, SiInstagram } from "react-icons/si";
import { Settings, ChevronRight } from "lucide-react";
import sparrowLogo from "@/public/sparrow-no-text-logo.png";
import { navItems, settingsItems } from "@/lib/constants";

export default function Sidebar() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const pathname = usePathname();

  const activeClass = "nav-active";
  const inactiveClass = "text-white/40 hover:text-white hover:bg-white/5";
  const isSettingsActive = pathname.startsWith("/dashboard/settings");

  return (
    <aside className="w-50 flex flex-col h-full bg-neutral-800/10 shrink-0">
      <div className="flex items-center gap-1 px-4 h-16 shrink-0">
        <Image
          src={sparrowLogo}
          alt="Sparrow"
          width={45}
          height={45}
          style={{ width: "auto", height: "auto" }}
        />
        <span className="text-white font-semibold text-lg uppercase tracking-widest flex-1 whitespace-nowrap">
          Sparrow
        </span>
      </div>

      <nav className="flex-1 py-5 space-y-3 px-2 overflow-hidden">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 pl-5 pr-5 py-4 rounded-lg transition-all ${active ? activeClass : inactiveClass}`}
            >
              <Icon
                size={18}
                className={`shrink-0 ${active ? "text-sparrow-red" : ""}`}
              />
              <span className="text-sm font-medium whitespace-nowrap">
                {label}
              </span>
            </Link>
          );
        })}

        <button
          onClick={() => setSettingsOpen((o) => !o)}
          className={`w-full flex items-center gap-3 pl-5 pr-3 py-4 rounded-lg transition-all ${isSettingsActive ? activeClass : inactiveClass}`}
        >
          <Settings
            size={18}
            className={`shrink-0 ${isSettingsActive ? "text-sparrow-red" : ""}`}
          />
          <span className="text-sm font-medium whitespace-nowrap flex-1 text-left">
            Settings
          </span>
          <motion.div
            animate={{ rotate: settingsOpen ? 90 : 0 }}
            transition={{ duration: 0.15 }}
          >
            <ChevronRight size={14} className="shrink-0 opacity-40" />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {settingsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="ml-4 pl-3 border-l border-white/8 space-y-1 py-1">
                {settingsItems.map(({ label, href, icon: Icon }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${active ? activeClass : inactiveClass}`}
                    >
                      <Icon
                        size={15}
                        className={`shrink-0 ${active ? "text-sparrow-red" : ""}`}
                      />
                      <span className="text-xs font-medium whitespace-nowrap">
                        {label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className="py-6 px-2 flex items-center justify-center gap-5 text-white/40">
        <a href="#" className="hover:text-white transition-colors">
          <SiDiscord size={18} />
        </a>
        <a href="#" className="hover:text-white transition-colors">
          <SiInstagram size={18} />
        </a>
        <a href="#" className="hover:text-white transition-colors">
          <SiGithub size={18} />
        </a>
      </div>
    </aside>
  );
}
