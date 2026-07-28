"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

function withRedirect(href: string, redirect: string) {
  if (!redirect || redirect === "/account") return href;
  const params = new URLSearchParams({ redirect });
  return `${href}?${params.toString()}`;
}

/** Only allow same-origin relative paths (prevents open redirects). */
function safeRedirectPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/account";
  }
  return value;
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const searchParams = useSearchParams();
  const redirect = safeRedirectPath(searchParams.get("redirect"));
  const isCheckout = redirect.startsWith("/checkout");
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;

        // Email confirmation may be required — only continue when a session exists.
        if (!data.session) {
          toast.success("Check your email", {
            description: "Confirm your address, then sign in to continue.",
          });
          return;
        }

        toast.success("Account created", {
          description: isCheckout
            ? "You're signed in — continuing to checkout."
            : "You're all set. Welcome to Naz's Collection.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        toast.success("Signed in", {
          description: isCheckout
            ? "Your bag is ready — continuing to checkout."
            : "Welcome back.",
        });
      }

      // Wait until cookies are readable before hitting protected routes.
      // Soft router.push races middleware and bounces back to /login.
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("Session not ready. Please try signing in again.");
      }

      window.location.assign(redirect);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Authentication failed"
      );
      setLoading(false);
    }
  };

  const title =
    mode === "login"
      ? isCheckout
        ? "Sign in to checkout"
        : "Welcome back"
      : isCheckout
        ? "Create an account to checkout"
        : "Create your account";

  const subtitle =
    mode === "login"
      ? isCheckout
        ? "Your bag is saved. Sign in to place your order."
        : "Sign in to view your orders and wishlist."
      : isCheckout
        ? "Join to complete your order — your bag items stay with you."
        : "Join for private previews and faster checkout.";

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Jane Doe"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="jane@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login"
              ? isCheckout
                ? "Sign in & continue"
                : "Sign in"
              : isCheckout
                ? "Create account & continue"
                : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              New here?{" "}
              <Link
                href={withRedirect("/register", redirect)}
                className="link-gold underline underline-offset-4"
              >
                Create an account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link
                href={withRedirect("/login", redirect)}
                className="link-gold underline underline-offset-4"
              >
                Sign in
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
