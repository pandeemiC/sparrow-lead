"use client";

import { useRef, useState } from "react";
import {
  Briefcase,
  Code2,
  TrendingUp,
  GraduationCap,
  User,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import AuthFrame from "@/components/sp/AuthFrame";
import {
  AuthError,
  AuthTextarea,
  BackButton,
  ButtonRow,
  Field,
  GlassHead,
  Hint,
  SubmitButton,
} from "@/components/sp/auth";
import { cn } from "@/lib/utils";

const roles = [
  { value: "founder", label: "Founder / Business Owner", icon: Briefcase },
  { value: "developer", label: "Developer", icon: Code2 },
  { value: "marketer", label: "Marketer / Growth", icon: TrendingUp },
  { value: "student", label: "Student", icon: GraduationCap },
  { value: "other", label: "Other", icon: User },
];

const STEPS = [
  {
    title: "What best describes you?",
    hint: "This helps Sparrow tailor how it reads posts for you.",
  },
  {
    title: "What are you building?",
    hint: "Describe your product or service in a sentence or two.",
  },
  {
    title: "What are you hunting for?",
    hint: "The more specific, the smarter your listener.",
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [listenerContext, setListenerContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        bodyRef.current,
        { opacity: 0, x: 14 },
        { opacity: 1, x: 0, duration: 0.4, ease: "power3.out" },
      );
      gsap.to("[data-step-fill]", {
        scaleX: (i: number) => (i < step ? 1 : 0),
        duration: 0.5,
        ease: "power3.out",
      });
    },
    { dependencies: [step] },
  );

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, description, listenerContext }),
      });
      if (!res.ok) throw new Error("Onboarding failed");
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      setError("We couldn't save your answers. Please try again.");
      setLoading(false);
    }
  }

  const current = STEPS[step - 1];

  return (
    <AuthFrame
      lede={{
        eyebrow: "Setup · 3 quick questions",
        title: (
          <>
            Teach Sparrow <em>what to hunt.</em>
          </>
        ),
        body: "Your answers go straight into the AI that scores every post, so it can tell a real buyer from background noise. You can change them later in Settings.",
      }}
    >
      <div className="mb-6.5 flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <i
            key={s}
            className="relative h-0.5 flex-1 overflow-hidden rounded-[2px] bg-white/12"
          >
            <b
              data-step-fill
              className="absolute inset-0 origin-left bg-linear-to-r from-r2 to-r1"
              style={{ transform: `scaleX(${s <= step ? 1 : 0})` }}
            />
          </i>
        ))}
      </div>

      <GlassHead
        title={current.title}
        sub={`Step ${step} of 3`}
        titleClassName="text-[26px] leading-none"
      />
      <Hint className="-mt-3 mb-5">{current.hint}</Hint>

      {error && <AuthError>{error}</AuthError>}

      <div ref={bodyRef}>
        {step === 1 && (
          <>
            <div className="grid grid-cols-1 gap-2 min-[561px]:grid-cols-2">
              {roles.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/20 px-3.5 py-3.25 text-left font-body text-[13px] leading-[normal] font-normal text-white/60 transition-all duration-150 hover:border-white/22 hover:text-white",
                    role === value &&
                      "border-r1/55 bg-r1/12 text-white shadow-[0_0_0_4px_rgba(255,36,56,0.08)] hover:border-r1/55",
                  )}
                  onClick={() => setRole(value)}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>
            <ButtonRow className="mt-5">
              <SubmitButton
                className="flex-[2]"
                onClick={() => setStep(2)}
                disabled={!role}
              >
                Continue
              </SubmitButton>
            </ButtonRow>
          </>
        )}

        {step === 2 && (
          <>
            <Field>
              <AuthTextarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="e.g. I'm building a client portal for freelance designers and looking for early users…"
              />
            </Field>
            <ButtonRow>
              <BackButton onClick={() => setStep(1)}>Back</BackButton>
              <SubmitButton
                className="flex-[2]"
                onClick={() => setStep(3)}
                disabled={description.trim().length < 10}
              >
                Continue
              </SubmitButton>
            </ButtonRow>
          </>
        )}

        {step === 3 && (
          <>
            <Field>
              <AuthTextarea
                value={listenerContext}
                onChange={(e) => setListenerContext(e.target.value)}
                rows={5}
                placeholder="e.g. People frustrated with their current tools, asking for alternatives, or describing pain around team collaboration…"
              />
            </Field>
            <Hint>
              This is fed directly to the AI when it scores your signals.
            </Hint>
            <ButtonRow>
              <BackButton onClick={() => setStep(2)}>Back</BackButton>
              <SubmitButton
                className="flex-[2]"
                onClick={handleSubmit}
                disabled={listenerContext.trim().length < 10 || loading}
                arrow={!loading}
              >
                {loading ? "Setting up…" : "Start hunting"}
              </SubmitButton>
            </ButtonRow>
          </>
        )}
      </div>
    </AuthFrame>
  );
}
