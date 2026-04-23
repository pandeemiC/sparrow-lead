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

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn />
    </div>
  );
}
