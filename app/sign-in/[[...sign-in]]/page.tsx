"use client";

import { useSignIn, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

export default function SignInPage() {
  const { signIn } = useSignIn();
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      window.location.href = "/dashboard";
    }
  }, [isLoaded, isSignedIn]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: pwErr } = await signIn.password({
      identifier: email,
      password,
    });
    if (pwErr) {
      setError(pwErr.message ?? "Invalid email or password.");
      setLoading(false);
      return;
    }

    const { error: finalErr } = await signIn.finalize({
      navigate: ({ decorateUrl }) => router.push(decorateUrl("/dashboard")),
    });
    if (finalErr) {
      setError(finalErr.message ?? "Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  async function handleOAuth(strategy: "oauth_google" | "oauth_github") {
    await signIn.sso({
      strategy,
      redirectUrl: "/dashboard",
      redirectCallbackUrl: "/sso-callback",
    });
  }

  return (
    <AuthFrame
      lede={SPARROW_LEDE}
      topLink={{ href: "/sign-up", label: "Create account →" }}
    >
      <div className="sp-glass-head">
        <div className="sp-glass-title">Sign in</div>
        <div className="sp-glass-sub">Welcome back</div>
      </div>

      {error && <div className="sp-auth-error">{error}</div>}

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
            autoComplete="current-password"
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
        <button className="sp-submit" type="submit" disabled={loading}>
          {loading ? (
            "Signing in…"
          ) : (
            <>
              Continue<span className="arrow">→</span>
            </>
          )}
        </button>
      </form>

      <div className="sp-divider">or</div>

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

      <div className="sp-footnote">
        New to Sparrow? <Link href="/sign-up">Create an account</Link>
      </div>
    </AuthFrame>
  );
}
