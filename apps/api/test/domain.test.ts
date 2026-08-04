import test from "node:test";
import assert from "node:assert/strict";
import * as argon2 from "argon2";
import { MemberRole } from "@prisma/client";
import { durationSeconds } from "../src/config/environment";
import { reviewerRoles, managerRoles } from "../src/modules/auth/permission-map";
import { BlueprintValidatorService } from "../src/modules/papers/domain/blueprint-validator.service";
import { CandidateScoringService } from "../src/modules/papers/domain/candidate-scoring.service";
import { PaperGeneratorService } from "../src/modules/papers/domain/paper-generator.service";
import { questionSnapshot, snapshotChecksum } from "../src/modules/papers/domain/snapshot-checksum";
import type { Candidate, GenerationSection } from "../src/modules/papers/domain/generation.types";

const section: GenerationSection = { id: "section-a", name: "Section A", displayOrder: 1, questionType: "MCQ_SINGLE", marksPerQuestion: 1, questionCount: 2, internalChoiceCount: 0, difficultyDistribution: { EASY: 50, MEDIUM: 50, HARD: 0 }, chapterDistribution: null };
const candidate = (id: string, difficulty: Candidate["difficulty"], usageCount = 0): Candidate => ({ id, chapterId: "chapter", questionType: "MCQ_SINGLE", marks: 1, difficulty, bloomLevel: "REMEMBER", sourceType: "BOOK_BACK", usageCount, lastUsedAt: null, questionText: `Question ${id}`, options: [{ id: "A", text: "Answer" }], correctAnswer: "A", solution: "A", isBookBack: true, isCreative: false, isPreviousYear: false });

test("Argon2id hashes and verifies passwords without preserving plaintext", async () => { const hash = await argon2.hash("StrongPassword2026", { type: argon2.argon2id }); assert.equal(await argon2.verify(hash, "StrongPassword2026"), true); assert.equal(hash.includes("StrongPassword2026"), false); assert.match(hash, /^\$argon2id\$/); });
test("token duration parser supports configured units", () => { assert.equal(durationSeconds("15m"), 900); assert.equal(durationSeconds("7d"), 604800); assert.throws(() => durationSeconds("15 minutes")); });
test("permission map centralizes reviewer and manager roles", () => { assert.equal(reviewerRoles.includes(MemberRole.CONTENT_REVIEWER), true); assert.equal(reviewerRoles.includes(MemberRole.TEACHER), false); assert.deepEqual(managerRoles, [MemberRole.OWNER, MemberRole.ADMIN]); });
test("blueprint validation checks marks, distributions and candidate pools", () => { const service = new BlueprintValidatorService(); assert.equal(service.validate(2, [section], [candidate("1", "EASY"), candidate("2", "MEDIUM")]).valid, true); const invalid = service.validate(3, [{ ...section, difficultyDistribution: { EASY: 20, MEDIUM: 20 } }], [candidate("1", "EASY")]); assert.deepEqual(invalid.errors.map((issue) => issue.code).sort(), ["INSUFFICIENT_QUESTION_POOL", "INVALID_DIFFICULTY_DISTRIBUTION", "MARK_TOTAL_MISMATCH"]); });
test("candidate scoring favors low reuse and generation selects unique questions", () => { const scoring = new CandidateScoringService(); assert.ok(scoring.score(candidate("fresh", "EASY"), section, "seed") > scoring.score(candidate("used", "EASY", 20), section, "seed")); const selections = new PaperGeneratorService(scoring).generate([section], [candidate("1", "EASY"), candidate("2", "MEDIUM"), candidate("3", "HARD")], "seed"); assert.equal(selections[0].questions.length, 2); assert.equal(new Set(selections[0].questions.map((question) => question.id)).size, 2); });
test("snapshot checksum is stable across object key order and changes with content", () => { assert.equal(snapshotChecksum({ b: 2, a: 1 }), snapshotChecksum({ a: 1, b: 2 })); assert.notEqual(snapshotChecksum({ text: "before" }), snapshotChecksum({ text: "after" })); });
test("paper question snapshots remain unchanged when the bank record changes", () => { const original = candidate("immutable", "EASY"); const snapshot = questionSnapshot(original, 1); const edited = { ...original, questionText: "Edited question", correctAnswer: "B" }; assert.equal(snapshot.questionText, "Question immutable"); assert.equal(snapshot.correctAnswer, "A"); assert.equal(edited.questionText, "Edited question"); });
