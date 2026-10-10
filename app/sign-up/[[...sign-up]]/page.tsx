"use client";

import Link from "next/link";
import { useSignUp, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import AuthFrame, { SPARROW_LEDE } from "@/components/sp/AuthFrame";
import {
  AuthError,
  AuthInput,
  Divider,
  Field,
  Footnote,
  GlassHead,
  Hint,
  SsoButtons,
  SubmitButton,
} from "@/components/sp/auth";

export default function SignUpPage() {
  const { signUp } = useSignUp();
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      window.location.href = "/dashboard";
    }
  }, [isLoaded, isSignedIn]);

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
      redirectUrl: "/dashboard",
      redirectCallbackUrl: "/sso-callback",
    });
  }

  return (
    <AuthFrame
      lede={SPARROW_LEDE}
      topLink={{ href: "/sign-in", label: "Sign in →" }}
    >
      {step === "register" ? (
        <>
          <GlassHead title="Create account" sub="Free plan" />

          {error && <AuthError>{error}</AuthError>}

          <SsoButtons onSelect={handleOAuth} />

          <Divider>or with email</Divider>

          <form onSubmit={handleSubmit}>
            <Field label="Email" htmlFor="email">
              <AuthInput
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@studio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Field
              label="Password"
              htmlFor="password"
              reveal={{
                shown: showPassword,
                onToggle: () => setShowPassword((v) => !v),
              }}
            >
              <AuthInput
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
            <Field
              label="Confirm password"
              htmlFor="confirm"
              reveal={{
                shown: showConfirm,
                onToggle: () => setShowConfirm((v) => !v),
              }}
            >
              <AuthInput
                id="confirm"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Field>
            <div id="clerk-captcha" />
            <SubmitButton type="submit" disabled={loading} arrow={!loading}>
              {loading ? "Creating account…" : "Create account"}
            </SubmitButton>
          </form>

          <Footnote>
            Already hunting? <Link href="/sign-in">Sign in</Link>
          </Footnote>
        </>
      ) : (
        <>
          <GlassHead title="Check your email" sub="Step 2 of 2" />
          <Hint className="mt-0 mb-5">We sent a 6-digit code to {email}.</Hint>

          {error && <AuthError>{error}</AuthError>}

          <form onSubmit={handleVerify}>
            <Field label="Verification code" htmlFor="code">
              <AuthInput
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                maxLength={6}
                className="font-mono tracking-[0.4em]"
                required
              />
            </Field>
            <SubmitButton type="submit" disabled={loading} arrow={!loading}>
              {loading ? "Verifying…" : "Verify"}
            </SubmitButton>
          </form>

          <Footnote>
            <button
              type="button"
              onClick={() => {
                setStep("register");
                setError("");
                setCode("");
              }}
              className="border-0 bg-transparent text-inherit"
            >
              ← Use a different email
            </button>
          </Footnote>
        </>
      )}
    </AuthFrame>
  );
}
