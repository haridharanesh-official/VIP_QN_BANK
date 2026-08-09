"use client";

import { use, useCallback, useEffect, useState, type ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "../../../../components/app-shell";
import { ErrorState, LoadingState } from "../../../../components/async-state";
import { PageHeader } from "../../../../components/layout/PageContainer";
import { Card } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Textarea } from "../../../../components/ui/Textarea";
import { Alert } from "../../../../components/ui/Alert";
import { api } from "../../../../lib/api";

interface Question {
  id: string;
  order: number;
  questionText?: string;
  options?: { id: string; text: string }[];
  marks: number;
  correctAnswer?: unknown;
  solution?: string;
}

interface Section {
  id: string;
  name: string;
  questions: Question[];
}

interface PaperData {
  metadata: {
    title: string;
    totalMarks: number;
    durationMinutes: number;
    instructions: string[];
    algorithmVersion: string;
    warnings: unknown[];
  };
  sections: Section[];
}

interface Paper {
  id: string;
  title: string;
  snapshot: {
    version: number;
    checksum: string;
    paperData: PaperData;
  };
}

export default function EditPaperPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}): ReactElement {
  const { id } = use(params);
  const router = useRouter();
  const [paper, setPaper] = useState<Paper>();
  const [paperData, setPaperData] = useState<PaperData>();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setError("");
    void api<Paper>(`/papers/${id}?view=QUESTIONS_WITH_ANSWERS`)
      .then((data) => {
        setPaper(data);
        setPaperData(structuredClone(data.snapshot.paperData));
      })
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : "Unable to load paper workspace")
      );
  }, [id]);

  useEffect(load, [load]);

  function moveQuestion(sectionIndex: number, qIndex: number, direction: "up" | "down"): void {
    if (!paperData) return;
    const targetQIndex = direction === "up" ? qIndex - 1 : qIndex + 1;
    const sections = [...paperData.sections];
    const section = sections[sectionIndex];
    if (!section || targetQIndex < 0 || targetQIndex >= section.questions.length) return;

    const questions = [...section.questions];
    const temp = questions[qIndex]!;
    questions[qIndex] = questions[targetQIndex]!;
    questions[targetQIndex] = temp;

    // Recalculate orders
    questions.forEach((q, idx) => {
      q.order = idx + 1;
    });

    sections[sectionIndex] = { ...section, questions };
    setPaperData({ ...paperData, sections });
  }

  function removeQuestion(sectionIndex: number, qIndex: number): void {
    if (!paperData) return;
    const sections = [...paperData.sections];
    const section = sections[sectionIndex];
    if (!section) return;

    const questions = section.questions.filter((_, idx) => idx !== qIndex);
    questions.forEach((q, idx) => {
      q.order = idx + 1;
    });

    sections[sectionIndex] = { ...section, questions };
    setPaperData({ ...paperData, sections });
  }

  async function handleSaveRevision(): Promise<void> {
    if (!paperData) return;
    setSaving(true);
    setError("");

    try {
      await api(`/papers/${id}/revision`, {
        method: "POST",
        body: JSON.stringify({
          paperData,
          reason: reason || "Manual teacher workspace revisions",
        }),
      });
      router.push(`/papers/${id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to save paper revision");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title={`Paper Workspace: ${paper?.title ?? "Loading…"}`}
        description="Edit title, section order, question sequence, and display text. Generates a new snapshot revision."
        actions={
          <div style={{ display: "flex", gap: "8px" }}>
            <Link href={`/papers/${id}`} className="btn btn-quiet">
              Cancel
            </Link>
            <Button
              variant="primary"
              loading={saving}
              onClick={() => void handleSaveRevision()}
            >
              Save New Revision
            </Button>
          </div>
        }
      />

      {error && <Alert variant="danger">{error}</Alert>}

      {!paperData ? (
        <LoadingState />
      ) : (
        <div className="form-stack">
          <Card title="Paper Metadata Settings">
            <div className="form-grid">
              <Input
                label="Paper Title"
                value={paperData.metadata.title}
                onChange={(e) =>
                  setPaperData({
                    ...paperData,
                    metadata: { ...paperData.metadata, title: e.target.value },
                  })
                }
              />
              <Input
                label="Duration (Minutes)"
                type="number"
                value={paperData.metadata.durationMinutes}
                onChange={(e) =>
                  setPaperData({
                    ...paperData,
                    metadata: {
                      ...paperData.metadata,
                      durationMinutes: Number(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div style={{ marginTop: "16px" }}>
              <Textarea
                label="Instructions (one per line)"
                rows={3}
                value={paperData.metadata.instructions.join("\n")}
                onChange={(e) =>
                  setPaperData({
                    ...paperData,
                    metadata: {
                      ...paperData.metadata,
                      instructions: e.target.value.split("\n").filter(Boolean),
                    },
                  })
                }
              />
            </div>
            <div style={{ marginTop: "16px" }}>
              <Input
                label="Revision Log Note"
                placeholder="Reason for change (e.g. Swapped Q3 for clarity)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </Card>

          {paperData.sections.map((section, sIdx) => (
            <Card key={section.id} title={section.name}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {section.questions.map((question, qIdx) => (
                  <div
                    key={question.id}
                    style={{
                      padding: "16px",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--surface-subtle)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <strong style={{ color: "var(--brand-primary)" }}>
                        Question #{qIdx + 1} ({question.marks} marks)
                      </strong>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <Button
                          variant="quiet"
                          size="sm"
                          disabled={qIdx === 0}
                          onClick={() => moveQuestion(sIdx, qIdx, "up")}
                        >
                          Move Up
                        </Button>
                        <Button
                          variant="quiet"
                          size="sm"
                          disabled={qIdx === section.questions.length - 1}
                          onClick={() => moveQuestion(sIdx, qIdx, "down")}
                        >
                          Move Down
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeQuestion(sIdx, qIdx)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>

                    <Textarea
                      rows={2}
                      value={question.questionText || ""}
                      onChange={(e) => {
                        const sections = [...paperData.sections];
                        const sec = sections[sIdx]!;
                        sec.questions[qIdx]!.questionText = e.target.value;
                        setPaperData({ ...paperData, sections });
                      }}
                    />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
