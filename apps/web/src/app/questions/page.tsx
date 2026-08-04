"use client";
import { useCallback, useEffect, useState, type ReactElement } from "react";
import Link from "next/link";
import { AppShell } from "../../components/app-shell";
import { EmptyState, ErrorState, LoadingState } from "../../components/async-state";
import { api } from "../../lib/api";

interface Question { readonly id: string; readonly questionText: string; readonly questionType: string; readonly marks: number; readonly difficulty: string; readonly reviewStatus: string }
interface Page { readonly items: readonly Question[]; readonly page: number; readonly totalPages: number; readonly total: number }

export default function QuestionsPage(): ReactElement {
  const [result, setResult] = useState<Page>();
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const load = useCallback(() => {
    setError(""); setResult(undefined);
    const query = new URLSearchParams({ page: String(page), pageSize: "20", ...(search ? { search } : {}), ...(status ? { reviewStatus: status } : {}) });
    void api<Page>(`/questions?${query}`).then(setResult).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Unable to load questions"));
  }, [page, search, status]);
  useEffect(load, [load]);
  async function transition(question: Question): Promise<void> {
    setError("");
    try {
      if (question.reviewStatus === "PENDING_REVIEW") await api(`/questions/${question.id}/review`, { method: "POST", body: JSON.stringify({ decision: "APPROVED" }) });
      else await api(`/questions/${question.id}/submit-review`, { method: "POST" });
      load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Review action failed"); }
  }
  return <AppShell><header><div><h1>Question bank</h1><p>Reviewed global content and your institution’s questions.</p></div><Link className="button" href="/questions/new">Create question</Link></header><div className="toolbar"><input aria-label="Search questions" placeholder="Search question text" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /><select aria-label="Review status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">All statuses</option><option>DRAFT</option><option>PENDING_REVIEW</option><option>APPROVED</option><option>CHANGES_REQUESTED</option><option>REJECTED</option></select></div>{error && <ErrorState message={error} />}{!result ? <LoadingState /> : !result.items.length ? <EmptyState message="No questions match these filters." /> : <><div className="table-wrap"><table><thead><tr><th>Question</th><th>Type</th><th>Marks</th><th>Difficulty</th><th>Status</th><th>Workflow</th></tr></thead><tbody>{result.items.map((question) => <tr key={question.id}><td>{question.questionText}</td><td>{question.questionType.replaceAll("_", " ")}</td><td>{question.marks}</td><td>{question.difficulty}</td><td><span className={`badge ${question.reviewStatus.toLowerCase()}`}>{question.reviewStatus.replaceAll("_", " ")}</span></td><td>{["DRAFT", "CHANGES_REQUESTED", "REJECTED", "PENDING_REVIEW"].includes(question.reviewStatus) && <button className="quiet compact" onClick={() => void transition(question)}>{question.reviewStatus === "PENDING_REVIEW" ? "Approve" : "Submit"}</button>}</td></tr>)}</tbody></table></div><div className="pagination"><button className="quiet" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {result.page} of {Math.max(1, result.totalPages)} · {result.total} questions</span><button className="quiet" disabled={page >= result.totalPages} onClick={() => setPage((value) => value + 1)}>Next</button></div></>}</AppShell>;
}
