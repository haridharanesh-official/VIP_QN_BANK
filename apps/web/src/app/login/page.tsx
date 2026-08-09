"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { authErrorMessage } from "../../lib/auth-errors";
import { createClient } from "../../lib/supabase/client";
import { BrandLogo } from "../../components/brand/BrandLogo";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Alert } from "../../components/ui/Alert";

interface AuthResult {
  readonly memberships: readonly { readonly institutionId: string }[];
}

export default function LoginPage(): ReactElement {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const supabase = createClient();

    let email = String(form.get("email") ?? "").trim();
    if (email && !email.includes("@")) {
      email = `${email}@vip-maths.local`;
    }
    const password = String(form.get("password") ?? "");

    try {
      // 1. Attempt Supabase Auth login
      const { data: supabaseData, error: signInError } = await supabase.auth
        .signInWithPassword({ email, password })
        .catch(() => ({ data: null, error: new Error("Supabase auth unavailable") }));

      if (!signInError && supabaseData?.session) {
        const result = await api<AuthResult>("/auth/me", {}, false);
        if (result.memberships?.[0]) {
          localStorage.setItem("edugen_institution_id", result.memberships[0].institutionId);
          router.replace("/dashboard");
          router.refresh();
          return;
        }
      }

      // 2. Fallback to API local Auth login (Argon2id + seeded dev accounts)
      const legacyResult = await api<AuthResult>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        },
        false
      );

      if (legacyResult?.memberships?.[0]) {
        localStorage.setItem("edugen_institution_id", legacyResult.memberships[0].institutionId);
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      throw signInError || new Error("Invalid username or password.");
    } catch (cause) {
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
      const code =
        cause && typeof cause === "object" && "code" in cause ? String(cause.code) : undefined;
      setError(
        authErrorMessage(code, cause instanceof Error ? cause.message : "Sign in failed.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-container">
        <div className="auth-brand-panel">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <BrandLogo size="md" showLink={false} />
          </div>
          <div className="auth-brand-panel-content">
            <h2>Teacher Workspace</h2>
            <p>
              Access your institution question bank, reusable exam blueprints, and
              deterministic paper generator.
            </p>
            <span className="slogan-badge">Inspiration is not a word</span>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-header">
            <h1>Welcome back</h1>
            <p>Sign in to your VIP Maths teacher workspace.</p>
          </div>

          <form onSubmit={submit} className="form-stack">
            {error && <Alert variant="danger">{error}</Alert>}

            <Input
              label="Username or Email"
              name="email"
              type="text"
              autoComplete="username"
              placeholder={process.env.NODE_ENV === "development" ? "owner or owner@vip-maths.local" : "you@school.edu.in"}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••••••"
              required
            />

            <Button type="submit" loading={loading} size="lg" className="w-full">
              {loading ? "Signing in…" : "Sign in to workspace"}
            </Button>

            <p className="auth-footer-text">
              New to VIP Maths?{" "}
              <Link href="/register" style={{ fontWeight: 600 }}>
                Create an institution account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
