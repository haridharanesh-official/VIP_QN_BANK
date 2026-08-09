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
import { Select } from "../../components/ui/Select";
import { Alert } from "../../components/ui/Alert";

interface AuthResult {
  readonly memberships: readonly { readonly institutionId: string }[];
}

interface RegistrationProfile {
  readonly firstName: string;
  readonly lastName: string;
  readonly institutionName: string;
  readonly institutionType: string;
}

export default function RegisterPage(): ReactElement {
  const router = useRouter();
  const [error, setError] = useState("");
  const [confirmationPending, setConfirmationPending] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const profile: RegistrationProfile = {
      firstName: String(form.get("firstName") ?? "").trim(),
      lastName: String(form.get("lastName") ?? "").trim(),
      institutionName: String(form.get("institutionName") ?? "").trim(),
      institutionType: String(form.get("institutionType") ?? ""),
    };

    try {
      const { data, error: signUpError } = await createClient().auth.signUp({
        email: String(form.get("email") ?? "").trim(),
        password: String(form.get("password") ?? ""),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: profile,
        },
      });

      if (signUpError) throw signUpError;
      if (!data.session) {
        setConfirmationPending(true);
        return;
      }

      const result = await api<AuthResult>(
        "/auth/supabase/bootstrap",
        { method: "POST", body: JSON.stringify(profile) },
        false
      );

      if (!result.memberships[0]) throw new Error("Institution setup did not complete.");

      localStorage.setItem("edugen_institution_id", result.memberships[0].institutionId);
      router.replace("/dashboard");
      router.refresh();
    } catch (cause) {
      const code =
        cause && typeof cause === "object" && "code" in cause ? String(cause.code) : undefined;
      setError(
        authErrorMessage(code, cause instanceof Error ? cause.message : "Registration failed.")
      );
    } finally {
      setLoading(false);
    }
  }

  if (confirmationPending) {
    return (
      <main className="auth-page">
        <div className="auth-container" style={{ maxWidth: "540px" }}>
          <div className="auth-form-panel" style={{ padding: "40px", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              <BrandLogo size="sm" showLink={false} />
            </div>
            <h1>Check your email</h1>
            <p style={{ color: "var(--text-muted)", marginBottom: "24px", lineHeight: "1.6" }}>
              Open the confirmation link sent to your email to finish creating your institution
              workspace.
            </p>
            <Link href="/login" className="btn btn-secondary">
              Back to sign in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-container">
        <div className="auth-brand-panel">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <BrandLogo size="md" showLink={false} />
          </div>
          <div className="auth-brand-panel-content">
            <h2>Create Institution</h2>
            <p>
              Set up your teacher account and isolate your institution question bank and generated
              examination papers.
            </p>
            <span className="slogan-badge">Inspiration is not a word</span>
          </div>
        </div>

        <div className="auth-form-panel wide">
          <div className="auth-form-header">
            <h1>Create your workspace</h1>
            <p>Register as a teacher and establish your academic institution.</p>
          </div>

          <form onSubmit={submit} className="form-stack">
            {error && <Alert variant="danger">{error}</Alert>}

            <div className="form-grid">
              <Input
                label="First name"
                name="firstName"
                autoComplete="given-name"
                required
              />
              <Input
                label="Last name"
                name="lastName"
                autoComplete="family-name"
                required
              />
            </div>

            <Input
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={10}
              helperText="At least 10 characters with uppercase, lowercase and a number."
              required
            />

            <Input
              label="Institution name"
              name="institutionName"
              placeholder="e.g. Saint Mary High School"
              required
            />

            <Select label="Institution type" name="institutionType" defaultValue="SCHOOL">
              <option value="SCHOOL">School</option>
              <option value="TUITION_CENTRE">Tuition Centre</option>
              <option value="INDIVIDUAL">Individual Educator</option>
              <option value="COLLEGE">College / University</option>
              <option value="OTHER">Other Institution</option>
            </Select>

            <Button type="submit" loading={loading} size="lg">
              {loading ? "Creating workspace…" : "Create institution workspace"}
            </Button>

            <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "16px" }}>
              Already registered?{" "}
              <Link href="/login" style={{ fontWeight: 600 }}>
                Sign in to your account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
