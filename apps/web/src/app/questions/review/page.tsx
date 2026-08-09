"use client";

import { useCallback, useEffect, useState, type ReactElement } from "react";
import Link from "next/link";
import { AppShell } from "../../../components/app-shell";
import { EmptyState, ErrorState, LoadingState } from "../../../components/async-state";
import { PageHeader } from "../../../components/layout/PageContainer";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Textarea } from "../../../components/ui/Textarea";
import { Badge } from "../../../components/ui/Badge";
import { Alert } from "../../../components/ui/Alert";
import { api } from "../../../lib/api";

interface Question {
  readonly id: string;
  readonly questionText: string;
  readonly questionType: string;
  readonly marks: number;
  readonly difficulty: string;
  readonly reviewStatus: string;
  readonly options?: readonly { readonly id: string; readonly text: string }[];
  readonly solution?: string;
  readonly createdAt: string;
}

interface Page {
  readonly items: readonly Question[];
  readonly total: number;
}

export default function QuestionReviewPage(): ReactElement {
  const [data, setData] = useState<Page>();
  const [error, setError] = useState("");
  const [comments, setComments] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState("");

  const load = useCallback(() => {
    setError("");
    setData(undefined);
    void api<Page>("/questions?reviewStatus=PENDING_REVIEW&pageSize=50")
      .then(setData)
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : "Unable to load review queue")
      );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDecision(
    questionId: string,
    decision: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED"
  ): Promise<void> {
    setBusyId(questionId);
    setError("");

    const comment = comments[questionId] || undefined;
    if ((decision === "REJECTED" || decision === "CHANGES_REQUESTED") && !comment) {
      setError("A comment explaining the decision is required when rejecting or requesting changes.");
      setBusyId("");
      return;
    }

    try {
      await api(`/questions/${questionId}/review`, {
        method: "POST",
        body: JSON.stringify({ decision, comment }),
      });
      load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Review decision failed.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Question Review Queue"
        description="Review, approve, or request changes on submitted teacher question entries."
        actions={
          <Link href="/questions" className="btn btn-secondary btn-sm">
            View all questions
          </Link>
        }
      />

      {error && <Alert variant="danger">{error}</Alert>}

      {!data ? (
        <LoadingState />
      ) : !data.items.length ? (
        <EmptyState
          title="Review Queue Clear"
          message="There are currently no questions pending content review."
          action={
            <Link href="/questions" className="btn btn-secondary btn-sm">
              Return to Question Bank
            </Link>
          }
        />
      ) : (
        <div className="review-queue-list">
          {data.items.map((question) => (
            <Card
              key={question.id}
              title={`Question #${question.id.slice(0, 8)}`}
              action={<Badge variant="pending">Pending Review</Badge>}
            >
              <div className="review-item-content">
                <p className="review-question-text">
                  {question.questionText}
                </p>

                {question.options && (
                  <ol type="A" className="options" style={{ marginBottom: "16px" }}>
                    {question.options.map((opt) => (
                      <li key={opt.id}>{opt.text}</li>
                    ))}
                  </ol>
                )}

                {question.solution && (
                  <div className="answer" style={{ marginBottom: "16px" }}>
                    <strong>Solution / Answer Key:</strong>
                    <p style={{ margin: "4px 0 0 0" }}>{question.solution}</p>
                  </div>
                )}

                <div className="review-meta">
                  <span>Type: <strong>{question.questionType.replaceAll("_", " ")}</strong></span>
                  <span>Marks: <strong>{question.marks}</strong></span>
                  <span>Difficulty: <strong>{question.difficulty}</strong></span>
                  <span>Submitted: {new Date(question.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="review-actions-panel">
                <Textarea
                  placeholder="Enter feedback or explanation for the author (required for Rejection / Changes Requested)…"
                  rows={2}
                  value={comments[question.id] || ""}
                  onChange={(e) =>
                    setComments((prev) => ({ ...prev, [question.id]: e.target.value }))
                  }
                  style={{ marginBottom: "12px" }}
                />

                <div className="review-action-buttons">
                  <Button
                    variant="danger"
                    size="sm"
                    loading={busyId === question.id}
                    onClick={() => handleDecision(question.id, "REJECTED")}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={busyId === question.id}
                    onClick={() => handleDecision(question.id, "CHANGES_REQUESTED")}
                  >
                    Request Changes
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    loading={busyId === question.id}
                    onClick={() => handleDecision(question.id, "APPROVED")}
                  >
                    Approve & Publish
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
