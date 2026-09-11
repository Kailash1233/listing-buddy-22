import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { signUpBroker, resendConfirmation, requestPasswordReset } from "@/lib/auth.functions";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ mode: z.enum(["login", "signup"]).optional() }),
  head: () => ({
    meta: [
      { title: "Log in or sign up — PropertyGenie for brokers" },
      {
        name: "description",
        content:
          "Access your PropertyGenie broker dashboard to publish property pages and track leads.",
      },
      { property: "og:title", content: "Broker login — PropertyGenie" },
      {
        property: "og:description",
        content: "Publish property microsites and capture buyer enquiries.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const [isSignup, setIsSignup] = useState(mode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) navigate({ to: "/dashboard" });
  }, [loading, session, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (isSignup && password !== confirmPassword) {
      toast.error("Passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      if (isSignup) {
        const result = await signUpBroker({ data: { email, password } });
        if (!result.ok) {
          toast.error(result.message);
          return;
        }
        setAwaitingConfirm(true);
        toast.success("Check your inbox to confirm your email.");
        return;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (/confirm/i.test(error.message)) {
            toast.error("Please confirm your email first — check your inbox.");
            return;
          }
          throw error;
        }
      }
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    const result = await resendConfirmation({ data: { email } });
    if (!result.ok) toast.error(result.message);
    else toast.success("Confirmation email sent again.");
  }

  async function submitForgot(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const result = await requestPasswordReset({ data: { email } });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    setResetSent(true);
  }

  return (
    <div className="hero-gradient flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2 text-lg font-extrabold">
          <Logo />
          PropertyGenie
        </Link>
        <div className="surface p-7">
          {awaitingConfirm ? (
            <div className="text-center">
              <h1 className="text-2xl font-bold">Confirm your email</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a confirmation link to <span className="font-semibold">{email}</span>. Click
                it to confirm your email — you'll be signed in automatically.
              </p>
              <Button variant="outline" className="mt-6 w-full" onClick={resend}>
                Resend confirmation email
              </Button>
              <button
                type="button"
                onClick={() => {
                  setAwaitingConfirm(false);
                  setIsSignup(false);
                }}
                className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                Back to log in
              </button>
            </div>
          ) : resetSent ? (
            <div className="text-center">
              <h1 className="text-2xl font-bold">Check your email</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                If <span className="font-semibold">{email}</span> has a PropertyGenie account, we've
                sent a link to reset the password. It signs you in automatically.
              </p>
              <button
                type="button"
                onClick={() => {
                  setResetSent(false);
                  setForgotMode(false);
                }}
                className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                Back to log in
              </button>
            </div>
          ) : forgotMode ? (
            <>
              <h1 className="text-2xl font-bold">Reset your password</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your email and we'll send you a link to set a new password.
              </p>
              <form onSubmit={submitForgot} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Please wait…" : "Send reset link"}
                </Button>
              </form>
              <button
                type="button"
                onClick={() => setForgotMode(false)}
                className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                Back to log in
              </button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold">
                {isSignup ? "Create your account" : "Welcome back"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {isSignup
                  ? "Publish your first property page in a couple of minutes."
                  : "Log in to your broker dashboard."}
              </p>

              <form onSubmit={submit} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {!isSignup ? (
                      <button
                        type="button"
                        onClick={() => setForgotMode(true)}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground"
                      >
                        Forgot password?
                      </button>
                    ) : null}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                {isSignup ? (
                  <div className="space-y-1.5">
                    <Label htmlFor="confirm-password">Confirm password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirm ? "text" : "password"}
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        aria-label={showConfirm ? "Hide password" : "Show password"}
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                ) : null}
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Please wait…" : isSignup ? "Create account" : "Log in"}
                </Button>
              </form>

              <button
                type="button"
                onClick={() => setIsSignup((v) => !v)}
                className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                {isSignup ? "Already have an account? Log in" : "New here? Create an account"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
