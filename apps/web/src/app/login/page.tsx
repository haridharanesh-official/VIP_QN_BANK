"use client";
import { useState, type FormEvent, type ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { authErrorMessage } from "../../lib/auth-errors";
import { createClient } from "../../lib/supabase/client";

interface AuthResult { readonly memberships: readonly { readonly institutionId: string }[] }
export default function LoginPage(): ReactElement {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault(); setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const supabase = createClient();
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: String(form.get("email") ?? "").trim(), password: String(form.get("password") ?? "") });
      if (signInError) throw signInError;
      const result = await api<AuthResult>("/auth/me", {}, false);
      if (!result.memberships[0]) throw new Error("No active institution membership was found.");
      localStorage.setItem("edugen_institution_id", result.memberships[0].institutionId);
      router.replace("/dashboard"); router.refresh();
    } catch (cause) {
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
      const code = cause && typeof cause === "object" && "code" in cause ? String(cause.code) : undefined;
      setError(authErrorMessage(code, cause instanceof Error ? cause.message : "Sign in failed."));
    } finally { setLoading(false); }
  }
  return <main className="auth-page"><form className="auth-card" onSubmit={submit}><div className="brand dark">VIP Maths</div><h1>Welcome back</h1><p>Sign in to your teacher workspace.</p>{error && <div className="inline-error">{error}</div>}<label>Email<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label><button disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button><p className="center">New to VIP Maths? <Link href="/register">Create an account</Link></p></form></main>;
}
