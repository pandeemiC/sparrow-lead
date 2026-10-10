"use client";

import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import sparrowLogo from "@/public/sparrow-no-text-logo.png";
import AuroraBackground from "@/components/sp/AuroraBackground";

const LETTERS = "SIGNING YOU IN".split("");

// hard navs so the middleware sees the fresh session cookie
function goTo(url: string) {
  window.location.href = url;
}

export default function SSOCallback() {
  const clerk = useClerk();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const hasRun = useRef(false);

  // same steps as clerk's HandleSSOCallback (not exported in our @clerk/nextjs version yet)
  useEffect(() => {
    if (!clerk.loaded || hasRun.current) return;
    hasRun.current = true;

    const toApp = {
      navigate: async ({
        decorateUrl,
      }: {
        decorateUrl: (url: string) => string;
      }) => goTo(decorateUrl("/dashboard")),
    };

    // a function so ts re-reads status after an await (the transfer mutates signIn/signUp)
    const signInDone = () => signIn.status === "complete";
    const signUpDone = () => signUp.status === "complete";

    (async () => {
      // existing user signed in with google/github
      if (signInDone()) return signIn.finalize(toApp);

      // signed up with an account that already exists -> turn it into a sign in
      if (signUp.isTransferable) {
        await signIn.create({ transfer: true });
        if (signInDone()) return signIn.finalize(toApp);
        return goTo("/sign-in");
      }

      // signed in with an account that doesn't exist yet -> turn it into a sign up
      if (signIn.isTransferable) {
        await signUp.create({ transfer: true });
        if (signUpDone()) return signUp.finalize(toApp);
        return goTo("/sign-up");
      }

      if (signUpDone()) return signUp.finalize(toApp);

      const sessionId =
        signIn.existingSession?.sessionId || signUp.existingSession?.sessionId;
      if (sessionId) {
        return clerk.setActive({
          session: sessionId,
          navigate: toApp.navigate,
        });
      }

      goTo("/sign-in");
    })().catch(() => goTo("/sign-in"));
  }, [clerk, clerk.loaded, signIn, signUp]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-auto bg-r4 font-body text-sm leading-normal font-light text-white">
      <div id="clerk-captcha" />
      <AuroraBackground />
      <div className="relative z-2 flex flex-col items-center gap-7">
        <Image
          src={sparrowLogo}
          alt="Sparrow"
          width={72}
          height={72}
          className="drop-shadow-[0_0_22px_rgba(210,43,43,0.65)]"
        />
        <div className="flex gap-[3px] font-mono text-xs leading-[normal] font-medium tracking-[0.3em]">
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
