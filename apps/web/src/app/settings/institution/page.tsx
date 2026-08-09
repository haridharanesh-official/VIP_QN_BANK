"use client";

import { useEffect, useState, type FormEvent, type ReactElement } from "react";
import { AppShell } from "../../../components/app-shell";
import { PageHeader } from "../../../components/layout/PageContainer";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/Textarea";
import { Alert } from "../../../components/ui/Alert";
import { api } from "../../../lib/api";

interface Institution {
  id: string;
  name: string;
  slug: string;
  institutionType: string;
}

export default function InstitutionBrandingPage(): ReactElement {
  const [institution, setInstitution] = useState<Institution>();
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [examHeader, setExamHeader] = useState("");
  const [watermarkText, setWatermarkText] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void api<Institution>("/institutions/current")
      .then((inst) => {
        setInstitution(inst);
        try {
          const stored = localStorage.getItem("vip_institution_branding");
          if (stored) {
            const data = JSON.parse(stored);
            setExamHeader(data.examHeader || "");
            setAddress(data.address || "");
            setPhone(data.phone || "");
            setEmail(data.email || "");
            setWatermarkText(data.watermarkText || "");
          } else {
            setExamHeader(inst.name);
          }
        } catch {
          // ignore
        }
      })
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : "Unable to load institution details")
      );
  }, []);

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setLoading(true);
    setSaved(false);

    // Save branding metadata to localStorage/state for print templates
    try {
      const brandingData = {
        name: institution?.name ?? examHeader,
        examHeader,
        address,
        phone,
        email,
        watermarkText,
      };
      localStorage.setItem("vip_institution_branding", JSON.stringify(brandingData));
      setSaved(true);
    } catch {
      setError("Failed to save branding settings");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell institutionName={institution?.name}>
      <PageHeader
        title="Institution Print Branding"
        description="Configure institution headers, footers, address, and watermark defaults for generated exam papers."
      />

      <Card>
        <form onSubmit={submit} className="form-stack">
          {saved && <Alert variant="success">Institution branding configuration saved successfully.</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <div className="form-grid">
            <Input
              label="Institution Legal / Display Name"
              value={institution?.name ?? ""}
              readOnly
              helperText="Set during workspace registration"
            />
            <Input
              label="Exam Paper Header Line"
              value={examHeader}
              onChange={(e) => setExamHeader(e.target.value)}
              placeholder="e.g. ST. JOSEPH HIGHER SECONDARY SCHOOL"
              required
            />
          </div>

          <Textarea
            label="Postal Address"
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div className="form-grid">
            <Input
              label="Contact Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Official Contact Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Input
            label="Default Paper Watermark Text"
            value={watermarkText}
            onChange={(e) => setWatermarkText(e.target.value)}
          />

          <div>
            <Button type="submit" loading={loading} size="lg">
              {loading ? "Saving branding…" : "Save branding configuration"}
            </Button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
