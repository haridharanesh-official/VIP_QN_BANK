"use client";
import { useState, type FormEvent, type ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { authErrorMessage } from "../../lib/auth-errors";
import { createClient } from "../../lib/supabase/client";

interface AuthResult { readonly memberships: readonly { readonly institutionId: string }[] }
interface RegistrationProfile { readonly firstName: string; readonly lastName: string; readonly institutionName: string; readonly institutionType: string }
export default function RegisterPage(): ReactElement {
  const router = useRouter();
  const [error, setError] = useState("");
  const [confirmationPending, setConfirmationPending] = useState(false);
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault(); setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const profile: RegistrationProfile = { firstName: String(form.get("firstName") ?? "").trim(), lastName: String(form.get("lastName") ?? "").trim(), institutionName: String(form.get("institutionName") ?? "").trim(), institutionType: String(form.get("institutionType") ?? "") };
    try {
      const { data, error: signUpError } = await createClient().auth.signUp({ email: String(form.get("email") ?? "").trim(), password: String(form.get("password") ?? ""), options: { emailRedirectTo: `${window.location.origin}/auth/callback`, data: profile } });
      if (signUpError) throw signUpError;
      if (!data.session) { setConfirmationPending(true); return; }
      const result = await api<AuthResult>("/auth/supabase/bootstrap", { method: "POST", body: JSON.stringify(profile) }, false);
      if (!result.memberships[0]) throw new Error("Institution setup did not complete.");
      localStorage.setItem("edugen_institution_id", result.memberships[0].institutionId);
      router.replace("/dashboard"); router.refresh();
    } catch (cause) {
      const code = cause && typeof cause === "object" && "code" in cause ? String(cause.code) : undefined;
      setError(authErrorMessage(code, cause instanceof Error ? cause.message : "Registration failed."));
    } finally { setLoading(false); }
  }
  if (confirmationPending) return <main className="auth-page"><section className="auth-card"><div className="brand dark">VIP Maths</div><h1>Check your email</h1><p>Open the confirmation link to finish creating your workspace, then you’ll be signed in.</p><p className="center"><Link href="/login">Back to sign in</Link></p></section></main>;
  return <main className="auth-page"><form className="auth-card wide" onSubmit={submit}><div className="brand dark">VIP Maths</div><h1>Create your workspace</h1><p>Register as a teacher and create your institution.</p>{error && <div className="inline-error">{error}</div>}<div className="form-grid"><label>First name<input name="firstName" autoComplete="given-name" required /></label><label>Last name<input name="lastName" autoComplete="family-name" required /></label></div><label>Email<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" autoComplete="new-password" minLength={10} required /><small>At least 10 characters with uppercase, lowercase and a number.</small></label><label>Institution name<input name="institutionName" required /></label><label>Institution type<select name="institutionType" defaultValue="SCHOOL"><option value="SCHOOL">School</option><option value="TUITION_CENTRE">Tuition centre</option><option value="INDIVIDUAL">Individual</option><option value="COLLEGE">College</option><option value="OTHER">Other</option></select></label><button disabled={loading}>{loading ? "Creating…" : "Create workspace"}</button><p className="center">Already registered? <Link href="/login">Sign in</Link></p></form></main>;
}
