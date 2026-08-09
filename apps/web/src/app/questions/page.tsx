"use client";

import { useCallback, useEffect, useState, type ReactElement } from "react";
import Link from "next/link";
import { AppShell } from "../../components/app-shell";
import { EmptyState, ErrorState, LoadingState } from "../../components/async-state";
import { PageHeader } from "../../components/layout/PageContainer";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Badge } from "../../components/ui/Badge";
import { api } from "../../lib/api";

interface Question {
  readonly id: string;
  readonly questionText: string;
  readonly questionType: string;
  readonly marks: number;
  readonly difficulty: string;
  readonly reviewStatus: string;
}

interface Page {
  readonly items: readonly Question[];
  readonly page: number;
  readonly totalPages: number;
  readonly total: number;
}

export default function QuestionsPage(): ReactElement {
  const [result, setResult] = useState<Page>();
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setError("");
    setResult(undefined);
    const query = new URLSearchParams({
      page: String(page),
      pageSize: "20",
      ...(search ? { search } : {}),
      ...(status ? { reviewStatus: status } : {}),
    });
    void api<Page>(`/questions?${query}`)
      .then(setResult)
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : "Unable to load questions")
      );
  }, [page, search, status]);

  useEffect(load, [load]);

  async function transition(question: Question): Promise<void> {
    setError("");
    try {
      if (question.reviewStatus === "PENDING_REVIEW") {
        await api(`/questions/${question.id}/review`, {
          method: "POST",
          body: JSON.stringify({ decision: "APPROVED" }),
        });
      } else {
        await api(`/questions/${question.id}/submit-review`, { method: "POST" });
      }
      load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Review action failed");
    }
  }

  const getBadgeVariant = (reviewStatus: string) => {
    switch (reviewStatus) {
      case "APPROVED":
        return "approved";
      case "DRAFT":
        return "draft";
      case "PENDING_REVIEW":
        return "pending";
      case "CHANGES_REQUESTED":
      case "REJECTED":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Question Bank"
        description="Curated mathematics question repository and institution content."
        actions={
          <Link href="/questions/new" className="btn btn-primary">
            Create question
          </Link>
        }
      />

      <div className="toolbar-bar">
        <Input
          aria-label="Search questions"
          placeholder="Search question text…"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <Select
          aria-label="Filter by review status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All review statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PENDING_REVIEW">Pending Review</option>
          <option value="APPROVED">Approved</option>
          <option value="CHANGES_REQUESTED">Changes Requested</option>
          <option value="REJECTED">Rejected</option>
        </Select>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      {!result ? (
        <LoadingState />
      ) : !result.items.length ? (
        <EmptyState
          title="No questions found"
          message="No mathematics questions match your search parameters."
          action={
            <Link href="/questions/new" className="btn btn-secondary btn-sm">
              Create a question
            </Link>
          }
        />
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Question Content</th>
                  <th>Type</th>
                  <th>Marks</th>
                  <th>Difficulty</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((question) => (
                  <tr key={question.id}>
                    <td style={{ fontWeight: 500 }}>{question.questionText}</td>
                    <td>{question.questionType.replaceAll("_", " ")}</td>
                    <td>
                      <strong>{question.marks}</strong>
                    </td>
                    <td>{question.difficulty}</td>
                    <td>
                      <Badge variant={getBadgeVariant(question.reviewStatus)}>
                        {question.reviewStatus.replaceAll("_", " ")}
                      </Badge>
                    </td>
                    <td>
                      {["DRAFT", "CHANGES_REQUESTED", "REJECTED", "PENDING_REVIEW"].includes(
                        question.reviewStatus
                      ) && (
                        <Button
                          variant="quiet"
                          size="sm"
                          onClick={() => void transition(question)}
                        >
                          {question.reviewStatus === "PENDING_REVIEW" ? "Approve" : "Submit"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <Button
              variant="quiet"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((val) => val - 1)}
            >
              Previous
            </Button>
            <span className="pagination-info">
              Page {result.page} of {Math.max(1, result.totalPages)} · {result.total} questions
            </span>
            <Button
              variant="quiet"
              size="sm"
              disabled={page >= result.totalPages}
              onClick={() => setPage((val) => val + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </AppShell>
  );
}
