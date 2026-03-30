"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { SiDiscord, SiGithub, SiInstagram } from "react-icons/si";
import { LayoutDashboard, Radio, Tag, Target, Settings } from "lucide-react";
import sparrowLogo from "@/public/sparrow-no-text-logo.png";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Signals", href: "/dashboard/signals", icon: Radio },
  { label: "Keywords", href: "/dashboard/keywords", icon: Tag },
  { label: "Hunt Board", href: "/dashboard/hunt-board", icon: Target },
];

type UserData = {
  name: string;
  imageUrl: string;
};

export default function Sidebar({ user }: { user: UserData }) {
  const pathname = usePathname();

  return (
    <aside className="w-50 flex flex-col h-full bg-[#0d0d0d] border-r border-white/5 shrink-0">
      <div className="flex items-center gap-1 px-4 h-16 border-b border-white/5 shrink-0">
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
      <nav className="flex-1 py-5 space-y-3 px-2">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-4 rounded-lg transition-all ${
                active
                  ? "bg-linear-to-t from-sparrow-red/20 via-sparrow-red/6 to-transparent text-white shadow-[0_8px_20px_rgba(204,0,0,0.18)]"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
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
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"
        >
          <Settings size={18} className="shrink-0" />
          <span className="text-sm font-medium whitespace-nowrap">
            Settings
          </span>
        </Link>
      </nav>
      <div className="py-4 px-2 border-t border-white/5 flex items-center justify-center gap-5 text-white/40 py-7">
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
