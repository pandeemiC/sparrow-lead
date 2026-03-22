"use client";

import { Target } from "lucide-react";
import HeroCards from "@/components/ui/HeroCards";

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
          <HeroCards />
        </div>
      </div>
    </section>
  );
}
