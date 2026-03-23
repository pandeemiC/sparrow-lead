"use client";

import { useRef, useEffect } from "react";
import { Target } from "lucide-react";
import { CanvasText } from "@/components/ui/canvas-text";
import HeroCards from "@/components/ui/HeroCards";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1;
    }
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/sparrow-1080.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/70 z-0" />
      <div className="container-main relative z-10 flex flex-col md:flex-row items-center justify-between gap-32">
        <div className="flex-1 space-y-2">
          <h2 className="text-xl md:text-2xl tracking-tight text-white">
            Find Leads Before Your Competitors
          </h2>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            <span className="text-white">Meet </span>
            <CanvasText
              text="Sparrow"
              className="font-serif font-light italic"
              backgroundClassName="bg-sparrow-bright"
              colors={[
                "rgba(255, 255, 255, 0.5)",
                "rgba(255, 255, 255, 0.45)",
                "rgba(255, 255, 255, 0.4)",
                "rgba(255, 255, 255, 0.35)",
                "rgba(255, 255, 255, 0.3)",
                "rgba(255, 255, 255, 0.25)",
                "rgba(255, 255, 255, 0.2)",
                "rgba(255, 255, 255, 0.15)",
                "rgba(255, 255, 255, 0.1)",
                "rgba(255, 255, 255, 0.05)",
              ]}
              lineGap={4}
              animationDuration={20}
            />
          </h1>
          <h3 className="text-lg text-white/50 max-w-md">
            AI-powered social listener that finds people asking for exactly what
            you are looking to share — on Reddit, Twitter, HackerNews, Youtube
            and Linkedin.
          </h3>

          <div className="flex items-center gap-4 pt-4">
            <div className="relative group">
              <button
                disabled
                className="flex items-center gap-2 bg-white/20 text-white/50 font-bold text-sm px-6 py-3 rounded-lg cursor-not-allowed"
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
