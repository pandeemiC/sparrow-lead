"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { settingsItems } from "@/lib/constants";

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
        ".sp-card",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: "power2.out" },
      );
    },
    { scope: contentRef, dependencies: [pathname] },
  );

  return (
    <div className="sp-settings">
      <nav className="sp-settings-nav">
        {settingsItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={pathname === href ? "on" : ""}
          >
            <Icon />
            {label}
          </Link>
        ))}
      </nav>
      <div className="sp-settings-content" ref={contentRef}>
        <h1 className="sp-settings-title">{current?.label ?? "Settings"}</h1>
        {children}
      </div>
    </div>
  );
}
