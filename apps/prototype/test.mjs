import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { generatePaper } from "./generator.mjs";

const questions = JSON.parse(
  await readFile(fileURLToPath(new URL("./questions.json", import.meta.url)), "utf8"),
);

const validBlueprint = {
  name: "Unit Test",
  chapters: ["real-numbers", "polynomials", "linear-equations"],
  difficulty: { EASY: 30, MEDIUM: 50, HARD: 20 },
  sections: [
    { name: "Section A", type: "MCQ_SINGLE", marksPerQuestion: 1, count: 5 },
    { name: "Section B", type: "SHORT_ANSWER", marksPerQuestion: 2, count: 5 },
    { name: "Section C", type: "LONG_ANSWER", marksPerQuestion: 5, count: 2 },
  ],
};

test("generates a valid 25-mark paper", () => {
  const result = generatePaper(questions, validBlueprint);
  assert.equal(result.success, true);
  assert.equal(result.paper.totalMarks, 25);
  assert.equal(result.paper.questions.length, 12);
  assert.equal(new Set(result.paper.questions.map((question) => question.id)).size, 12);
});

test("reports candidate-pool deficits", () => {
  const result = generatePaper(questions, {
    ...validBlueprint,
    chapters: ["real-numbers"],
    sections: [{ name: "Section A", type: "MCQ_SINGLE", marksPerQuestion: 1, count: 9 }],
  });
  assert.equal(result.success, false);
  assert.equal(result.code, "INSUFFICIENT_POOL");
  assert.equal(result.deficits[0].available, 3);
});

test("rejects invalid difficulty totals", () => {
  const result = generatePaper(questions, {
    ...validBlueprint,
    difficulty: { EASY: 30, MEDIUM: 30, HARD: 20 },
  });
  assert.equal(result.success, false);
  assert.equal(result.code, "INVALID_DIFFICULTY");
});
