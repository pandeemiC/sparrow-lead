"use client";

import { useClerk, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import Image from "next/image";
import { motion } from "motion/react";

const LETTERS = "SPARROW".split("");

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    handleRedirectCallback({}, async () => {
      window.location.href = "/dashboard";
    }).catch(() => {
      window.location.href = "/sign-in";
    });
  }, [handleRedirectCallback]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      window.location.href = "/dashboard";
    }
  }, [isLoaded, isSignedIn]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center gap-8"
      style={{
        background:
          "radial-gradient(ellipse at 40% 30%, rgba(180,10,10,0.25) 0%, transparent 60%), #0a0202",
        fontFamily: "var(--font-montserrat), sans-serif",
      }}
    >
      <Image
        src="/sparrow-no-text-logo.png"
        alt="Sparrow"
        width={72}
        height={72}
        style={{
          filter: "drop-shadow(0 0 22px rgba(210, 43, 43, 0.65))",
        }}
      />

      <div className="flex items-center gap-0.75">
        {LETTERS.map((letter, i) => (
          <motion.span
            key={i}
            className="text-[13px] font-semibold uppercase tracking-[0.3em]"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              delay: i * 0.12,
              ease: "easeInOut",
            }}
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            {letter}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
