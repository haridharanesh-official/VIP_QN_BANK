"use client";

import { useEffect, useState, type ReactElement } from "react";
import Link from "next/link";
import { AppShell } from "../../components/app-shell";
import { ErrorState, LoadingState } from "../../components/async-state";
import { PageHeader } from "../../components/layout/PageContainer";
import { Card } from "../../components/ui/Card";
import { api } from "../../lib/api";

interface Dashboard {
  readonly institution: { readonly name: string };
  readonly user: { readonly firstName: string; readonly role?: string };
  readonly metrics: {
    readonly questions: number;
    readonly approvedQuestions: number;
    readonly pendingQuestions?: number;
    readonly draftQuestions: number;
    readonly blueprints: number;
    readonly papers: number;
  };
  readonly recentPapers: readonly {
    readonly id: string;
    readonly title: string;
    readonly totalMarks: number;
    readonly createdAt: string;
  }[];
}

export default function DashboardPage(): ReactElement {
  const [data, setData] = useState<Dashboard>();
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    const institution = new URLSearchParams(window.location.search).get("institution");
    if (institution) {
      localStorage.setItem("edugen_institution_id", institution);
      window.history.replaceState({}, "", "/dashboard");
    }
    void api<Dashboard>("/institutions/dashboard")
      .then(setData)
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : "Unable to load dashboard")
      );
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <AppShell institutionName={data?.institution.name} userRole={data?.user.role}>
      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !data ? (
        <LoadingState />
      ) : (
        <>
          <PageHeader
            eyebrow={`VIP Maths · ${data.institution.name}`}
            title={`Welcome back, ${data.user.firstName}`}
            description="Your persisted academic workspace and question bank overview."
            actions={
              <div className="flex-row-actions">
                <Link href="/questions/new" className="btn btn-secondary btn-sm">
                  + Create question
                </Link>
                <Link href="/blueprints/new" className="btn btn-secondary btn-sm">
                  + Create blueprint
                </Link>
                <Link href="/blueprints" className="btn btn-primary btn-sm">
                  Generate paper
                </Link>
              </div>
            }
          />

          <div className="metric-grid" style={{ marginBottom: "var(--space-8)" }}>
            {[
              ["Total Questions", data.metrics.questions, "linear-gradient(135deg, #0d1c2e 0%, #16304a 100%)"],
              ["Approved", data.metrics.approvedQuestions, "linear-gradient(135deg, #087a6b 0%, #065c51 100%)"],
              ["Pending Review", data.metrics.pendingQuestions ?? 0, "linear-gradient(135deg, #b45309 0%, #78350f 100%)"],
              ["Drafts", data.metrics.draftQuestions, "linear-gradient(135deg, #475569 0%, #334155 100%)"],
              ["Blueprints", data.metrics.blueprints, "linear-gradient(135deg, #a50c49 0%, #86093b 100%)"],
            ].map(([label, value, bg]) => (
              <div className="metric-card" key={String(label)} style={{ background: bg as string, color: "#fff", border: "none", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
                <span className="metric-value" style={{ color: "#fff" }}>{value}</span>
                <span className="metric-label" style={{ color: "rgba(255,255,255,0.8)" }}>{label}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-6)", marginBottom: "var(--space-8)" }}>
            <Link href="/blueprints" style={{ background: "linear-gradient(135deg, #087a6b 0%, #065c51 100%)", color: "#fff", padding: "var(--space-6)", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", gap: "var(--space-2)", textDecoration: "none", boxShadow: "0 10px 25px rgba(8, 122, 107, 0.3)", transition: "transform 0.2s" }}>
              <h3 style={{ margin: 0, fontSize: "1.5rem" }}>Generate New Paper</h3>
              <p style={{ margin: 0, opacity: 0.9 }}>Select a blueprint and create a deterministic paper instantly.</p>
            </Link>
            
            <Link href="/questions/new" style={{ background: "var(--surface-card)", border: "1px solid var(--border-default)", padding: "var(--space-6)", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", gap: "var(--space-2)", textDecoration: "none", transition: "transform 0.2s" }}>
              <h3 style={{ margin: 0, color: "var(--text-primary)" }}>Add to Question Bank</h3>
              <p style={{ margin: 0, color: "var(--text-muted)" }}>Draft new questions with metadata.</p>
            </Link>
          </div>

          <Card
            title="Recent Papers"
            action={
              <Link href="/papers" className="btn btn-quiet btn-sm">
                View all papers
              </Link>
            }
          >
            {data.recentPapers.length ? (
              <div className="data-list">
                {data.recentPapers.map((paper) => (
                  <Link className="data-list-row" href={`/papers/${paper.id}`} key={paper.id}>
                    <div>
                      <strong className="data-list-title">
                        {paper.title}
                      </strong>
                      <small className="data-list-subtitle">
                        Created on {new Date(paper.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    <span className="marks-badge">
                      {paper.totalMarks} marks
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="empty-hint">
                No papers generated yet. Create a blueprint to start generating papers.
              </p>
            )}
          </Card>
        </>
      )}
    </AppShell>
  );
}
