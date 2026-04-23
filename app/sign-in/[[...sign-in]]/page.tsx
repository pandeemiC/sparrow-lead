"use client";

import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import { motion } from "motion/react";

const clerkAppearance = {
  variables: {
    colorBackground: "transparent",
    colorInputBackground: "rgba(255,255,255,0.04)",
    colorInputText: "#ededed",
    colorText: "#ededed",
    colorTextSecondary: "rgba(255,255,255,0.35)",
    colorPrimary: "#fffffff",
    colorDanger: "#ff5555",
    borderRadius: "0.5rem",
    fontFamily: "var(--font-montserrat), sans-serif",
    fontSize: "13px",
  },
  elements: {
    // check clerk docs for elements
    rootBox: "w-full",
    card: "shadow-none bg-transparent p-0 gap-5",
    cardBox: "shadow-none w-full",
    headerTitle: "text-white text-xl font-semibold tracking-tight",
    headerSubtitle: "text-white/35 text-xs",
    socialButtonsBlockButton:
      "border border-white/10 bg-white/4 text-white/60 hover:bg-white/8 hover:text-white hover:border-white/20 transition-all text-xs font-medium rounded-lg",
    dividerLine: "bg-white/8",
    dividerText: "text-white/25 text-[11px]",
    formFieldLabel:
      "text-white/45 text-[11px] font-medium uppercase tracking-wider mb-1",
    formFieldInput:
      "bg-white/4 border border-white/10 text-white placeholder:text-white/20 text-xs rounded-lg focus:border-white/25 focus:bg-white/6 transition-all outline-none",
    formButtonPrimary:
      "bg-white text-[#0a0a0a] text-xs font-semibold rounded-lg hover:bg-white/90 transition-colors mt-1",
    footerActionText: "text-white/30 text-xs",
    footerActionLink:
      "text-white/70 hover:text-white text-xs font-medium transition-colors",
    alert: "bg-red-500/8 border border-red-500/15 rounded-lg",
    alertText: "text-red-400 text-xs",
    formFieldErrorText: "text-red-400 text-[11px]",
  },
};

function SparrowRightPanel() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
      <div
        className="absolute inset-0"
        style={{
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E") center / 200px 200px repeat, #080808`,
          backgroundBlendMode: "soft-light, normal",
        }}
      />

      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 480,
          height: 480,
          background:
            "radial-gradient(ellipse at center, rgba(175,4,4,0.13) 0%, rgba(140,0,0,0.06) 40%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
        animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
      />

      <div className="relative z-10 flex flex-col items-center text-center gap-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Image
            src="/sparrow-no-text-logo.png"
            alt="Sparrow"
            width={72}
            height={72}
            className="opacity-90"
            style={{
              filter: "drop-shadow(0 0 24px rgba(220,30,30,0.35))",
            }}
          />
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
        >
          <h2 className="text-2xl font-semibold text-white/90 tracking-tight">
            Find every signal
          </h2>
          <p className="text-sm text-white/30 leading-relaxed max-w-xs">
            AI-powered social listener that surfaces any intent before your
            competitors even notice.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          {[
            "Reddit threads monitored 24/7",
            "Hacker News deal signals surfaced",
            "AI-Scored leads, ready to reply",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-1 h-1 rounded-full bg-sparrow-red opacity-70" />
              <span className="text-[11px] text-white/25">{item}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <div
        className="absolute top-0 left-0 bottom-0 w-px"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent)",
        }}
      />
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn />
    </div>
  );
}
