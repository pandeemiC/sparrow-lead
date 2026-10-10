"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import sparrowLogo from "@/public/sparrow-no-text-logo.png";
import AuroraBackground from "./AuroraBackground";

gsap.registerPlugin(SplitText);

export type AuthLede = {
  eyebrow: string;
  title: React.ReactNode;
  body: string;
  facts?: { num: string; label: string }[];
};

export default function AuthFrame({
  lede,
  topLink,
  children,
}: {
  lede?: AuthLede;
  topLink?: { href: string; label: string };
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const title = ref.current?.querySelector(".sp-lede h1");
      if (title && !reduced) {
        const split = SplitText.create(title, { type: "words" });
        gsap.from(split.words, {
          y: 28,
          opacity: 0,
          duration: 0.9,
          stagger: 0.06,
          ease: "power3.out",
          delay: 0.1,
        });
      }
      gsap.fromTo(
        ".sp-eyebrow, .sp-lede p, .sp-lede .fact",
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          delay: 0.35,
          ease: "power3.out",
        },
      );
      gsap.fromTo(
        ".sp-glass-shell",
        { opacity: 0, y: 24, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          delay: 0.2,
          ease: "power3.out",
        },
      );
    },
    { scope: ref },
  );

  return (
    <div className="sp-auth" ref={ref}>
      <AuroraBackground />
      <div className="sp-auth-shell">
        <header className="sp-auth-head">
          <Link href="/" className="sp-brand">
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
            Sparrow
          </Link>
          {topLink && (
            <Link href={topLink.href} className="sp-auth-link">
              {topLink.label}
            </Link>
          )}
        </header>

        <main className={`sp-auth-main ${lede ? "" : "solo"}`}>
          {lede && (
            <section className="sp-lede">
              <div className="sp-eyebrow">{lede.eyebrow}</div>
              <h1>{lede.title}</h1>
              <p>{lede.body}</p>
              {lede.facts && (
                <div className="facts">
                  {lede.facts.map((f) => (
                    <div className="fact" key={f.label}>
                      <div className="num">{f.num}</div>
                      <div className="lbl">{f.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
          <section className="sp-glass-shell">
            <div className="sp-glass">{children}</div>
          </section>
        </main>

        <footer className="sp-auth-foot">
          <span>© {new Date().getFullYear()} Sparrow</span>
          <span>Reddit · Hacker News · Bluesky</span>
        </footer>
      </div>
    </div>
  );
}

export const SPARROW_LEDE: AuthLede = {
  eyebrow: "AI social listening",
  title: (
    <>
      Hear the buyers <em>first.</em>
    </>
  ),
  body: "Sparrow watches Reddit, Hacker News and Bluesky for people asking for what you sell, scores how ready each one is to buy, and puts the best leads in front of you — so you reply while the thread is still warm.",
  facts: [
    { num: "3", label: "Sources watched" },
    { num: "1–10", label: "AI intent score" },
    { num: "6h", label: "Automatic scans" },
  ],
};
