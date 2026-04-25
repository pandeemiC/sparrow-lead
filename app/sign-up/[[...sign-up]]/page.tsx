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

  async function handleVerfiy(e: React.FormEvent<HTMLFormElement>) {
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

  return;
}
