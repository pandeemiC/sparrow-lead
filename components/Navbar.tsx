"use client";

import Link from "next/link";
import Brand from "@/components/home/Brand";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import SocialLinks from "@/components/home/SocialLinks";
import { CONTACT_EMAIL } from "@/components/home/contact";

const LINKS = [
  { label: "How it works", href: "#how" },
  { label: "Intent score", href: "#intent" },
  { label: "Questions", href: "#faq" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);

  // hide while scrolling down, come back after a deliberate scroll up
  useEffect(() => {
    let last = window.scrollY;
    let upTravel = 0;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - last;
      last = y;
      setSolid(y > 20);
      if (y < 120) {
        upTravel = 0;
        setHidden(false);
      } else if (delta > 0) {
        upTravel = 0;
        setHidden(true);
      } else if (delta < 0) {
        upTravel -= delta;
        if (upTravel > 24) setHidden(false);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // only the marketing homepage uses this navbar
  if (pathname !== "/") return null;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-transparent transition-[translate,opacity,background-color,border-color]",
        hidden
          ? "-translate-y-full opacity-0 duration-300 ease-in"
          : "translate-y-0 opacity-100 duration-700 ease-[cubic-bezier(.16,1,.3,1)]",
        solid && "border-white/7 bg-[rgba(11,6,7,0.72)] backdrop-blur-xl",
      )}
    >
      <div className="mx-auto flex h-17 max-w-310 items-center gap-10 px-5 md:px-10">
        <Brand />
        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[13.5px] whitespace-nowrap text-ink-2 transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-5">
          <SocialLinks size="sm" className="hidden lg:flex" />
          {!isSignedIn && (
            <Link
              href="/sign-in"
              className="hidden text-[13.5px] whitespace-nowrap text-ink-2 transition-colors hover:text-ink sm:block"
            >
              Sign in
            </Link>
          )}
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Sparrow demo request")}`}
            className="hidden h-9 items-center rounded-[10px] border border-white/15 bg-white/4 px-4 text-[13px] font-medium whitespace-nowrap text-ink transition-colors hover:border-white/25 hover:bg-white/8 md:inline-flex"
          >
            Request a demo
          </a>
          <Link
            href={isSignedIn ? "/dashboard" : "/sign-up"}
            className="inline-flex h-9 items-center rounded-[10px] bg-linear-to-b from-[#ff3446] to-r2 px-4 text-[13px] font-medium whitespace-nowrap text-white shadow-[0_8px_30px_-10px_rgba(255,36,56,0.7),inset_0_1px_0_rgba(255,255,255,0.25)]"
          >
            {isSignedIn ? "Dashboard" : "Start free"}
          </Link>
        </div>
      </div>
    </header>
  );
}
