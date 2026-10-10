"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  Target,
} from "lucide-react";
import { SiDiscord, SiGithub, SiInstagram } from "react-icons/si";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import sparrowLogo from "@/public/sparrow-no-text-logo.png";
import { navItems } from "@/lib/constants";
import { usePlan } from "./PlanContext";
import { useScanStore } from "@/store/scanStore";
import { useStatsStore } from "@/store/statsStore";
import { cn } from "@/lib/utils";
import { Bar, buttonClass, IconButton } from "@/components/sp/ui";

type UserData = {
  name: string;
  email: string;
  imageUrl: string;
};

function navLinkClass(active: boolean, rail: boolean) {
  return cn(
    "relative flex items-center gap-3 whitespace-nowrap rounded-[10px] text-left text-[13.5px] text-ink-2 transition-colors hover:bg-panel-2 hover:text-ink [&>svg]:flex-none",
    rail
      ? "justify-center px-0 py-[11px] [&>svg]:size-[18px]"
      : "px-2.5 py-[9px] [&>svg]:size-4",
    active &&
      "bg-linear-to-r from-r1/16 to-r1/3 text-ink shadow-[inset_0_0_0_1px_rgba(255,36,56,0.22)] hover:bg-transparent [&>svg]:text-r1",
  );
}

// count bubble next to a nav item, turns into a corner dot in rail mode
function NavBadge({
  count,
  hot = false,
  active,
  rail,
}: {
  count: string | number;
  hot?: boolean;
  active: boolean;
  rail: boolean;
}) {
  return (
    <span
      className={cn(
        "font-mono leading-[normal] font-medium",
        rail
          ? "absolute top-[3px] right-1.5 grid h-[15px] min-w-[15px] place-items-center rounded-[9px] bg-white/8 px-[3px] text-[9px] text-ink-2"
          : "ml-auto text-[11px] text-ink-3",
        hot &&
          !rail &&
          "rounded-full bg-r1 px-1.5 text-white shadow-[0_0_10px_rgba(255,36,56,0.5)]",
        (hot || active) && rail && "bg-r1 text-white",
      )}
    >
      {count}
    </span>
  );
}

const CRUMBS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/signals": "Signals",
  "/dashboard/keywords": "Keywords",
  "/dashboard/hunt-board": "Hunt Board",
};

