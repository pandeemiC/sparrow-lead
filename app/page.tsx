"use client";

import { Target } from "lucide-react";
import { FaRedditAlien, FaXTwitter, FaYCombinator } from "react-icons/fa6";

export default function Home() {
  return (
    <section className="min-h-screen flex items-center pt-20">
      <div className="container-main flex flex-col md:flex-row items-center justify-between gap-16">
        <div className="flex-1 space-y-2">
          <h2 className="text-xl md:text-2xl tracking-tight text-white">
            Find Leads Before Your Competitors
          </h2>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            <span className="text-white">Meet </span>
            <span className=" font-serif font-light italic text-white">
              Sparrow
            </span>
          </h1>
          <h3 className="text-lg text-white/50 max-w-md">
            AI-powered social listener that finds people asking for exactly what
            you are looking to share — on Reddit, Twitter, and HackerNews.
          </h3>

          <div className="flex items-center gap-4 pt-4">
            <div className="relative group">
              <button
                disabled
                className="flex items-center gap-2 bg-sparrow-red/50 text-white/50 font-bold text-sm px-6 py-3 rounded-lg cursor-not-allowed"
              >
                <Target size={16} />
                Start Hunting
              </button>
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/10 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Coming Soon
              </span>
            </div>
            <div className="relative group">
              <button
                disabled
                className="flex items-center gap-2 border border-white/10 text-white/30 font-bold text-sm px-6 py-3 rounded-lg cursor-not-allowed"
              >
                View Dashboard
              </button>
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/10 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Coming Soon
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 hidden md:block">
          <div className="fade-mask">
            <div className="grid grid-cols-2 gap-4">
              <div className="signal-card transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FaRedditAlien className="bg-orange-600 rounded-sm text-white" />
                    <span className="text-white/40 text-xs">r/startups</span>
                  </div>
                  <span className="text-[9px] bg-sparrow-red/20 text-sparrow-bright px-2 py-0.5 rounded-full font-bold uppercase">
                    High
                  </span>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">
                  &quot;We&apos;ve been using Asana but it&apos;s too complex
                  for our 5-person team. Any alternatives?&quot;
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                    92% match
                  </span>
                  <span className="text-[10px] text-white/30">
                    Signal hunted 2m ago
                  </span>
                </div>
              </div>

              <div className="signal-card transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FaXTwitter className="text-white" />
                    <span className="text-white/40 text-xs">@founder_mike</span>
                  </div>
                  <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-bold uppercase">
                    Medium
                  </span>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">
                  &quot;Looking for a lightweight PM tool that doesn&apos;t
                  require a PhD to set up. Suggestions?&quot;
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                    87% match
                  </span>
                  <span className="text-[10px] text-white/30">
                    Signal hunted 8m ago
                  </span>
                </div>
              </div>

              <div className="signal-card transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FaYCombinator className="text-orange-300 text-base" />
                    <span className="text-white/40 text-xs">Hacker News</span>
                  </div>
                  <span className="text-[9px] bg-sparrow-red/20 text-sparrow-bright px-2 py-0.5 rounded-full font-bold uppercase">
                    High
                  </span>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">
                  &quot;Ask HN: What do you use for managing small team projects
                  without the bloat?&quot;
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                    78% match
                  </span>
                  <span className="text-[10px] text-white/30">
                    Signal hunted 14m ago
                  </span>
                </div>
              </div>

              <div className="signal-card transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FaRedditAlien className="bg-orange-600 rounded-sm text-white" />
                    <span className="text-white/40 text-xs">r/SaaS</span>
                  </div>
                  <span className="text-[9px] bg-white/10 text-white/40 px-2 py-0.5 rounded-full font-bold uppercase">
                    Low
                  </span>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">
                  &quot;Any recommendations for tools that help track social
                  mentions of your brand?&quot;
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] bg-white/10 text-white/40 px-2 py-0.5 rounded-full">
                    64% match
                  </span>
                  <span className="text-[10px] text-white/30">
                    Signal hunted 22m ago
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
