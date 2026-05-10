"use client";

import { useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Code2,
  TrendingUp,
  GraduationCap,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import AnimatedBackground from "@/components/ui/AnimatedBackground";

const roles = [
  { value: "founder", label: "Founder / Business Owner", icon: Briefcase },
  { value: "developer", label: "Developer", icon: Code2 },
  { value: "marketer", label: "Marketer / Growth", icon: TrendingUp },
  { value: "student", label: "Student", icon: GraduationCap },
  { value: "other", label: "Other", icon: User },
];

export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [listenerContext, setListenerContext] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, description, listenerContext }),
    });
    router.push("/dashboard");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <AnimatedBackground />
      <div className="absolute top-10 left-10 inline-flex gap-2">
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

      <motion.div
        className="relative z-10 auth-glass w-full max-w-lg mx-4 rounded-2xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="flex flex-col items-center mb-7">
          <div className="relative flex justify-center h-[100px] mb-6">
            <Link href="/">
              <Image
                src="/sparrow-no-text-logo.png"
                alt="Sparrow"
                width={140}
                height={140}
                className="relative top-0 left-1/2 -translate-x-1/2 opacity-90 [filter:brightness(1)_drop-shadow(0_0_18px_rgba(210,43,43,0.6))]"
              />
            </Link>
            <h1 className="absolute -bottom-3 text-[16px] font-semibold uppercase tracking-[0.22em] text-white/35">
              Sparrow
            </h1>
          </div>
          <h2 className="text-[21px] font-bold text-white tracking-tight mt-3">
            {step === 1 && "What best describes you?"}
            {step === 2 && "Tell us about your project"}
            {step === 3 && "What are you hunting for?"}
          </h2>
          <p className="text-[11px] text-white/30 mt-1">
            {step === 1 && "This helps us tailor your experience."}
            {step === 2 && "What are you building or working on?"}
            {step === 3 && "The more specific, the smarter your listener."}
          </p>
        </div>

        <div className="flex items-center mb-6">
          {[1, 2, 3].map((s, i) => (
            <Fragment key={s}>
              {i > 0 && (
                <div
                  className={`flex-1 h-px transition-colors duration-500 ${
                    step > i ? "bg-red-600" : "bg-white/10"
                  }`}
                />
              )}
              <div
                className={`shrink-0 rounded-full transition-all duration-500 ${
                  step === s
                    ? "w-2.5 h-2.5 bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.7)]"
                    : step > s
                      ? "w-2 h-2 bg-red-600"
                      : "w-2 h-2 bg-white/15"
                }`}
              />
            </Fragment>
          ))}
        </div>

        {/* role */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2">
              {roles.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setRole(value)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-lg border cursor-pointer text-left transition-all ${
                    role === value
                      ? "border-red-600/50 bg-red-600/10 text-white"
                      : "border-white/8 bg-white/2 text-white/40 hover:border-white/15 hover:text-white/70"
                  }`}
                >
                  <Icon size={15} className="shrink-0" />
                  <span className="text-[12px] font-medium">{label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!role}
              className="w-full h-10 rounded-lg auth-btn-primary text-[13px] font-semibold transition-opacity disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {/* tailored desc */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. I'm building a client portal for freelance designers and looking to find potential early users..."
              rows={4}
              className="w-full px-3.5 py-3 rounded-lg auth-input text-[13px] text-white placeholder:text-white/20 focus:outline-none resize-none"
            />
            <div className="flex gap-2.5">
              <button
                onClick={() => setStep(1)}
                className="flex-1 h-10 rounded-lg auth-btn-secondary text-[12px] cursor-pointer font-medium text-white/60 hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={description.trim().length < 10}
                className="flex-2 h-10 rounded-lg auth-btn-primary cursor-pointer text-[13px] font-semibold transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}
        {/* context */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <textarea
              value={listenerContext}
              onChange={(e) => setListenerContext(e.target.value)}
              placeholder="e.g. People expressing frustration with their current tools, asking for alternatives, or mentioning pain points around team collaboration..."
              rows={5}
              className="w-full px-3.5 py-3 rounded-lg auth-input text-[13px] text-white placeholder:text-white/20 focus:outline-none resize-none"
            />
            <p className="text-[11px] text-white/25">
              This is fed directly to the AI when scoring signals which makes
              results specificly tailored to you.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setStep(2)}
                className="flex-1 h-10 rounded-lg auth-btn-secondary text-[12px] cursor-pointer font-medium text-white/60 hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={listenerContext.trim().length < 10 || loading}
                className="flex-2 h-10 rounded-lg auth-btn-primary text-[13px] cursor-pointer font-semibold transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {loading ? "Setting up..." : "Start hunting →"}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-[10px] text-white/20 mt-5 uppercase tracking-widest">
          Step {step} of 3
        </p>
      </motion.div>
    </div>
  );
}