export default function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: UserData;
}) {
  const pathname = usePathname();
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const { plan, limits } = usePlan();
  const { newSignalsCount, clearNewSignals } = useScanStore();
  const stats = useStatsStore((s) => s.stats);
  const refreshStats = useStatsStore((s) => s.refresh);
  const [rail, setRail] = useState(false);
  const sideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    refreshStats();
  }, [pathname, refreshStats]);

  useGSAP(
    () => {
      gsap.fromTo(
        "nav a",
        { opacity: 0, x: -8 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.04, ease: "power2.out" },
      );
    },
    { scope: sideRef },
  );

  const displayName = clerkUser?.firstName
    ? `${clerkUser.firstName} ${clerkUser.lastName ?? ""}`.trim()
    : user.name;
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? user.email;
  const imageUrl = clerkUser?.imageUrl ?? user.imageUrl;

  const keywordsTracked = stats?.keywordsTracked ?? 0;
  const signalsThisMonth = stats?.signalsThisMonth ?? 0;
  const activeLeads = stats
    ? stats.huntCounts.hunting +
      stats.huntCounts.interested +
      stats.huntCounts.engaged
    : 0;
  const sigPct = Math.min((signalsThisMonth / limits.signals) * 100, 100);
  const kwPct = Math.min((keywordsTracked / limits.keywords) * 100, 100);
  const settingsActive = pathname.startsWith("/dashboard/settings");
  const crumb = settingsActive ? "Settings" : (CRUMBS[pathname] ?? "Dashboard");

  function badgeFor(href: string) {
    const active = pathname === href;
    if (href === "/dashboard/signals" && newSignalsCount > 0) {
      return (
        <NavBadge
          hot
          active={active}
          rail={rail}
          count={newSignalsCount > 9 ? "9+" : newSignalsCount}
        />
      );
    }
    if (href === "/dashboard/keywords" && stats) {
      return <NavBadge active={active} rail={rail} count={keywordsTracked} />;
    }
    if (href === "/dashboard/hunt-board" && stats && activeLeads > 0) {
      return <NavBadge active={active} rail={rail} count={activeLeads} />;
    }
    return null;
  }

  return (
    <div className="sp">
      <div className="sp-glow">
        <i />
        <i />
      </div>
      <div className="sp-grid" />
      <div
        className={cn(
          "relative z-1 grid h-screen bg-bg transition-[grid-template-columns] duration-[260ms] ease-[cubic-bezier(0.4,0,0.2,1)] max-[760px]:grid-cols-1",
          rail
            ? "grid-cols-[68px_minmax(0,1fr)]"
            : "grid-cols-[232px_minmax(0,1fr)]",
        )}
      >
        <div className="relative z-1 flex min-h-0 min-w-0 max-[760px]:hidden">
          <aside
            ref={sideRef}
            className={cn(
              "flex min-w-0 flex-1 flex-col overflow-hidden border-r border-line bg-[rgba(8,4,5,0.55)] backdrop-blur-md",
              rail ? "items-center px-2.5 py-[18px]" : "px-3 py-5",
            )}
          >
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-2.5 whitespace-nowrap font-mono text-[11px] leading-[normal] font-medium tracking-[0.28em] text-ink-2",
                rail ? "justify-center pt-0.5 pb-[22px]" : "px-2.5 pt-0.5 pb-6",
              )}
            >
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
              {!rail && <span>SPARROW</span>}
            </Link>

            <nav className={cn("flex flex-col gap-0.5", rail && "w-full")}>
              {navItems.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  title={rail ? label : undefined}
                  className={navLinkClass(pathname === href, rail)}
                  onClick={
                    href === "/dashboard/signals" ? clearNewSignals : undefined
                  }
                >
                  <Icon />
                  {!rail && <span>{label}</span>}
                  {badgeFor(href)}
                </Link>
              ))}
            </nav>

            {rail ? (
              <div className="mx-auto my-3 w-6 border-t border-line" />
            ) : (
              <div className="whitespace-nowrap px-2.5 pt-[22px] pb-2 font-mono text-[10px] leading-[normal] font-medium tracking-[0.2em] text-ink-3">
                ACCOUNT
              </div>
            )}
            <nav className={cn("flex flex-col gap-0.5", rail && "w-full")}>
              <Link
                href="/dashboard/settings/overview"
                title={rail ? "Settings" : undefined}
                className={navLinkClass(settingsActive, rail)}
              >
                <Settings />
                {!rail && <span>Settings</span>}
              </Link>
            </nav>

            {!rail && (
              <div className="mt-auto rounded-[14px] border border-line bg-panel p-3.5">
                <h6 className="mb-2.5 flex justify-between text-xs leading-[normal] font-medium capitalize">
                  {plan} plan
                  <span className="font-mono text-[10px] tracking-[0.14em] text-amber">
                    BETA
                  </span>
                </h6>
                <div className="mb-2.5">
                  <div className="mb-[5px] flex justify-between text-[11.5px] text-ink-2">
                    Signals this month
                    <b className="font-mono text-[11px] leading-[normal] font-medium text-ink">
                      {signalsThisMonth} / {limits.signals}
                    </b>
                  </div>
                  <Bar pct={sigPct} />
                </div>
                <div className="mb-2.5">
                  <div className="mb-[5px] flex justify-between text-[11.5px] text-ink-2">
                    Keywords
                    <b className="font-mono text-[11px] leading-[normal] font-medium text-ink">
                      {keywordsTracked} / {limits.keywords}
                    </b>
                  </div>
                  <Bar pct={kwPct} />
                </div>
                {plan === "free" && (
                  <Link
                    href="/dashboard/settings/billing"
                    className="mt-1 block w-full rounded-full border border-line-2 p-2 text-center text-[12.5px] transition-colors hover:border-r1"
                  >
                    Upgrade for more →
                  </Link>
                )}
              </div>
            )}

            <div
              className={cn(
                "mt-3.5 flex border-t border-line",
                rail
                  ? "mt-auto w-full flex-col items-center gap-2 pt-3"
                  : "items-center gap-2.5 px-2 pt-3.5",
              )}
            >
              <span className="grid size-8 flex-none place-items-center overflow-hidden rounded-full bg-[radial-gradient(circle_at_30%_30%,#b58cff,#3a1e6e)] text-xs leading-[normal] font-medium">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt={displayName}
                    className="size-full object-cover"
                  />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </span>
              {!rail && (
                <div className="min-w-0 flex-1">
                  <b className="block truncate text-[13px] font-medium">
                    {displayName}
                  </b>
                  <small className="block truncate text-[11.5px] text-ink-3">
                    {email}
                  </small>
                </div>
              )}
              <IconButton
                title="Log out"
                onClick={() => signOut({ redirectUrl: "/sign-in" })}
              >
                <LogOut />
              </IconButton>
            </div>

            {!rail && (
              <div className="flex justify-center gap-4 pt-3.5 text-ink-3 [&>a]:opacity-50 [&>a]:transition-opacity [&>a:hover]:opacity-100">
                <a href="#" aria-label="Discord">
                  <SiDiscord size={12} />
                </a>
                <a href="#" aria-label="Instagram">
                  <SiInstagram size={12} />
                </a>
                <a href="#" aria-label="GitHub">
                  <SiGithub size={12} />
                </a>
              </div>
            )}
          </aside>
          <button
            className="absolute top-1/2 -right-3 z-5 grid size-6 -translate-y-1/2 place-items-center rounded-full border border-line-2 bg-[#140a0c] text-ink-3 transition-colors hover:border-r1 hover:text-ink"
            onClick={() => setRail((r) => !r)}
            title={rail ? "Expand sidebar" : "Collapse sidebar"}
          >
            {rail ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        </div>

        <main className="relative z-1 flex min-h-0 min-w-0 flex-col overflow-hidden">
          <div className="flex h-[60px] flex-none items-center gap-4 border-b border-line px-7 max-[760px]:px-3.5">
            <div className="flex gap-2 text-[13px] text-ink-3">
              {crumb !== "Dashboard" && (
                <>
                  Dashboard<span>/</span>
                </>
              )}
              <b className="font-medium text-ink">{crumb}</b>
            </div>
            <Link
              href="/dashboard/hunt-board"
              className={cn(buttonClass({ variant: "primary" }), "ml-auto")}
            >
              <Target />
              Hunt
            </Link>
          </div>
          <div className="@container min-h-0 flex-1 overflow-auto px-[clamp(12px,1.4vw,20px)] pt-[clamp(12px,1.4vw,20px)] pb-7">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
