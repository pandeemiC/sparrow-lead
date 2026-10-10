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
      gsap.to(".sp-steps i b", {
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
      <div className="sp-steps">
        {[1, 2, 3].map((s) => (
          <i key={s}>
            <b style={{ transform: `scaleX(${s <= step ? 1 : 0})` }} />
          </i>
        ))}
      </div>

      <div className="sp-glass-head">
        <div className="sp-glass-title" style={{ fontSize: 26 }}>
          {current.title}
        </div>
        <div className="sp-glass-sub">Step {step} of 3</div>
      </div>
      <p className="sp-hint" style={{ margin: "-12px 0 20px" }}>
        {current.hint}
      </p>

      {error && <div className="sp-auth-error">{error}</div>}

      <div ref={bodyRef}>
        {step === 1 && (
          <>
            <div className="sp-roles">
              {roles.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  className={`sp-role ${role === value ? "on" : ""}`}
                  onClick={() => setRole(value)}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>
            <div className="sp-btn-row" style={{ marginTop: 20 }}>
              <button
                className="sp-submit"
                onClick={() => setStep(2)}
                disabled={!role}
              >
                Continue<span className="arrow">→</span>
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="sp-field">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="e.g. I'm building a client portal for freelance designers and looking for early users…"
              />
            </div>
            <div className="sp-btn-row">
              <button className="sp-back" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                className="sp-submit"
                onClick={() => setStep(3)}
                disabled={description.trim().length < 10}
              >
                Continue<span className="arrow">→</span>
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="sp-field">
              <textarea
                value={listenerContext}
                onChange={(e) => setListenerContext(e.target.value)}
                rows={5}
                placeholder="e.g. People frustrated with their current tools, asking for alternatives, or describing pain around team collaboration…"
              />
            </div>
            <p className="sp-hint">
              This is fed directly to the AI when it scores your signals.
            </p>
            <div className="sp-btn-row">
              <button className="sp-back" onClick={() => setStep(2)}>
                Back
              </button>
              <button
                className="sp-submit"
                onClick={handleSubmit}
                disabled={listenerContext.trim().length < 10 || loading}
              >
                {loading ? (
                  "Setting up…"
                ) : (
                  <>
                    Start hunting<span className="arrow">→</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </AuthFrame>
  );
}
