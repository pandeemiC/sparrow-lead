"use client";

import { useSignIn, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import AuthFrame, { SPARROW_LEDE } from "@/components/sp/AuthFrame";
import {
  AuthError,
  AuthInput,
  Divider,
  Field,
  Footnote,
  GlassHead,
  SsoButtons,
  SubmitButton,
} from "@/components/sp/auth";

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
      <GlassHead title="Sign in" sub="Welcome back" />

      {error && <AuthError>{error}</AuthError>}

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
            autoComplete="current-password"
            placeholder="••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        <SubmitButton type="submit" disabled={loading} arrow={!loading}>
          {loading ? "Signing in…" : "Continue"}
        </SubmitButton>
      </form>

      <Divider>or</Divider>

      <SsoButtons onSelect={handleOAuth} />

      <Footnote>
        New to Sparrow? <Link href="/sign-up">Create an account</Link>
      </Footnote>
    </AuthFrame>
  );
}
