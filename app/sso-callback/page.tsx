"use client";

import { useClerk, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import sparrowLogo from "@/public/sparrow-no-text-logo.png";
import AuroraBackground from "@/components/sp/AuroraBackground";

const LETTERS = "SIGNING YOU IN".split("");

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
    <div className="sp-auth" style={{ display: "grid", placeItems: "center" }}>
      <AuroraBackground />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
        }}
      >
        <Image
          src={sparrowLogo}
          alt="Sparrow"
          width={72}
          height={72}
          style={{ filter: "drop-shadow(0 0 22px rgba(210, 43, 43, 0.65))" }}
        />
        <div
          style={{
            display: "flex",
            gap: 3,
            font: "500 12px var(--mono)",
            letterSpacing: "0.3em",
          }}
        >
          {LETTERS.map((letter, i) => (
            <motion.span
              key={i}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                delay: i * 0.08,
                ease: "easeInOut",
              }}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}
