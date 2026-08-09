"use client";

import { useEffect, useState, type ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "../../components/app-shell";
import { EmptyState, ErrorState, LoadingState } from "../../components/async-state";
import { PageHeader } from "../../components/layout/PageContainer";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { api } from "../../lib/api";

interface Blueprint {
  readonly id: string;
  readonly name: string;
  readonly totalMarks: number;
  readonly durationMinutes: number;
  readonly sections: readonly { readonly name: string }[];
}

interface Generated {
  readonly id: string;
}

export default function BlueprintsPage(): ReactElement {
  const router = useRouter();
  const [items, setItems] = useState<readonly Blueprint[]>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  const load = () => {
    setError("");
    void api<readonly Blueprint[]>("/blueprints")
      .then(setItems)
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : "Unable to load blueprints")
      );
  };

  useEffect(() => {
    load();
  }, []);

  async function generate(id: string): Promise<void> {
    setBusy(id);
    setError("");
    try {
      const paper = await api<Generated>(`/blueprints/${id}/generate`, { method: "POST" });
      router.push(`/papers/${paper.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Generation failed");
    } finally {
      setBusy("");
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Paper Blueprints"
        description="Reusable, validated exam blueprint structures for deterministic paper generation."
        actions={
          <Link href="/blueprints/new" className="btn btn-primary">
            New blueprint
          </Link>
        }
      />

      {error && <ErrorState message={error} onRetry={load} />}

      {!items ? (
        <LoadingState />
      ) : !items.length ? (
        <EmptyState
          title="No blueprints saved yet"
          message="Create your first exam blueprint to start generating deterministic paper sets."
          action={
            <Link href="/blueprints/new" className="btn btn-primary">
              Create Blueprint
            </Link>
          }
        />
      ) : (
        <div className="card-grid">
          {items.map((item) => (
            <Card
              key={item.id}
              title={item.name}
              action={
                <span className="badge badge-approved">{item.sections.length} sections</span>
              }
            >
              <p style={{ color: "var(--text-muted)", margin: "0 0 16px 0", fontSize: "0.9375rem" }}>
                <strong>{item.totalMarks} marks</strong> · {item.durationMinutes} minutes duration
              </p>
              <Button
                loading={busy === item.id}
                onClick={() => void generate(item.id)}
                className="w-full"
              >
                {busy === item.id ? "Generating paper…" : "Generate paper"}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
