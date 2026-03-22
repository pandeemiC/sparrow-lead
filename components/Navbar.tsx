"use client";

import Image from "next/image";
import Link from "next/link";
import sparrowLogo from "@/public/sparrow-no-text-logo.png";

export default function Navbar() {
  return (
    <div className="fixed top-5 left-0 right-0 overflow-x-hidden z-50">
      <div className="flex items-center justify-between w-full max-w-6xl bg-neutral-700/20 mx-auto h-14 px-6 obsidian-glass rounded-full border border-white/10">
        <Link href="/" className="flex items-center">
          <Image src={sparrowLogo} alt="Sparrow Logo" width={50} height={50} style={{ width: "auto", height: "auto" }} />
          <span className="text-white text-xl font-serif italic tracking-tighter">
            Sparrow
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#"
            className="text-[11px] text-white/70 uppercase font-bold tracking-widest hover:text-white transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="#"
            className="text-[11px] text-white/70 uppercase font-bold tracking-widest hover:text-white transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="#"
            className="text-[11px] text-white/70 uppercase font-bold tracking-widest hover:text-white transition-colors"
          >
            About Us
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="#"
            className="hidden sm:block text-[11px] text-white/60 uppercase tracking-widest hover:text-white transition-colors"
          >
            Log In
          </Link>
          <button className="flex items-center cursor-pointer gap-2 bg-sparrow-red hover:bg-sparrow-bright text-white text-[11px] font-bold uppercase tracking-widest px-5 py-2 rounded-lg transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
