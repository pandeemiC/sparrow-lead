"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import Aurora, { type AuroraControl } from "./Aurora";
import PlatformIcon from "@/components/ui/PlatformIcon";
import ScoreArc from "@/components/sp/ScoreArc";
import { SAMPLE_POSTS } from "./data";
import { platformVar, scoreColor, scoreLabel, scoreTier } from "@/lib/score";

gsap.registerPlugin(SplitText);

const CARD_MS = 4600;
const WORDS = ["people", "clients", "customers", "users", "buyers"];
const WORD_MS = 2800;

// the word after "Find the" cycles; the slot animates its width so the line re-centres smoothly
function WordRotator() {
  const slotRef = useRef<HTMLSpanElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % WORDS.length),
      WORD_MS,
    );
    return () => clearInterval(timer);
  }, []);

  useGSAP(
    () => {
      const slot = slotRef.current;
      if (!slot) return;
      const words = slot.querySelectorAll<HTMLElement>("[data-word]");
      const next = words[index];
      const prev = words[(index - 1 + WORDS.length) % WORDS.length];
      const width = next.offsetWidth;
      if (index === 0 && !slot.style.width) {
        // first render: just size the slot, the headline intro handles the reveal
        gsap.set(slot, { width });
        gsap.set(next, { yPercent: 0, opacity: 1 });
        gsap.from(next, {
          yPercent: 110,
          duration: 1.2,
          delay: 0.27,
          ease: "power4.out",
        });
        return;
      }
      gsap.to(slot, { width, duration: 0.7, ease: "power3.inOut" });
      gsap.to(prev, {
        yPercent: -110,
        opacity: 0,
        duration: 0.6,
        ease: "power3.in",
      });
      gsap.fromTo(
        next,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.2,
          ease: "power3.out",
        },
      );
    },
    { dependencies: [index] },
  );

  return (
    <span
      ref={slotRef}
      className="relative -mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom"
    >
      {/* invisible copy keeps the line height; real words are stacked on top */}
      <span className="invisible">{WORDS[0]}</span>
      {WORDS.map((w, i) => (
        <span
          key={w}
          data-word
          aria-hidden={i !== index}
          className="absolute top-0 left-0 whitespace-nowrap"
          style={{ opacity: i === 0 ? 1 : 0 }}
        >
          {w}
        </span>
      ))}
    </span>
  );
}
// rgb per intent tier, for the border glow tween
const TIER_RGB = { hi: "255,36,56", md: "246,193,72", lo: "255,255,255" };

