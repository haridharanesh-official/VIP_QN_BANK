"use client";

import { use, useCallback, useEffect, useState, type ReactElement } from "react";
import Link from "next/link";
import { AppShell } from "../../../components/app-shell";
import { ErrorState, LoadingState } from "../../../components/async-state";
import { PageHeader } from "../../../components/layout/PageContainer";
import { Button } from "../../../components/ui/Button";
import { api } from "../../../lib/api";

type View = "QUESTION_PAPER" | "ANSWER_KEY" | "QUESTIONS_WITH_ANSWERS";
type PaperSet = "A" | "B" | "C";

interface SnapshotQuestion {
  readonly order: number;
  readonly id: string;
  readonly questionText?: string;
  readonly options?: readonly { readonly id: string; readonly text: string }[];
  readonly marks: number;
  readonly correctAnswer?: unknown;
  readonly solution?: string;
}

interface SnapshotData {
  readonly metadata: {
    readonly title: string;
    readonly totalMarks: number;
    readonly durationMinutes: number;
    readonly instructions: readonly string[];
    readonly algorithmVersion: string;
    readonly warnings: readonly unknown[];
  };
  readonly sections: readonly {
    readonly id: string;
    readonly name: string;
    readonly questions: readonly SnapshotQuestion[];
  }[];
}

interface Paper {
  readonly id: string;
  readonly title: string;
  readonly createdAt: string;
  readonly snapshot: {
    readonly version: number;
    readonly checksum: string;
    readonly setLabel?: string;
    readonly paperData: SnapshotData;
  };
}

export default function PaperPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}): ReactElement {
  const { id } = use(params);
  const [view, setView] = useState<View>("QUESTION_PAPER");
  const [paperSet, setPaperSet] = useState<PaperSet>("A");
  const [paper, setPaper] = useState<Paper>();
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setPaper(undefined);
    setError("");
    void api<Paper>(`/papers/${id}?view=${view}&set=${paperSet}`)
      .then(setPaper)
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : "Unable to load paper")
      );
  }, [id, view, paperSet]);

  useEffect(load, [load]);

  return (
    <AppShell>
      <PageHeader
        title={paper?.title ?? "Generated Paper"}
        description={`Snapshot v${paper?.snapshot.version ?? 1} · ${paper?.snapshot.setLabel ?? "Set A"} projection`}
        actions={
          <div style={{ display: "flex", gap: "8px" }}>
            <Link href={`/papers/${id}/edit`} className="btn btn-secondary">
              Edit Paper Workspace
            </Link>
            <Button onClick={() => window.print()} className="btn btn-primary">
              Print / Save PDF
            </Button>
          </div>
        }
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }} className="no-print">
        <div className="tabs-bar" style={{ margin: 0 }}>
          {(["QUESTION_PAPER", "ANSWER_KEY", "QUESTIONS_WITH_ANSWERS"] as const).map((item) => (
            <Button
              key={item}
              variant={view === item ? "primary" : "quiet"}
              size="sm"
              onClick={() => setView(item)}
            >
              {item.replaceAll("_", " ")}
            </Button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-muted)" }}>Paper Set:</span>
          {(["A", "B", "C"] as const).map((s) => (
            <Button
              key={s}
              variant={paperSet === s ? "secondary" : "quiet"}
              size="sm"
              onClick={() => setPaperSet(s)}
            >
              Set {s}
            </Button>
          ))}
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !paper ? (
        <LoadingState />
      ) : (
        <article className="paper">
          <div className="paper-heading">
            <h2>
              {paper.snapshot.paperData.metadata.title}{" "}
              <span style={{ fontSize: "1rem", color: "var(--brand-primary)" }}>
                ({paper.snapshot.setLabel ?? `Set ${paperSet}`})
              </span>
            </h2>
            <p>
              <span>Time: {paper.snapshot.paperData.metadata.durationMinutes} minutes</span>
              <span>Total: {paper.snapshot.paperData.metadata.totalMarks} marks</span>
            </p>
          </div>

          <ol className="instructions">
            {paper.snapshot.paperData.metadata.instructions.map((instruction) => (
              <li key={instruction}>{instruction}</li>
            ))}
          </ol>

          {paper.snapshot.paperData.sections.map((section) => (
            <section key={section.id}>
              <h3>{section.name}</h3>
              {section.questions.map((question) => (
                <div className="paper-question" key={question.id}>
                  <div>
                    <b>{question.order}.</b>{" "}
                    {question.questionText && <span>{question.questionText}</span>}
                    <em>[{question.marks}]</em>
                  </div>

                  {question.options && (
                    <ol type="A" className="options">
                      {question.options.map((option) => (
                        <li key={option.id}>{option.text}</li>
                      ))}
                    </ol>
                  )}

                  {question.correctAnswer !== undefined && (
                    <div className="answer">
                      <strong>Answer:</strong>{" "}
                      {typeof question.correctAnswer === "string"
                        ? question.correctAnswer
                        : JSON.stringify(question.correctAnswer)}
                      {question.solution && (
                        <p style={{ marginTop: "4px" }}>
                          <strong>Solution:</strong> {question.solution}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </section>
          ))}

          <footer>
            Snapshot v{paper.snapshot.version} · Checksum: {paper.snapshot.checksum} · Algorithm{" "}
            {paper.snapshot.paperData.metadata.algorithmVersion}
          </footer>
        </article>
      )}
    </AppShell>
  );
}
