"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { settingsItems } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);
  const current = settingsItems.find((item) => item.href === pathname);

  useGSAP(
    () => {
      gsap.fromTo(
        "[data-card]",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: "power2.out" },
      );
    },
    { scope: contentRef, dependencies: [pathname] },
  );

  return (
    <div className="grid max-w-270 grid-cols-1 items-start gap-7 min-[861px]:grid-cols-[220px_minmax(0,1fr)]">
      <nav className="flex flex-row flex-wrap gap-0.5 rounded-2xl border border-line bg-panel p-2 min-[861px]:sticky min-[861px]:top-0 min-[861px]:flex-col">
        {settingsItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-[13px] text-ink-2 transition-colors hover:bg-panel-2 hover:text-ink",
                active &&
                  "bg-r1/10 text-ink shadow-[inset_0_0_0_1px_rgba(255,36,56,0.22)] hover:bg-r1/10",
              )}
            >
              <Icon
                className={cn("size-3.75 flex-none", active && "text-r1")}
              />
              {label}
            </Link>
          );
        })}
      </nav>
      <div ref={contentRef}>
        <h1 className="mt-1 mb-5.5 font-display text-[clamp(28px,2.6vw,38px)] leading-none tracking-[-0.02em]">
          {current?.label ?? "Settings"}
        </h1>
        {children}
      </div>
    </div>
  );
}
