"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import useState from "react";
import { SiDiscord, SiGithub, SiInstagram } from "react-icons/si";
import { LayoutDashboard, Radio, Tag, Target, Settings } from "lucide-react";
import sparrowLogo from "@/public/sparrow-no-text-logo.png";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Signals", href: "/dashboard/signals", icon: Radio },
  { label: "Keywords", href: "/dashboard/keywords", icon: Tag },
  { label: "Hunt Board", href: "/dashboard/hunt-board", icon: Target },
];

export default function Sidebar() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const pathname = usePathname();

  const activeClass = "nav-active";
  const inactiveClass = "text-white/40 hover:text-white hover:bg-white/5";

  return (
    <aside className="w-50 flex flex-col h-full bg-sparrow-base shrink-0">
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

      <nav className="flex-1 py-5 space-y-3 px-2">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 pl-5 pr-3 py-4 rounded-lg transition-all ${active ? activeClass : inactiveClass}`}
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
          onClick={() => setSettingsOpen(true)}
          href="/dashboard/settings"
          className={`flex items-center gap-3 pl-5 pr-3 py-4 rounded-lg transition-all ${
            pathname === "/dashboard/settings" ? activeClass : inactiveClass
          }`}
        >
          <Settings
            size={18}
            className={`shrink-0 ${pathname === "/dashboard/settings" ? "text-sparrow-red" : ""}`}
          />
          <span className="text-sm font-medium whitespace-nowrap">
            Settings
          </span>
        </Link>
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
