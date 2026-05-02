"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { SiDiscord, SiGithub, SiInstagram } from "react-icons/si";
import { Settings, ChevronRight, LogOut } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { motion, AnimatePresence } from "motion/react";
import sparrowLogo from "@/public/sparrow-no-text-logo.png";
import { navItems } from "@/lib/constants";
import { useState } from "react";
import { useScanStore } from "@/store/scanStore";

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
  idx,
  badge,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  collapsed: boolean;
  idx: number;
  badge?: number;
  onNavigate?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.045, duration: 0.22, ease: "easeOut" }}
    >
      <Link
        href={href}
        title={collapsed ? label : undefined}
        onClick={onNavigate}
        className="relative flex items-center rounded-md overflow-hidden transition-colors duration-150"
        style={{
          padding: collapsed ? "9px 0" : "9px 12px",
          justifyContent: collapsed ? "center" : undefined,
          gap: collapsed ? undefined : "10px",
          background: active ? "rgba(210,18,18,0.07)" : "transparent",
          color: active ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.26)",
        }}
        onMouseEnter={(e) => {
          if (!active) {
            (e.currentTarget as HTMLElement).style.background =
              "rgba(255,255,255,0.028)";
            (e.currentTarget as HTMLElement).style.color =
              "rgba(255,255,255,0.52)";
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color =
              "rgba(255,255,255,0.26)";
          }
        }}
      >
        {active && (
          <span
            className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full"
            style={{
              background: "rgb(210,18,18)",
              boxShadow:
                "0 0 10px rgba(210,18,18,0.65), 0 0 20px rgba(210,18,18,0.2)",
            }}
          />
        )}
        <Icon size={14} className="shrink-0" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.14 }}
              className="text-[10px] font-semibold uppercase tracking-[0.16em] whitespace-nowrap overflow-hidden flex-1"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {!collapsed && !!badge && badge > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.14 }}
              className="min-w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white px-1 shrink-0"
            >
              {badge > 9 ? "9+" : badge}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    </motion.div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const isSettingsActive = pathname.startsWith("/dashboard/settings");
  const { signOut } = useClerk();
  const { newSignalsCount, clearNewSignals } = useScanStore();

  return (
    <div className="relative flex shrink-0 h-full">
      <motion.aside
        animate={{ width: collapsed ? 56 : 196 }}
        transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col h-full overflow-hidden shrink-0"
        style={{
          background: "#080204",
          borderRight: "1px solid rgba(255,255,255,0.055)",
        }}
      >
        <Link href="/dashboard">
          <div
            className="flex items-center gap-2.5 px-3.5 h-14 shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.055)" }}
          >
            <div className="shrink-0">
              <Image
                src={sparrowLogo}
                alt="Sparrow"
                width={20}
                height={20}
                style={{
                  width: "auto",
                  height: "auto",
                  filter:
                    "drop-shadow(0 0 7px rgba(210,18,18,0.6)) brightness(1.1)",
                }}
              />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.16 }}
                  className="text-[9px] font-bold uppercase tracking-[0.36em] text-white/40 whitespace-nowrap select-none"
                >
                  Sparrow
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </Link>

        <nav className="flex-1 py-3 flex flex-col gap-px px-2 overflow-hidden">
          {navItems.map(({ label, href, icon }, idx) => (
            <NavItem
              key={href}
              href={href}
              label={label}
              icon={icon}
              active={pathname === href}
              collapsed={collapsed}
              idx={idx}
              badge={href === "/dashboard/signals" ? newSignalsCount : undefined}
              onNavigate={href === "/dashboard/signals" ? clearNewSignals : undefined}
            />
          ))}
        </nav>

        <div className="px-2 pb-2 flex flex-col gap-px">
          <Link
            href="/dashboard/settings/overview"
            title={collapsed ? "Settings" : undefined}
            className="relative flex items-center rounded-md overflow-hidden transition-colors duration-150"
            style={{
              padding: collapsed ? "9px 0" : "9px 12px",
              justifyContent: collapsed ? "center" : undefined,
              gap: collapsed ? undefined : "10px",
              background: isSettingsActive
                ? "rgba(210,18,18,0.07)"
                : "transparent",
              color: isSettingsActive
                ? "rgba(255,255,255,0.88)"
                : "rgba(255,255,255,0.26)",
            }}
            onMouseEnter={(e) => {
              if (!isSettingsActive) {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255,255,255,0.028)";
                (e.currentTarget as HTMLElement).style.color =
                  "rgba(255,255,255,0.52)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isSettingsActive) {
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
                (e.currentTarget as HTMLElement).style.color =
                  "rgba(255,255,255,0.26)";
              }
            }}
          >
            {isSettingsActive && (
              <span
                className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full"
                style={{
                  background: "rgb(210,18,18)",
                  boxShadow:
                    "0 0 10px rgba(210,18,18,0.65), 0 0 20px rgba(210,18,18,0.2)",
                }}
              />
            )}
            <Settings size={14} className="shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{ duration: 0.14 }}
                  className="text-[10px] font-semibold uppercase tracking-[0.16em] whitespace-nowrap overflow-hidden"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <button
            onClick={() => signOut({ redirectUrl: "/sign-in" })}
            title={collapsed ? "Log out" : undefined}
            className="w-full flex items-center rounded-md transition-colors duration-150 cursor-pointer"
            style={{
              padding: collapsed ? "9px 0" : "9px 12px",
              justifyContent: collapsed ? "center" : undefined,
              gap: collapsed ? undefined : "10px",
              color: "rgba(255,255,255,0.20)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(239,68,68,0.06)";
              (e.currentTarget as HTMLElement).style.color =
                "rgba(239,68,68,0.65)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color =
                "rgba(255,255,255,0.20)";
            }}
          >
            <LogOut size={13} className="shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{ duration: 0.14 }}
                  className="text-[10px] font-semibold uppercase tracking-[0.16em] whitespace-nowrap overflow-hidden"
                >
                  Log out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        <div
          className="flex items-center justify-center py-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.14 }}
                className="flex items-center gap-4"
              >
                <a
                  href="#"
                  className="text-white/14 hover:text-white/38 transition-colors"
                >
                  <SiDiscord size={11} />
                </a>
                <a
                  href="#"
                  className="text-white/14 hover:text-white/38 transition-colors"
                >
                  <SiInstagram size={11} />
                </a>
                <a
                  href="#"
                  className="text-white/14 hover:text-white/38 transition-colors"
                >
                  <SiGithub size={11} />
                </a>
              </motion.div>
            ) : (
              <motion.a
                key="collapsed"
                href="#"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.14 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.14 }}
                className="hover:opacity-40 transition-opacity"
              >
                <SiDiscord size={11} className="text-white" />
              </motion.a>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="group absolute right-0 top-1/2 -translate-y-1/2 translate-x-full z-10 flex items-center justify-center cursor-pointer transition-colors duration-150"
        style={{
          width: 14,
          height: 28,
          background: "#080204",
          border: "1px solid rgba(255,255,255,0.08)",
          borderLeft: "none",
          borderRadius: "0 4px 4px 0",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor =
            "rgba(210,18,18,0.35)";
          (e.currentTarget as HTMLElement).style.boxShadow =
            "2px 0 12px rgba(210,18,18,0.12)";
          (e.currentTarget as HTMLElement).style.borderLeftColor =
            "transparent";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor =
            "rgba(255,255,255,0.08)";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
          (e.currentTarget as HTMLElement).style.borderLeftColor =
            "transparent";
        }}
      >
        <motion.div
          animate={{ rotate: collapsed ? 0 : 180 }}
          transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
        >
          <ChevronRight
            size={8}
            className="text-white/25 group-hover:text-white/55 transition-colors"
          />
        </motion.div>
      </button>
    </div>
  );
}
