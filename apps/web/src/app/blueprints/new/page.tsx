"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../../../components/app-shell";
import { PageHeader } from "../../../components/layout/PageContainer";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Textarea } from "../../../components/ui/Textarea";
import { Alert } from "../../../components/ui/Alert";
import { api } from "../../../lib/api";

interface Item {
  readonly id: string;
  readonly name: string;
}

interface Section {
  readonly name: string;
  readonly questionType: string;
  readonly marksPerQuestion: number;
  readonly questionCount: number;
  readonly easy: number;
  readonly medium: number;
  readonly hard: number;
}

interface Saved {
  readonly id: string;
}

const initialSection: Section = {
  name: "Section A",
  questionType: "MCQ_SINGLE",
  marksPerQuestion: 1,
  questionCount: 10,
  easy: 40,
  medium: 40,
  hard: 20,
};

export default function NewBlueprintPage(): ReactElement {
  const router = useRouter();
  const [items, setItems] = useState<{ boards: readonly Item[]; mediums: readonly Item[] }>({
    boards: [],
    mediums: [],
  });
  const [syllabi, setSyllabi] = useState<readonly Item[]>([]);
  const [standards, setStandards] = useState<readonly Item[]>([]);
  const [subjects, setSubjects] = useState<readonly Item[]>([]);
  const [chapters, setChapters] = useState<readonly Item[]>([]);

  const [selection, setSelection] = useState({
    boardId: "",
    syllabusVersionId: "",
    mediumId: "",
    standardId: "",
    subjectId: "",
  });

  const [selectedChapters, setSelectedChapters] = useState<readonly string[]>([]);
  const [sections, setSections] = useState<readonly Section[]>([initialSection]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const calculated = useMemo(
    () =>
      sections.reduce(
        (sum, section) => sum + section.marksPerQuestion * section.questionCount,
        0
      ),
    [sections]
  );

  useEffect(() => {
    void Promise.all([
      api<readonly Item[]>("/academic/boards"),
      api<readonly Item[]>("/academic/mediums"),
    ]).then(([boards, mediums]) => setItems({ boards, mediums }));
  }, []);

  useEffect(() => {
    if (selection.boardId)
      void api<readonly Item[]>(
        `/academic/boards/${selection.boardId}/syllabus-versions`
      ).then(setSyllabi);
  }, [selection.boardId]);

  useEffect(() => {
    if (selection.syllabusVersionId)
      void api<readonly Item[]>(
        `/academic/standards?syllabusVersionId=${selection.syllabusVersionId}`
      ).then(setStandards);
  }, [selection.syllabusVersionId]);

  useEffect(() => {
    if (selection.standardId && selection.mediumId)
      void api<readonly Item[]>(
        `/academic/subjects?standardId=${selection.standardId}&mediumId=${selection.mediumId}`
      ).then(setSubjects);
  }, [selection.standardId, selection.mediumId]);

  useEffect(() => {
    if (selection.subjectId)
      void api<readonly Item[]>(`/academic/chapters?subjectId=${selection.subjectId}`).then(
        setChapters
      );
  }, [selection.subjectId]);

  function choose(name: keyof typeof selection, value: string): void {
    setSelection((current) => ({ ...current, [name]: value }));
  }

  function updateSection(index: number, patch: Partial<Section>): void {
    setSections((current) =>
      current.map((section, offset) => (offset === index ? { ...section, ...patch } : section))
    );
  }

  function addSection(): void {
    setSections((current) => [
      ...current,
      { ...initialSection, name: `Section ${String.fromCharCode(65 + current.length)}` },
    ]);
  }

  function moveSection(index: number, direction: "up" | "down"): void {
    setSections((current) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.length) return current;
      const next = [...current];
      const temp = next[index];
      next[index] = next[targetIndex]!;
      next[targetIndex] = temp!;
      return next;
    });
  }

  function removeSection(index: number): void {
    setSections((current) => current.filter((_, offset) => offset !== index));
  }

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError("");

    const data = new FormData(event.currentTarget);
    const totalMarks = Number(data.get("totalMarks"));

    if (calculated !== totalMarks) {
      setError(`Sections total ${calculated} marks but total marks specified is ${totalMarks}.`);
      setLoading(false);
      return;
    }

    try {
      const saved = await api<Saved>("/blueprints", {
        method: "POST",
        body: JSON.stringify({
          name: data.get("name"),
          description: data.get("description") || undefined,
          ...selection,
          totalMarks,
          durationMinutes: Number(data.get("durationMinutes")),
          instructions: String(data.get("instructions") || "")
            .split("\n")
            .map((val) => val.trim())
            .filter(Boolean),
          sections: sections.map((section, index) => ({
            name: section.name,
            displayOrder: index,
            questionType: section.questionType,
            marksPerQuestion: section.marksPerQuestion,
            questionCount: section.questionCount,
            internalChoiceCount: 0,
            isCompulsory: true,
            ...(selectedChapters.length
              ? { chapterDistribution: Object.fromEntries(selectedChapters.map((id) => [id, 1])) }
              : {}),
            difficultyDistribution: {
              EASY: section.easy,
              MEDIUM: section.medium,
              HARD: section.hard,
            },
          })),
        }),
      });

      const validation = await api<{
        readonly valid: boolean;
        readonly errors: readonly { readonly message: string }[];
      }>(`/blueprints/${saved.id}/validate`, { method: "POST" });

      if (!validation.valid) {
        setError(validation.errors.map((issue) => issue.message).join(" "));
        return;
      }

      router.push("/blueprints");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save blueprint");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="New Examination Blueprint"
        description="Configure curriculum boundaries, paper sections, and difficulty targets."
        actions={
          <div style={{ textAlign: "right" }}>
            <span
              style={{
                fontSize: "1.75rem",
                fontWeight: 800,
                color: "var(--brand-primary)",
                display: "block",
                lineHeight: 1,
              }}
            >
              {calculated}
            </span>
            <small style={{ color: "var(--text-muted)" }}>Total calculated section marks</small>
          </div>
        }
      />

      <form className="form-stack" onSubmit={submit}>
        {error && <Alert variant="danger">{error}</Alert>}

        <Card title="Paper Overview & Metadata">
          <div className="form-grid">
            <Input label="Blueprint Name" name="name" placeholder="e.g. Class 10 Term-1 Mathematics" required />
            <Input label="Description" name="description" placeholder="Optional notes or syllabus scope" />
            <Input
              label="Total Paper Marks"
              name="totalMarks"
              type="number"
              min="1"
              defaultValue={calculated}
              required
            />
            <Input
              label="Duration (Minutes)"
              name="durationMinutes"
              type="number"
              min="1"
              defaultValue="60"
              required
            />
          </div>
          <div style={{ marginTop: "16px" }}>
            <Textarea
              label="General Instructions"
              name="instructions"
              rows={3}
              placeholder="Enter instructions, one per line (e.g. All questions are compulsory)"
            />
          </div>
        </Card>

        <Card title="Curriculum & Chapters">
          <div className="form-grid three">
            <Select
              label="Board"
              required
              value={selection.boardId}
              onChange={(event) => choose("boardId", event.target.value)}
            >
              <option value="">Select Board</option>
              {items.boards.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>

            <Select
              label="Syllabus"
              required
              value={selection.syllabusVersionId}
              onChange={(event) => choose("syllabusVersionId", event.target.value)}
            >
              <option value="">Select Syllabus</option>
              {syllabi.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>

            <Select
              label="Medium"
              required
              value={selection.mediumId}
              onChange={(event) => choose("mediumId", event.target.value)}
            >
              <option value="">Select Medium</option>
              {items.mediums.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>

            <Select
              label="Standard / Class"
              required
              value={selection.standardId}
              onChange={(event) => choose("standardId", event.target.value)}
            >
              <option value="">Select Standard</option>
              {standards.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>

            <Select
              label="Subject"
              required
              value={selection.subjectId}
              onChange={(event) => choose("subjectId", event.target.value)}
            >
              <option value="">Select Subject</option>
              {subjects.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </div>

          {chapters.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <label className="form-label" style={{ marginBottom: "8px", display: "block" }}>
                Chapter Selection
              </label>
              <div className="checks">
                {chapters.map((chapter) => (
                  <label key={chapter.id}>
                    <input
                      type="checkbox"
                      checked={selectedChapters.includes(chapter.id)}
                      onChange={(event) =>
                        setSelectedChapters((current) =>
                          event.target.checked
                            ? [...current, chapter.id]
                            : current.filter((id) => id !== chapter.id)
                        )
                      }
                    />
                    {chapter.name}
                  </label>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card
          title="Section Structure & Distribution"
          action={
            <Button variant="secondary" size="sm" onClick={addSection}>
              Add section
            </Button>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {sections.map((section, index) => (
              <div
                key={index}
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
                    marginBottom: "12px",
                  }}
                >
                  <strong style={{ fontSize: "1rem", color: "var(--brand-primary)" }}>
                    Section #{index + 1}: {section.name}
                  </strong>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <Button
                      variant="quiet"
                      size="sm"
                      disabled={index === 0}
                      onClick={() => moveSection(index, "up")}
                      aria-label="Move Section Up"
                    >
                      Move up
                    </Button>
                    <Button
                      variant="quiet"
                      size="sm"
                      disabled={index === sections.length - 1}
                      onClick={() => moveSection(index, "down")}
                      aria-label="Move Section Down"
                    >
                      Move down
                    </Button>
                    {sections.length > 1 && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeSection(index)}
                        aria-label="Remove Section"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>

                <div className="form-grid three">
                  <Input
                    label="Section Name"
                    value={section.name}
                    onChange={(event) => updateSection(index, { name: event.target.value })}
                  />
                  <Select
                    label="Question Type"
                    value={section.questionType}
                    onChange={(event) =>
                      updateSection(index, { questionType: event.target.value })
                    }
                  >
                    <option value="MCQ_SINGLE">MCQ Single Choice</option>
                    <option value="SHORT_ANSWER">Short Answer</option>
                    <option value="LONG_ANSWER">Long Answer</option>
                  </Select>
                  <Input
                    label="Marks per Question"
                    type="number"
                    min="1"
                    value={section.marksPerQuestion}
                    onChange={(event) =>
                      updateSection(index, { marksPerQuestion: Number(event.target.value) })
                    }
                  />
                  <Input
                    label="Question Count"
                    type="number"
                    min="1"
                    value={section.questionCount}
                    onChange={(event) =>
                      updateSection(index, { questionCount: Number(event.target.value) })
                    }
                  />
                  <Input
                    label="Easy %"
                    type="number"
                    min="0"
                    max="100"
                    value={section.easy}
                    onChange={(event) =>
                      updateSection(index, { easy: Number(event.target.value) })
                    }
                  />
                  <Input
                    label="Medium %"
                    type="number"
                    min="0"
                    max="100"
                    value={section.medium}
                    onChange={(event) =>
                      updateSection(index, { medium: Number(event.target.value) })
                    }
                  />
                  <Input
                    label="Hard %"
                    type="number"
                    min="0"
                    max="100"
                    value={section.hard}
                    onChange={(event) =>
                      updateSection(index, { hard: Number(event.target.value) })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div>
          <Button type="submit" loading={loading} size="lg">
            {loading ? "Validating & saving…" : "Validate & save blueprint"}
          </Button>
        </div>
      </form>
    </AppShell>
  );
}
