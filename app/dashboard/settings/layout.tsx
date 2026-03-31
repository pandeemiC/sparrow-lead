"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaCogs } from "react-icons/fa";
import { settingsItems } from "@/lib/constants";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-52 shrink-0 border-r border-white/5 p-4 flex flex-col gap-1">
        <div className="flex items-center gap-2 px-3 py-2 mb-2">
          <FaCogs size={14} className="text-white/40" />
          <span className="text-xs font-medium text-white/40 uppercase tracking-widest">
            Settings
          </span>
        </div>
        {settingsItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-white/5 text-white"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              <Icon size={14} className="shrink-0" />
              {label}
            </Link>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-8">{children}</div>
    </div>
  );
}
