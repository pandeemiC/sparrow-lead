"use client";

import Image from "next/image";
import Link from "next/link";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff } from "lucide-react";
import { FaGithub } from "react-icons/fa";

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`;

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="15"
      height="15"
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.9 11.9 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917"
      />
    </svg>
  );
}

function AnimatedBackground() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "#0a0202" }}
    >
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 750,
          height: 750,
          background:
            "radial-gradient(ellipse at center, rgba(210,18,18,0.72) 0%, rgba(160,0,0,0.3) 45%, transparent 70%)",
          filter: "blur(80px)",
          top: "-15%",
          left: "-10%",
        }}
        animate={{
          x: [0, 60, -30, 40, 0],
          y: [0, -60, 40, -20, 0],
          scale: [1, 1.1, 0.92, 1.06, 1],
        }}
        transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 600,
          height: 600,
          background:
            "radial-gradient(ellipse at center, rgba(170,8,8,0.6) 0%, rgba(110,0,0,0.22) 50%, transparent 72%)",
          filter: "blur(70px)",
          bottom: "-15%",
          right: "-20%",
        }}
        animate={{
          x: [0, -50, 30, -40, 0],
          y: [0, 50, -35, 20, 0],
          scale: [1, 0.9, 1.12, 0.96, 1],
        }}
        transition={{
          duration: 11,
          ease: "easeInOut",
          repeat: Infinity,
          delay: 1.5,
        }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 450,
          height: 450,
          background:
            "radial-gradient(ellipse at center, rgba(230,30,30,0.45) 0%, rgba(180,0,0,0.15) 55%, transparent 75%)",
          filter: "blur(60px)",
          top: "35%",
          left: "30%",
        }}
        animate={{
          x: [0, 40, -55, 20, 0],
          y: [0, -40, 55, -15, 0],
          scale: [1, 1.14, 0.88, 1.08, 1],
        }}
        transition={{
          duration: 7,
          ease: "easeInOut",
          repeat: Infinity,
          delay: 3,
        }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 350,
          height: 350,
          background:
            "radial-gradient(ellipse at center, rgba(255,40,40,0.35) 0%, rgba(200,0,0,0.1) 60%, transparent 78%)",
          filter: "blur(50px)",
          top: "60%",
          left: "55%",
        }}
        animate={{
          x: [0, -35, 45, -20, 0],
          y: [0, 45, -30, 10, 0],
          scale: [1, 1.08, 0.94, 1.04, 1],
        }}
        transition={{
          duration: 6,
          ease: "easeInOut",
          repeat: Infinity,
          delay: 4.5,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: GRAIN_SVG,
          backgroundSize: "256px 256px",
          backgroundRepeat: "repeat",
          mixBlendMode: "overlay",
          opacity: 0.55,
        }}
      />
    </div>
  );
}

export default function SignUpPage() {
  const { signUp } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 2step verification
  const [step, setStep] = useState<"register" | "verify">("register");
  const [code, setCode] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    const { error: pwError } = await signUp.password({
      emailAddress: email,
      password,
    });

    if (pwError) {
      setError(pwError.message ?? "Something went wrong. Please try again");
      setLoading(false);
      return;
    }

    if (signUp.status === "missing_requirements") {
      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setError(
          sendError.message ??
            "Failed to send verification email. Please try again.",
        );
        setLoading(false);
        return;
      }
      setStep("verify");
    } else {
      const { error: finalError } = await signUp.finalize({
        navigate: ({ decorateUrl }) => router.push(decorateUrl("/dashboard")),
      });
      if (finalError) {
        setError(
          finalError.message ?? "Something went wrong. Please try again.",
        );
      }
    }
    setLoading(false);
  }

  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: verifyError } = await signUp.verifications.verifyEmailCode({
      code,
    });

    if (verifyError) {
      setError(verifyError.message ?? "Invalid code. Please try again.");
      setLoading(false);
      return;
    }
    const { error: finalError } = await signUp.finalize({
      navigate: ({ decorateUrl }) => router.push(decorateUrl("/dashboard")),
    });
    if (finalError) {
      setError(finalError.message ?? "Something went wrong. Please try again.");
    }

    setLoading(false);
  }

  // oauth
  async function handleOAuth(strategy: "oauth_google" | "oauth_github") {
    await signUp.sso({
      strategy,
      redirectUrl: `${window.location.origin}/sso-callback`,
      redirectCallbackUrl: "/dashboard",
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex"
      style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
    >
      <AnimatedBackground />

      <div className="relative z-10 flex w-full">
        <div className="hidden lg:flex lg:w-[50%] flex-col justify-between p-12">
          <Link href="/">
            <div className="flex items-center gap-2">
              <Image
                src="/sparrow-no-text-logo.png"
                alt="Sparrow"
                width={18}
                height={18}
                className="opacity-65"
              />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                Sparrow
              </span>
            </div>
          </Link>

          <motion.div
            className="flex flex-col gap-5"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
              AI Social Listener
            </p>
            <h2 className="text-5xl font-semibold text-white/80 leading-[1.1] tracking-tight">
              Every signal.
              <br />
              <span className="text-white/50 font-semibold">Before</span>
              <br />
              they do.
            </h2>
            <p className="text-sm text-white/30 leading-relaxed max-w-72">
              Reddit threads, Hacker News posts — Sparrow surfaces buying intent
              the moment it appears, so you can reach out first.
            </p>
          </motion.div>
        </div>
        <div className="w-full lg:w-[40%] my-10 border-neutral-500/10 rounded-2xl mr-25 border bg-neutral-600/20 flex items-center justify-center p-6 lg:p-12">
          <motion.div
            className="auth-glass w-full max-w-sm rounded-2xl p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            {step === "register" ? (
              <>
                <h2 className="text-[21px] font-bold text-white tracking-tight mt-3">
                  Create your account
                </h2>
                <p className="text-[11px] text-white/30 mt-1">
                  Start finding leads today
                </p>
              </>
            ) : (
              <>
                <h2 className="text-[21px] font-bold text-white tracking-tight mt-3">
                  Check your email
                </h2>
                <p className="text-[11px] text-white/30 mt-1 text-center">
                  Code sent to <span className="text-white/50">{email}</span>
                </p>
              </>
            )}
            {step === "register" && (
              <>
                <div className="flex gap-2.5 mb-5">
                  <button
                    type="button"
                    onClick={() => handleOAuth("oauth_google")}
                    className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg auth-btn-secondary text-[12px] font-medium text-white/60 hover:text-white cursor-pointer transition-colors"
                  >
                    <GoogleIcon />
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOAuth("oauth_github")}
                    className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg auth-btn-secondary text-[12px] font-medium text-white/60 hover:text-white cursor-pointer transition-colors"
                  >
                    <FaGithub size={13} color="#ffffff" />
                    GitHub
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="flex-1 h-px"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  />
                  <span className="text-[10px] text-white/25 uppercase tracking-wider">
                    or
                  </span>
                  <div
                    className="flex-1 h-px"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  />
                </div>
              </>
            )}

            {step === "register" ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full h-10 px-3.5 rounded-lg auth-input text-[13px] text-white placeholder:text-white/20 focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full h-10 px-3.5 pr-10 rounded-lg auth-input text-[13px] text-white placeholder:text-white/20 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/55 transition-colors"
                    >
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full h-10 px-3.5 pr-10 rounded-lg auth-input text-[13px] text-white placeholder:text-white/20 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/55 transition-colors"
                    >
                      {showConfirm ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-[11px] text-red-400 bg-red-500/8 border border-red-500/15 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 rounded-lg auth-btn-primary cursor-pointer text-[13px] font-semibold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-0.5"
                >
                  {loading ? "Creating account…" : "Create account"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoFocus
                    className="w-full h-10 px-3.5 rounded-lg auth-input text-[13px] text-white placeholder:text-white/20 focus:outline-none transition-colors tracking-[0.3em]"
                  />
                </div>

                {error && (
                  <p className="text-[11px] text-red-400 bg-red-500/8 border border-red-500/15 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 rounded-lg auth-btn-primary cursor-pointer text-[13px] font-semibold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-0.5"
                >
                  {loading ? "Verifying…" : "Verify email"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("register");
                    setError("");
                    setCode("");
                  }}
                  className="text-center text-[11px] text-white/30 hover:text-white/55 transition-colors"
                >
                  Back to sign up
                </button>
              </form>
            )}

            {step === "register" && (
              <p className="text-center text-[11px] text-white/30 mt-5">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="text-white/55 font-semibold hover:text-white transition-colors"
                >
                  Sign in
                </Link>
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
