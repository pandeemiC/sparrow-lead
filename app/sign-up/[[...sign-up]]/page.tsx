"use client";

import Link from "next/link";
import { useSignUp, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaGithub } from "react-icons/fa";
import AuthFrame, { SPARROW_LEDE } from "@/components/sp/AuthFrame";

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
          <div className="sp-glass-head">
            <div className="sp-glass-title">Create account</div>
            <div className="sp-glass-sub">Free plan</div>
          </div>

          {error && <div className="sp-auth-error">{error}</div>}

          <div className="sp-sso">
            <button type="button" onClick={() => handleOAuth("oauth_google")}>
              <GoogleIcon />
              Google
            </button>
            <button type="button" onClick={() => handleOAuth("oauth_github")}>
              <FaGithub size={15} />
              GitHub
            </button>
          </div>

          <div className="sp-divider">or with email</div>

          <form onSubmit={handleSubmit}>
            <div className="sp-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@studio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="sp-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="reveal"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="sp-field">
              <label htmlFor="confirm">Confirm password</label>
              <input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="reveal"
                onClick={() => setShowConfirm((v) => !v)}
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
            <div id="clerk-captcha" />
            <button className="sp-submit" type="submit" disabled={loading}>
              {loading ? (
                "Creating account…"
              ) : (
                <>
                  Create account<span className="arrow">→</span>
                </>
              )}
            </button>
          </form>

          <div className="sp-footnote">
            Already hunting? <Link href="/sign-in">Sign in</Link>
          </div>
        </>
      ) : (
        <>
          <div className="sp-glass-head">
            <div className="sp-glass-title">Check your email</div>
            <div className="sp-glass-sub">Step 2 of 2</div>
          </div>
          <p className="sp-hint" style={{ margin: "0 0 20px" }}>
            We sent a 6-digit code to {email}.
          </p>

          {error && <div className="sp-auth-error">{error}</div>}

          <form onSubmit={handleVerify}>
            <div className="sp-field">
              <label htmlFor="code">Verification code</label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                maxLength={6}
                style={{ letterSpacing: "0.4em", fontFamily: "var(--mono)" }}
                required
              />
            </div>
            <button className="sp-submit" type="submit" disabled={loading}>
              {loading ? (
                "Verifying…"
              ) : (
                <>
                  Verify<span className="arrow">→</span>
                </>
              )}
            </button>
          </form>

          <div className="sp-footnote">
            <button
              type="button"
              onClick={() => {
                setStep("register");
                setError("");
                setCode("");
              }}
              style={{
                border: 0,
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              ← Use a different email
            </button>
          </div>
        </>
      )}
    </AuthFrame>
  );
}
