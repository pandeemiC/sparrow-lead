"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import sparrowLogo from "@/public/sparrow-no-text-logo.png";
import AuroraBackground from "./AuroraBackground";
import { cn } from "@/lib/utils";

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
      const title = ref.current?.querySelector("h1");
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
        "[data-fade]",
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
        "[data-glass]",
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
    <div
      ref={ref}
      className="fixed inset-0 z-50 overflow-auto bg-r4 font-body text-sm leading-normal font-light text-white"
    >
      <AuroraBackground />
      <div className="relative z-2 grid min-h-screen grid-rows-[auto_1fr_auto]">
        <header className="flex items-center justify-between px-8 py-6 max-[980px]:px-[22px] max-[980px]:py-5">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-mono text-xs leading-[normal] font-normal tracking-[0.18em] text-white/62 uppercase"
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
            Sparrow
          </Link>
          {topLink && (
            <Link
              href={topLink.href}
              className="rounded-full border border-white/12 bg-white/3 px-3.5 py-2 font-mono text-[11px] leading-[normal] font-normal tracking-[0.16em] text-white/62 uppercase backdrop-blur-sm transition-all duration-200 hover:border-white/22 hover:text-white"
            >
              {topLink.label}
            </Link>
          )}
        </header>

        <main
          className={cn(
            "mx-auto grid w-full max-w-[1440px] items-center gap-12 px-16 py-6 max-[980px]:px-[22px] max-[980px]:pt-3 max-[980px]:pb-8",
            lede
              ? "grid-cols-[1.15fr_0.85fr] max-[980px]:grid-cols-[minmax(0,1fr)]"
              : "grid-cols-[minmax(0,560px)] justify-center",
          )}
        >
          {lede && (
            <section>
              <div
                data-fade
                className="mb-6 flex items-center gap-3 font-mono text-[11px] leading-[normal] font-normal tracking-[0.22em] text-white/38 uppercase"
              >
                {lede.eyebrow}
              </div>
              <h1 className="mt-0 mb-7 font-display text-[clamp(48px,6.4vw,100px)] leading-[0.96] font-normal tracking-[-0.025em] [&_em]:text-white/78 [&_em]:italic">
                {lede.title}
              </h1>
              <p
                data-fade
                className="m-0 max-w-[44ch] text-[15px] leading-[1.65] text-white/62"
              >
                {lede.body}
              </p>
              {lede.facts && (
                <div className="mt-11 flex max-w-[540px] flex-wrap gap-10 border-t border-white/12 pt-6 max-[980px]:hidden">
                  {lede.facts.map((f) => (
                    <div data-fade key={f.label}>
                      <div className="font-display text-[26px] leading-none font-normal">
                        {f.num}
                      </div>
                      <div className="mt-2 font-mono text-[10px] leading-[normal] font-normal tracking-[0.18em] text-white/38 uppercase">
                        {f.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
          <section
            data-glass
            className="rounded-3xl bg-linear-to-b from-white/18 via-white/2 to-black/20 p-px shadow-[0_24px_80px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]"
          >
            <div className="rounded-[23px] bg-[rgba(20,4,8,0.45)] px-9 pt-9 pb-[30px] backdrop-blur-[18px] backdrop-saturate-130 max-[560px]:px-5 max-[560px]:pt-[26px] max-[560px]:pb-[22px]">
              {children}
            </div>
          </section>
        </main>

        <footer className="flex justify-end px-8 py-5 font-mono text-[10.5px] leading-[normal] font-normal tracking-[0.14em] text-white/32 uppercase max-[560px]:hidden">
          <span>Reddit · Hacker News · Bluesky</span>
        </footer>
      </div>
    </div>
  );
}

export const SPARROW_LEDE: AuthLede = {
  eyebrow: "Social Listener",
  title: (
    <>
      Hear the buyers <em>first.</em>
    </>
  ),
  body: "Sparrow watches Reddit, Hacker News and Bluesky for people asking for what you sell, scores how ready each one is to buy, and puts the best leads in front of you so you reply while the thread is still warm.",
  facts: [
    { num: "3", label: "Sources watched" },
    { num: "1–10", label: "AI intent score" },
    { num: "6h", label: "Automatic scans" },
  ],
};
