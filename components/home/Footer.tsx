"use client";

import Link from "next/link";
import Brand from "./Brand";
import { useAuth } from "@clerk/nextjs";
import { Mail } from "lucide-react";
import SocialLinks from "./SocialLinks";
import { CONTACT_EMAIL } from "./contact";

const LINKS = [
  {
    title: "Product",
    items: [
      { label: "How it works", href: "#how" },
      { label: "Intent score", href: "#intent" },
      { label: "Questions", href: "#faq" },
      { label: "Back to top", href: "#top" },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Sign in", href: "/sign-in" },
      { label: "Create account", href: "/sign-up" },
    ],
  },
  {
    title: "Listens on",
    items: [
      { label: "Reddit", href: "https://www.reddit.com" },
      { label: "Hacker News", href: "https://news.ycombinator.com" },
      { label: "Bluesky", href: "https://bsky.app" },
    ],
  },
];

export default function Footer() {
  const { isSignedIn } = useAuth();

  return (
    <footer className="relative isolate overflow-hidden pt-28 pb-20 md:pt-36">
      {/* red light rising from the bottom, breathing slowly, over a perspective grid floor */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[85%] origin-bottom animate-[sp-glow-pulse_7s_ease-in-out_infinite] bg-[radial-gradient(75%_85%_at_78%_105%,rgba(255,36,56,0.55),rgba(160,18,32,0.28)_38%,rgba(126,15,27,0.1)_60%,transparent_80%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/2 animate-[sp-glow-pulse_9s_ease-in-out_infinite_reverse] bg-[radial-gradient(60%_90%_at_12%_110%,rgba(126,15,27,0.4),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-x-[-30%] bottom-0 -z-10 h-80 origin-bottom [transform:perspective(420px)_rotateX(64deg)] bg-[linear-gradient(rgba(255,255,255,0.11)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.11)_1px,transparent_1px)] bg-size-[64px_64px] [mask-image:linear-gradient(to_top,black_10%,transparent_85%)]" />

      <div className="mx-auto max-w-310 px-5 md:px-10">
        <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
          <h2 className="max-w-[13em] font-display text-[clamp(38px,5vw,72px)] leading-[1.02] tracking-[-0.02em] text-balance">
            Someone posted about what you do today.
          </h2>
          <div className="flex flex-none flex-wrap gap-3">
            <Link
              href={isSignedIn ? "/dashboard" : "/sign-up"}
              className="inline-flex h-12 items-center rounded-xl bg-white px-6 text-[14.5px] font-medium text-[#1C1113] transition-colors hover:bg-[#f3dfe1]"
            >
              {isSignedIn ? "Open your dashboard" : "Start free"}
            </Link>
            {!isSignedIn && (
              <Link
                href="/sign-in"
                className="inline-flex h-12 items-center rounded-xl border border-white/15 px-6 text-[14.5px] font-medium transition-colors hover:bg-white/7"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="group inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/3 py-3 pr-5 pl-3 backdrop-blur-sm transition-colors hover:border-r1/40 hover:bg-r1/6"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-r1/15 text-r1 transition-colors group-hover:bg-r1 group-hover:text-white">
              <Mail className="size-4.5" />
            </span>
            <span>
              <span className="block text-[12.5px] text-ink-3">
                Get in touch now
              </span>
              <span className="block text-[15px] text-ink">
                {CONTACT_EMAIL}
              </span>
            </span>
          </a>
          <SocialLinks />
        </div>

        <div className="mt-24 grid grid-cols-2 gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1">
            <Brand />
            <p className="mt-4 max-w-[22em] text-[14px] leading-relaxed text-ink-3">
              Finds the people asking for what you have, and tells you who to
              answer first. A portfolio project, built as a working demo you can
              sign in to and use.
            </p>
          </div>
          {LINKS.map((group) => (
            <div key={group.title}>
              <p className="text-[13px] text-ink-3">{group.title}</p>
              <ul className="mt-4 flex flex-col gap-3">
                {group.items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-[14.5px] text-ink-2 transition-colors hover:text-ink"
                      {...(item.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
