"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { SiDiscord, SiGithub, SiInstagram } from "react-icons/si";
import { Settings, ChevronLeft } from "lucide-react";
import sparrowLogo from "@/public/sparrow-no-text-logo.png";
import { navItems } from "@/lib/constants";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const activeClass = "nav-active";
  const inactiveClass = "text-white/40 hover:text-white hover:bg-white/5";
  const isSettingsActive = pathname.startsWith("/dashboard/settings");

  return (
    <div className="relative flex shrink-0 h-full">
      <aside
        className={`flex flex-col h-full bg-[#1a1a1a] overflow-hidden transition-all duration-300 ${
          collapsed ? "w-16" : "w-50"
        }`}
      >
        <Link href="/dashboard">
          <div className="flex items-center gap-1 px-4 h-16 shrink-0">
            <Image
              src={sparrowLogo}
              alt="Sparrow"
              width={45}
              height={45}
              style={{ width: "auto", height: "auto" }}
            />
            {!collapsed && (
              <span className="text-white font-semibold text-lg uppercase tracking-widest flex-1 whitespace-nowrap">
                Sparrow
              </span>
            )}
          </div>
        </Link>

        <nav className="flex-1 py-5 space-y-3 px-2">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center py-4 rounded-lg transition-all ${
                  collapsed ? "justify-center px-2" : "gap-3 pl-3 pr-5"
                } ${active ? activeClass : inactiveClass}`}
                title={label}
              >
                <Icon
                  size={20}
                  className={`shrink-0 ${active ? "text-sparrow-red" : ""}`}
                />
                {!collapsed && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-2 pb-3">
          <Link
            href="/dashboard/settings/overview"
            className={`flex items-center py-4 rounded-lg transition-all ${
              collapsed ? "justify-center px-2" : "gap-3 pl-3 pr-5"
            } ${isSettingsActive ? activeClass : inactiveClass}`}
            title="Settings"
          >
            <Settings
              size={20}
              className={`shrink-0 ${isSettingsActive ? "text-sparrow-red" : ""}`}
            />
            {!collapsed && (
              <span className="text-sm font-medium whitespace-nowrap">
                Settings
              </span>
            )}
          </Link>
        </div>

        <div className={`py-6 px-2 flex items-center justify-center gap-5 text-white/40 ${collapsed ? "invisible" : ""}`}>
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

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="group relative w-4 h-full flex items-center justify-center bg-[#1a1a1a] cursor-pointer"
      >
        <div className="absolute inset-y-0 left-1.5 w-px bg-white/8 group-hover:bg-white/20 transition-colors" />
        <div className="absolute w-4 h-8 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center group-hover:border-white/25 transition-colors z-10">
          <ChevronLeft
            size={10}
            className={`text-white/30 group-hover:text-white/70 transition-all duration-300 ${collapsed ? "rotate-180" : ""}`}
          />
        </div>
      </button>
    </div>
  );
}
