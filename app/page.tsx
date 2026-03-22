"use client";

import { Target } from "lucide-react";

export default function Home() {
  return (
    <section className="min-h-screen flex items-center justify-enter px-6 pt-24">
      <div className="max-w-6xl w-full flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 space-y-6">
          <h2>Find Leads Before Your Competitors</h2>
          <h1>Meet Sparrow</h1>
          <h3>
            AI-powered social listener that finds people asking for exactly what
            you are looking to share — on Reddit, Twitter, and HackerNews.
          </h3>

          <div className="flex items-center gap-4 pt-4">
            <Target size={16} />
            <button className="">Start Hunting</button>
            <button className="">View Dashboard</button>
          </div>
        </div>

        <div className="flex-1 relative h-100"></div>
      </div>
    </section>
  );
}
