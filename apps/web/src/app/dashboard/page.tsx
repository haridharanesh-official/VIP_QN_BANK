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
  readonly user: { readonly firstName: string };
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
    <AppShell institutionName={data?.institution.name}>
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

          <div className="metric-grid">
            {[
              ["Total Questions", data.metrics.questions],
              ["Approved", data.metrics.approvedQuestions],
              ["Pending Review", data.metrics.pendingQuestions ?? 0],
              ["Drafts", data.metrics.draftQuestions],
              ["Blueprints", data.metrics.blueprints],
            ].map(([label, value]) => (
              <div className="metric-card" key={String(label)}>
                <span className="metric-value">{value}</span>
                <span className="metric-label">{label}</span>
              </div>
            ))}
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
