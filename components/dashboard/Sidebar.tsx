"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { SiDiscord, SiGithub, SiInstagram } from "react-icons/si";
import { Settings, ChevronLeft, LogOut } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import sparrowLogo from "@/public/sparrow-no-text-logo.png";
import { navItems } from "@/lib/constants";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const isSettingsActive = pathname.startsWith("/dashboard/settings");
  const { signOut } = useClerk();

  return (
    <div className="relative flex shrink-0 h-full">
      <aside
        className={`flex flex-col h-full bg-[#0d0d0d] overflow-hidden transition-all duration-300 ${
          collapsed ? "w-16" : "w-50"
        }`}
      >
        <Link href="/dashboard">
          <div className="flex items-center gap-2 px-4 h-14 shrink-0 border-b border-white/6">
            <Image
              src={sparrowLogo}
              alt="Sparrow"
              width={26}
              height={26}
              style={{ width: "auto", height: "auto" }}
            />
            {!collapsed && (
              <span className="text-white font-semibold text-base uppercase tracking-[0.2em] flex-1 whitespace-nowrap">
                Sparrow
              </span>
            )}
          </div>
        </Link>

        <nav className="flex-1 py-4 flex flex-col gap-0.5 px-2">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center py-2 rounded-md transition-all ${
                  collapsed ? "justify-center px-2" : "gap-3 px-3"
                } ${
                  active
                    ? "bg-white/6 text-white border border-white/10"
                    : "text-white/40 hover:text-white/70 hover:bg-white/3 border border-transparent"
                }`}
                title={label}
              >
                <Icon size={17} className="shrink-0" />
                {!collapsed && (
                  <span className="text-[13px] font-medium whitespace-nowrap">
                    {label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-2 pb-2">
          <Link
            href="/dashboard/settings/overview"
            className={`flex items-center py-2 rounded-md transition-all ${
              collapsed ? "justify-center px-2" : "gap-3 px-3"
            } ${
              isSettingsActive
                ? "bg-white/6 text-white border border-white/10"
                : "text-white/40 hover:text-white/70 hover:bg-white/3 border border-transparent"
            }`}
            title="Settings"
          >
            <Settings size={17} className="shrink-0" />
            {!collapsed && (
              <span className="text-[13px] font-medium whitespace-nowrap">
                Settings
              </span>
            )}
          </Link>
          <button
            onClick={() => signOut({ redirectUrl: "/sign-in" })}
            className={`w-full flex items-center py-2 rounded-md transition-all cursor-pointer mt-0.5 ${
              collapsed ? "justify-center px-2" : "gap-3 px-3"
            } text-white/40 hover:text-white/70 hover:bg-white/3 border border-transparent`}
            title="Log out"
          >
            <LogOut size={17} className="shrink-0 text-red-500" />
            {!collapsed && (
              <span className="text-[13px] font-medium whitespace-nowrap">
                Log out
              </span>
            )}
          </button>
        </div>

        <div
          className={`py-5 px-2 flex items-center justify-center gap-5 text-white/25 border-t border-white/6 ${collapsed ? "invisible" : ""}`}
        >
          <a href="#" className="hover:text-white/60 transition-colors">
            <SiDiscord size={15} />
          </a>
          <a href="#" className="hover:text-white/60 transition-colors">
            <SiInstagram size={15} />
          </a>
          <a href="#" className="hover:text-white/60 transition-colors">
            <SiGithub size={15} />
          </a>
        </div>
      </aside>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="group relative w-3 h-full flex items-center justify-center bg-[#0d0d0d] cursor-pointer border-r border-white/6"
      >
        <div className="absolute w-5 h-5 rounded-full bg-[#0d0d0d] border border-white/10 flex items-center justify-center group-hover:border-white/20 transition-colors z-10">
          <ChevronLeft
            size={9}
            className={`text-white/30 group-hover:text-white/60 transition-all duration-300 ${collapsed ? "rotate-180" : ""}`}
          />
        </div>
      </button>
    </div>
  );
}
