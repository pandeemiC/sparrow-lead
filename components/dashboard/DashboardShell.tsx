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

type UserData = {
  name: string;
  email: string;
  imageUrl: string;
};

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
        ".sp-nav a, .sp-nav button",
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
    if (href === "/dashboard/signals" && newSignalsCount > 0) {
      return (
        <span className="ct hot">
          {newSignalsCount > 9 ? "9+" : newSignalsCount}
        </span>
      );
    }
    if (href === "/dashboard/keywords" && stats) {
      return <span className="ct">{keywordsTracked}</span>;
    }
    if (href === "/dashboard/hunt-board" && stats && activeLeads > 0) {
      return <span className="ct">{activeLeads}</span>;
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
      <div className={`sp-app ${rail ? "rail" : ""}`}>
        <div className="sp-side-wrap">
          <aside className="sp-side" ref={sideRef}>
            <Link href="/dashboard" className="sp-logo">
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
              <span>SPARROW</span>
            </Link>

            <nav className="sp-nav">
              {navItems.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  data-tip={label}
                  className={pathname === href ? "on" : ""}
                  onClick={
                    href === "/dashboard/signals" ? clearNewSignals : undefined
                  }
                >
                  <Icon />
                  <span className="lbl">{label}</span>
                  {badgeFor(href)}
                </Link>
              ))}
            </nav>

            <div className="sp-side-sep">ACCOUNT</div>
            <nav className="sp-nav">
              <Link
                href="/dashboard/settings/overview"
                data-tip="Settings"
                className={settingsActive ? "on" : ""}
              >
                <Settings />
                <span className="lbl">Settings</span>
              </Link>
            </nav>

            <div className="sp-plan">
              <h6>
                {plan} plan<span>BETA</span>
              </h6>
              <div className="sp-meter">
                <div>
                  Signals this month
                  <b>
                    {signalsThisMonth} / {limits.signals}
                  </b>
                </div>
                <div className="sp-bar">
                  <i style={{ width: `${sigPct}%` }} />
                </div>
              </div>
              <div className="sp-meter">
                <div>
                  Keywords
                  <b>
                    {keywordsTracked} / {limits.keywords}
                  </b>
                </div>
                <div className="sp-bar">
                  <i style={{ width: `${kwPct}%` }} />
                </div>
              </div>
              {plan === "free" && (
                <Link href="/dashboard/settings/billing" className="sp-upg">
                  Upgrade for more →
                </Link>
              )}
            </div>

            <div className="sp-me">
              <span className="sp-av">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt={displayName} />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </span>
              <div className="who">
                <b>{displayName}</b>
                <small>{email}</small>
              </div>
              <button
                className="sp-icon-btn"
                title="Log out"
                onClick={() => signOut({ redirectUrl: "/sign-in" })}
              >
                <LogOut />
              </button>
            </div>

            <div className="sp-socials">
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
          </aside>
          <button
            className="sp-rail-toggle"
            onClick={() => setRail((r) => !r)}
            title={rail ? "Expand sidebar" : "Collapse sidebar"}
          >
            {rail ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        </div>

        <main className="sp-main">
          <div className="sp-top">
            <div className="sp-crumb">
              {crumb !== "Dashboard" && (
                <>
                  Dashboard<span>/</span>
                </>
              )}
              <b>{crumb}</b>
            </div>
            <Link href="/dashboard/hunt-board" className="sp-btn pri">
              <Target />
              Hunt
            </Link>
          </div>
          <div className="sp-body">{children}</div>
        </main>
      </div>
    </div>
  );
}
