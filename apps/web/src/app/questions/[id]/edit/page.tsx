"use client";

import { useEffect, useState, type FormEvent, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../../../../components/app-shell";
import { PageHeader } from "../../../../components/layout/PageContainer";
import { Card } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Select } from "../../../../components/ui/Select";
import { Textarea } from "../../../../components/ui/Textarea";
import { Alert } from "../../../../components/ui/Alert";
import { api } from "../../../../lib/api";
import { questionCreateSchema } from "@edugen/shared";
import { ZodError } from "zod";

interface Item {
  readonly id: string;
  readonly name: string;
}

export default function NewQuestionPage(): ReactElement {
  const router = useRouter();
  const [boards, setBoards] = useState<readonly Item[]>([]);
  const [syllabi, setSyllabi] = useState<readonly Item[]>([]);
  const [mediums, setMediums] = useState<readonly Item[]>([]);
  const [standards, setStandards] = useState<readonly Item[]>([]);
  const [subjects, setSubjects] = useState<readonly Item[]>([]);
  const [chapters, setChapters] = useState<readonly Item[]>([]);

  const [selection, setSelection] = useState({
    boardId: "",
    syllabusVersionId: "",
    mediumId: "",
    standardId: "",
    subjectId: "",
    chapterId: "",
  });

  const [type, setType] = useState("MCQ_SINGLE");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void Promise.all([
      api<readonly Item[]>("/academic/boards"),
      api<readonly Item[]>("/academic/mediums"),
    ]).then(([nextBoards, nextMediums]) => {
      setBoards(nextBoards);
      setMediums(nextMediums);
    });
  }, []);

  useEffect(() => {
    if (!selection.boardId) return;
    void api<readonly Item[]>(`/academic/boards/${selection.boardId}/syllabus-versions`).then(
      setSyllabi
    );
  }, [selection.boardId]);

  useEffect(() => {
    if (!selection.syllabusVersionId) return;
    void api<readonly Item[]>(
      `/academic/standards?syllabusVersionId=${selection.syllabusVersionId}`
    ).then(setStandards);
  }, [selection.syllabusVersionId]);

  useEffect(() => {
    if (!selection.standardId || !selection.mediumId) return;
    void api<readonly Item[]>(
      `/academic/subjects?standardId=${selection.standardId}&mediumId=${selection.mediumId}`
    ).then(setSubjects);
  }, [selection.standardId, selection.mediumId]);

  useEffect(() => {
    if (!selection.subjectId) return;
    void api<readonly Item[]>(`/academic/chapters?subjectId=${selection.subjectId}`).then(
      setChapters
    );
  }, [selection.subjectId]);

  function choose(name: keyof typeof selection, value: string): void {
    setSelection((current) => ({ ...current, [name]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError("");

    const data = new FormData(event.currentTarget);
    const mcq = type.startsWith("MCQ");

    try {
      const payload = {
        ...selection,
        ownershipScope: data.get("ownershipScope"),
        questionType: type,
        marks: Number(data.get("marks")),
        difficulty: data.get("difficulty"),
        bloomLevel: data.get("bloomLevel"),
        questionText: data.get("questionText"),
        correctAnswer: data.get("correctAnswer"),
        ...(mcq
          ? {
              options: ["A", "B", "C", "D"].map((id) => ({
                id,
                text: String(data.get(`option${id}`)),
              })),
            }
          : {}),
        solution: data.get("solution") || undefined,
        sourceType: data.get("sourceType"),
        isBookBack: data.get("sourceType") === "BOOK_BACK",
        isCreative: data.get("sourceType") === "CREATIVE",
        isPreviousYear: data.get("sourceType") === "PREVIOUS_YEAR_STYLE",
      };

      const validatedPayload = questionCreateSchema.parse(payload);

      await api("/questions", {
        method: "POST",
        body: JSON.stringify(validatedPayload),
      });
      router.push("/questions");
    } catch (cause) {
      if (cause instanceof ZodError) {
        setError("Validation failed: " + cause.errors.map(e => e.message).join(", "));
      } else {
        setError(cause instanceof Error ? cause.message : "Unable to create question");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Create Question"
        description="Draft new question entries for your institution's repository."
      />

      <Card>
        <form className="form-stack" onSubmit={submit}>
          {error && <Alert variant="danger">{error}</Alert>}

          <div className="form-grid three">
            <Select
              label="Board"
              required
              value={selection.boardId}
              onChange={(event: any) => choose("boardId", event.target.value)}
            >
              <option value="">Select Board</option>
              {boards.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>

            <Select
              label="Syllabus Version"
              required
              value={selection.syllabusVersionId}
              onChange={(event: any) => choose("syllabusVersionId", event.target.value)}
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
              onChange={(event: any) => choose("mediumId", event.target.value)}
            >
              <option value="">Select Medium</option>
              {mediums.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>

            <Select
              label="Standard / Class"
              required
              value={selection.standardId}
              onChange={(event: any) => choose("standardId", event.target.value)}
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
              onChange={(event: any) => choose("subjectId", event.target.value)}
            >
              <option value="">Select Subject</option>
              {subjects.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>

            <Select
              label="Chapter / Unit"
              required
              value={selection.chapterId}
              onChange={(event: any) => choose("chapterId", event.target.value)}
            >
              <option value="">Select Chapter</option>
              {chapters.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </div>

          <Textarea
            label="Question Text"
            name="questionText"
            rows={4}
            placeholder="Type the mathematical question problem statement…"
            required
          />

          <div className="form-grid three">
            <Select
              label="Question Type"
              value={type}
              onChange={(event: any) => setType(event.target.value)}
            >
              <option value="MCQ_SINGLE">MCQ Single</option>
              <option value="SHORT_ANSWER">Short Answer</option>
              <option value="LONG_ANSWER">Long Answer</option>
              <option value="NUMERICAL">Numerical</option>
            </Select>

            <Input
              label="Marks"
              name="marks"
              type="number"
              min="1"
              defaultValue="1"
              required
            />

            <Select label="Difficulty" name="difficulty" defaultValue="MEDIUM">
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </Select>

            <Select label="Bloom Taxonomy Level" name="bloomLevel" defaultValue="APPLY">
              <option value="REMEMBER">Remember</option>
              <option value="UNDERSTAND">Understand</option>
              <option value="APPLY">Apply</option>
              <option value="ANALYZE">Analyze</option>
              <option value="EVALUATE">Evaluate</option>
              <option value="CREATE">Create</option>
            </Select>

            <Select label="Ownership Scope" name="ownershipScope" defaultValue="INSTITUTION">
              <option value="INSTITUTION">Institution Shared</option>
              <option value="PRIVATE">Private Draft</option>
            </Select>

            <Select label="Question Source" name="sourceType" defaultValue="CREATIVE">
              <option value="BOOK_BACK">Textbook Exercises</option>
              <option value="CREATIVE">Creative Problem</option>
              <option value="PREVIOUS_YEAR_STYLE">Previous Year Pattern</option>
              <option value="TEACHER_CREATED">Teacher Formulated</option>
            </Select>
          </div>

          {type.startsWith("MCQ") && (
            <div className="form-grid">
              {["A", "B", "C", "D"].map((option) => (
                <Input
                  key={option}
                  label={`Option ${option}`}
                  name={`option${option}`}
                  required
                />
              ))}
            </div>
          )}

          {type.startsWith("MCQ") ? (
            <Select label="Correct Answer Option" name="correctAnswer" defaultValue="A">
              <option value="A">Option A</option>
              <option value="B">Option B</option>
              <option value="C">Option C</option>
              <option value="D">Option D</option>
            </Select>
          ) : (
            <Textarea
              label="Correct Answer Key"
              name="correctAnswer"
              rows={3}
              required
            />
          )}

          <Textarea
            label="Detailed Solution (Optional)"
            name="solution"
            rows={3}
            placeholder="Step-by-step solution derivation…"
          />

          <div>
            <Button type="submit" loading={loading} size="lg">
              {loading ? "Saving draft…" : "Save question draft"}
            </Button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
