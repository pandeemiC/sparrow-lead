"use client";

import { Target } from "lucide-react";

export default function Home() {
  return (
    <section className="min-h-screen flex items-center justify-enter px-6 pt-20">
      <div className="max-w-6xl w-full flex flex-col md:flex-row items-center">
        <div className="flex-1 space-y-2">
          <h2 className="text-2xl md:text-3xl tracking-tight text-white">
            Find Leads Before Your Competitors
          </h2>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white/70 leading-tight">
            Meet Sparrow
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

        <div className="flex-1 relative h-100 hidden md:block">
          <div className="absolute top-8 left-8 w-72 bg-white/5 border border-white/10 rounded-xl p-5 rotate-[-6deg] shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-xs font-bold">
                R
              </div>
              <span className="text-white/40 text-xs">r/startups</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              &quot;We&apos;ve been using Asana but it&apos;s too complex for
              our 5-person team. Any simpler alternatives?&quot;
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                92% match
              </span>
            </div>
          </div>

          <div className="absolute top-24 left-20 w-72 bg-white/5 border border-white/10 rounded-xl p-5 rotate-[3deg] shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">
                X
              </div>
              <span className="text-white/40 text-xs">@founder_mike</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              &quot;Looking for a lightweight project management tool that
              doesn&apos;t require a PhD to set up. Suggestions?&quot;
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                87% match
              </span>
            </div>
          </div>

          <div className="absolute top-44 left-12 w-72 bg-white/5 border border-white/10 rounded-xl p-5 rotate-[-2deg] shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-orange-600/20 flex items-center justify-center text-orange-300 text-xs font-bold">
                Y
              </div>
              <span className="text-white/40 text-xs">Hacker News</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              &quot;Ask HN: What tools do you use for managing small team
              projects without the bloat?&quot;
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                78% match
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
