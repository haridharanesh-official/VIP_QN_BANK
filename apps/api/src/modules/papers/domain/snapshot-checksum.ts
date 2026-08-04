import { createHash } from "node:crypto";
import type { Candidate } from "./generation.types";
function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(Reflect.get(value, key))}`).join(",")}}`;
}
export function snapshotChecksum(value: unknown): string { return createHash("sha256").update(canonical(value)).digest("hex"); }
export function questionSnapshot(question: Candidate, order: number): Readonly<Record<string, unknown>> { return Object.freeze({ order, id: question.id, questionText: question.questionText, options: structuredClone(question.options), marks: question.marks, correctAnswer: structuredClone(question.correctAnswer), solution: question.solution, sourceType: question.sourceType, chapterId: question.chapterId }); }