// stack of sample signals under the headline, the front one swaps every few seconds
function SignalStack({ onHot }: { onHot: () => void }) {
  const [index, setIndex] = useState(0);
  const frontRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef(true);
  const post = SAMPLE_POSTS[index];
  const color = scoreColor(post.score);

  useEffect(() => {
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % SAMPLE_POSTS.length),
      CARD_MS,
    );
    return () => clearInterval(timer);
  }, []);

  useGSAP(
    () => {
      gsap.fromTo(
        frontRef.current,
        { y: 14, opacity: 0, scale: 0.97 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" },
      );
      gsap.fromTo(
        barRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: CARD_MS / 1000, ease: "none" },
      );
      // first card: wait for the hero intro to finish so the pulse is actually seen
      const delay = firstRef.current ? 1.4 : 0.1;
      firstRef.current = false;

      // one soft halo breathes out from the card in the post's intent colour
      const halo = haloRef.current;
      if (halo) {
        gsap.fromTo(
          halo,
          { opacity: 0, scale: 1 },
          {
            keyframes: [
              { opacity: 0.55, duration: 0.4, ease: "sine.out" },
              { opacity: 0, scale: 1.035, duration: 1.1, ease: "sine.inOut" },
            ],
            delay,
          },
        );
      }
      // border glow eases in then out (plain rgba so gsap can blend it),
      // then the shadow is handed back to the css
      const rgb = TIER_RGB[scoreTier(post.score)];
      const shadow = (a: number) =>
        `0 0 0 1px rgba(${rgb},${a}), 0 30px 80px -30px rgba(0,0,0,0.9)`;
      gsap.fromTo(
        frontRef.current,
        { boxShadow: shadow(0) },
        {
          keyframes: [
            { boxShadow: shadow(0.5), duration: 0.4, ease: "sine.out" },
            { boxShadow: shadow(0), duration: 1.1, ease: "sine.inOut" },
          ],
          delay,
          clearProps: "boxShadow",
        },
      );
      if (post.score >= 8) gsap.delayedCall(delay, onHot);
    },
    { dependencies: [index] },
  );

  return (
    <div className="relative mx-auto w-full max-w-140">
      {/* soft halo that breathes out from the card each time a new post arrives */}
      <div
        ref={haloRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0"
        style={{
          boxShadow: `0 0 0 1px color-mix(in oklab, ${color} 50%, transparent), 0 0 28px 2px color-mix(in oklab, ${color} 22%, transparent)`,
        }}
      />
      {/* the two cards peeking out behind make it read as a stream */}
      <div className="absolute inset-x-8 -top-3 h-full rounded-2xl border border-white/6 bg-[#160b0e]/60" />
      <div className="absolute inset-x-4 -top-1.5 h-full rounded-2xl border border-white/8 bg-[#180c0f]/80" />
      <div
        ref={frontRef}
        className="relative overflow-hidden rounded-2xl border border-white/12 bg-[rgba(24,11,14,0.78)] p-4 text-left shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl"
        style={{ "--pc": platformVar(post.platform) } as React.CSSProperties}
      >
        <div className="pointer-events-none absolute -top-16 -left-10 size-48 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--pc)_22%,transparent),transparent_70%)]" />
        <div className="relative flex items-center gap-4">
          <div className="grid size-11 flex-none place-items-center rounded-xl border border-white/10 bg-[color-mix(in_oklab,var(--pc)_14%,transparent)]">
            <PlatformIcon platform={post.platform} size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[12px] text-ink-3">
              <span className="text-ink-2">{post.source}</span>
              <span>{post.ago} ago</span>
              <span className="ml-auto hidden rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-ink-2 sm:inline">
                {post.type}
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-[14px] leading-snug text-ink">
              {post.title}
            </p>
          </div>
          <div className="flex w-14 flex-none flex-col items-center gap-1">
            <ScoreArc key={index} score={post.score} className="scale-150" />
            <span className="mt-2 font-mono text-[9px] tracking-[0.14em] text-ink-3">
              {scoreLabel(post.score)}
            </span>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/5">
          <div
            ref={barRef}
            className="h-full origin-left bg-linear-to-r from-transparent via-r1/60 to-r1"
          />
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const { isSignedIn } = useAuth();
  const auroraRef = useRef<AuroraControl | null>(null);
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduced) return;
      const split = SplitText.create("[data-split]", {
        type: "words",
        mask: "words",
      });
      // the mask clips, so give letters like "y" and "p" room underneath
      split.masks.forEach((m) => {
        (m as HTMLElement).style.paddingBottom = "0.14em";
        (m as HTMLElement).style.marginBottom = "-0.14em";
      });
      gsap.from(split.words, {
        yPercent: 110,
        duration: 1.2,
        stagger: 0.07,
        ease: "power4.out",
        delay: 0.2,
      });
      gsap.from("[data-hero-fade]", {
        opacity: 0,
        y: 14,
        duration: 0.9,
        stagger: 0.12,
        ease: "power2.out",
        delay: 0.6,
      });
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      className="relative flex h-svh max-h-287.5 min-h-175 flex-col overflow-hidden"
    >
      <Aurora
        y={0.5}
        seed={2}
        controlRef={auroraRef}
        className="absolute inset-0 size-full"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-b from-transparent to-bg" />

      <div className="relative z-2 mx-auto flex w-full max-w-310 flex-1 flex-col items-center justify-end px-5 pb-10 text-center md:px-10 md:pb-14">
        <div
          data-hero-fade
          className="mb-6 flex items-center gap-2 text-[13px] text-ink-2"
        >
          <span className="size-1.5 rounded-full bg-r1 shadow-[0_0_10px_var(--r1)]" />
          Social listener for Reddit, Hacker News and Bluesky
        </div>
        <h1 className="font-display text-[clamp(34px,9.6vw,64px)] leading-[0.98] font-normal tracking-[-0.02em] md:text-[clamp(64px,7vw,104px)]">
          <span className="block whitespace-nowrap">
            <span data-split>Find the</span> <WordRotator />
          </span>
          <span data-split className="block text-balance">
            already looking for you.
          </span>
        </h1>
        <p
          data-hero-fade
          className="mt-6 max-w-[34em] text-[16px] leading-relaxed font-light text-ink-2 md:text-[17px]"
        >
          Sparrow reads public conversations for posts that match what you offer
          or what you&apos;re searching for, scores how serious each one is, and
          puts the best ones in front of you.
        </p>
        <div
          data-hero-fade
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          <Link
            href={isSignedIn ? "/dashboard" : "/sign-up"}
            className="inline-flex h-12 items-center rounded-xl bg-linear-to-b from-[#ff3446] to-r2 px-6 text-[14.5px] font-medium text-white shadow-[0_10px_40px_-10px_rgba(255,36,56,0.7),inset_0_1px_0_rgba(255,255,255,0.25)] transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-[0_14px_50px_-8px_rgba(255,36,56,0.9),inset_0_1px_0_rgba(255,255,255,0.25)]"
          >
            {isSignedIn ? "Open your dashboard" : "Start free"}
          </Link>
          <a
            href="#how"
            className="inline-flex h-12 items-center rounded-xl border border-white/12 bg-white/3 px-6 text-[14.5px] font-medium text-ink transition-colors hover:bg-white/7"
          >
            See how it works
          </a>
        </div>
        <div data-hero-fade className="mt-14 w-full">
          <SignalStack onHot={() => auroraRef.current?.pulse()} />
        </div>
      </div>
    </section>
  );
}
