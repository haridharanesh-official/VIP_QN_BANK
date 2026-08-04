import { PrismaClient, type Difficulty, type QuestionType } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();
const subjects = [
  { code: "MATH10", name: "Mathematics", slug: "mathematics", chapters: ["Relations and Functions", "Numbers and Sequences", "Algebra", "Geometry", "Coordinate Geometry", "Trigonometry", "Mensuration", "Statistics and Probability"] },
  { code: "SCI10", name: "Science", slug: "science", chapters: ["Laws of Motion", "Optics", "Thermal Physics", "Electricity", "Atoms and Molecules", "Plant Physiology", "Genetics", "Health and Diseases"] },
  { code: "SOC10", name: "Social Science", slug: "social-science", chapters: ["Indian National Movement", "World Between the Wars", "Indian Constitution", "Resources and Industries", "Population and Settlement", "Indian Economy"] },
] as const;

async function main(): Promise<void> {
  const passwordHash = await argon2.hash("VIPMathsDev2026!", { type: argon2.argon2id });
  const owner = await prisma.user.upsert({ where: { email: "owner@vip-maths.local" }, update: { passwordHash }, create: { email: "owner@vip-maths.local", passwordHash, firstName: "Dev", lastName: "Owner", emailVerifiedAt: new Date() } });
  const reviewer = await prisma.user.upsert({ where: { email: "reviewer@vip-maths.local" }, update: { passwordHash }, create: { email: "reviewer@vip-maths.local", passwordHash, firstName: "Content", lastName: "Reviewer", emailVerifiedAt: new Date() } });
  const institution = await prisma.institution.upsert({ where: { slug: "vip-maths-demonstration-school" }, update: { name: "VIP Maths Demonstration School" }, create: { name: "VIP Maths Demonstration School", slug: "vip-maths-demonstration-school", institutionType: "SCHOOL", boardAffiliation: "Tamil Nadu State Board", city: "Chennai", state: "Tamil Nadu", createdByUserId: owner.id } });
  await prisma.institutionMember.upsert({ where: { institutionId_userId: { institutionId: institution.id, userId: owner.id } }, update: { role: "OWNER", status: "ACTIVE", deletedAt: null }, create: { institutionId: institution.id, userId: owner.id, role: "OWNER" } });
  await prisma.institutionMember.upsert({ where: { institutionId_userId: { institutionId: institution.id, userId: reviewer.id } }, update: { role: "CONTENT_REVIEWER", status: "ACTIVE", deletedAt: null }, create: { institutionId: institution.id, userId: reviewer.id, role: "CONTENT_REVIEWER" } });
  const board = await prisma.board.upsert({ where: { code: "TN_STATE" }, update: {}, create: { code: "TN_STATE", name: "Tamil Nadu State Board", slug: "tamil-nadu-state-board", sortOrder: 1 } });
  const syllabus = await prisma.syllabusVersion.upsert({ where: { boardId_code: { boardId: board.id, code: "2026-27" } }, update: { active: true }, create: { boardId: board.id, name: "Tamil Nadu State Board 2026–2027", code: "2026-27", academicYear: "2026–2027" } });
  const medium = await prisma.medium.upsert({ where: { code: "EN" }, update: {}, create: { code: "EN", name: "English", sortOrder: 1 } });
  await prisma.standard.upsert({ where: { syllabusVersionId_code: { syllabusVersionId: syllabus.id, code: "9" } }, update: {}, create: { syllabusVersionId: syllabus.id, code: "9", name: "Class 9", sortOrder: 9 } });
  const standard = await prisma.standard.upsert({ where: { syllabusVersionId_code: { syllabusVersionId: syllabus.id, code: "10" } }, update: {}, create: { syllabusVersionId: syllabus.id, code: "10", name: "Class 10", sortOrder: 10 } });
  let mathematicsId = "";
  for (const [subjectIndex, definition] of subjects.entries()) {
    const subject = await prisma.subject.upsert({ where: { standardId_mediumId_code: { standardId: standard.id, mediumId: medium.id, code: definition.code } }, update: {}, create: { standardId: standard.id, mediumId: medium.id, code: definition.code, name: definition.name, slug: definition.slug, sortOrder: subjectIndex + 1 } });
    if (definition.code === "MATH10") mathematicsId = subject.id;
    for (const [chapterIndex, chapterName] of definition.chapters.entries()) {
      const chapter = await prisma.chapter.upsert({ where: { subjectId_code: { subjectId: subject.id, code: `${definition.code}-CH${chapterIndex + 1}` } }, update: {}, create: { subjectId: subject.id, code: `${definition.code}-CH${chapterIndex + 1}`, name: chapterName, slug: chapterName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), sortOrder: chapterIndex + 1 } });
      await prisma.topic.upsert({ where: { chapterId_slug: { chapterId: chapter.id, slug: "core-concepts" } }, update: {}, create: { chapterId: chapter.id, name: "Core concepts", slug: "core-concepts", sortOrder: 1 } });
      if (await prisma.question.count({ where: { chapterId: chapter.id } }) === 0) {
        const patterns: readonly { type: QuestionType; marks: number }[] = [{ type: "MCQ_SINGLE", marks: 1 }, { type: "SHORT_ANSWER", marks: 2 }, { type: "SHORT_ANSWER", marks: 3 }, { type: "LONG_ANSWER", marks: 5 }, { type: "MCQ_SINGLE", marks: 1 }, { type: "SHORT_ANSWER", marks: 2 }, { type: "SHORT_ANSWER", marks: 3 }];
        for (const [index, pattern] of patterns.entries()) {
          const difficulty: Difficulty = (["EASY", "MEDIUM", "HARD"] as const)[(chapterIndex + index) % 3];
          const mcq = pattern.type === "MCQ_SINGLE";
          await prisma.question.create({ data: { ownershipScope: "GLOBAL", boardId: board.id, syllabusVersionId: syllabus.id, mediumId: medium.id, standardId: standard.id, subjectId: subject.id, chapterId: chapter.id, questionType: pattern.type, marks: pattern.marks, difficulty, bloomLevel: (["REMEMBER", "UNDERSTAND", "APPLY", "ANALYZE"] as const)[index % 4], questionText: mcq ? `Which statement best demonstrates concept ${index + 1} from ${chapterName}?` : `${index % 2 ? "Explain" : "Apply"} a key idea from ${chapterName} in an original classroom example.`, options: mcq ? [{ id: "A", text: `A correct application of ${chapterName}` }, { id: "B", text: "An unrelated observation" }, { id: "C", text: "A contradictory statement" }, { id: "D", text: "Insufficient information" }] : undefined, correctAnswer: mcq ? "A" : `A complete response identifies the relevant ${chapterName} concept, applies it correctly, and justifies the conclusion.`, solution: `Award marks for identifying the concept, showing the reasoning, and presenting a valid conclusion.`, sourceType: index % 3 === 0 ? "BOOK_BACK" : index % 3 === 1 ? "CREATIVE" : "PREVIOUS_YEAR_STYLE", isBookBack: index % 3 === 0, isCreative: index % 3 === 1, isPreviousYear: index % 3 === 2, reviewStatus: "APPROVED", qualityScore: 90, createdByUserId: owner.id, reviewedByUserId: reviewer.id, reviewedAt: new Date() } });
        }
      }
    }
  }
  const blueprint = await prisma.paperBlueprint.findFirst({ where: { institutionId: institution.id, name: "Class 10 Mathematics Demonstration" } });
  if (!blueprint) await prisma.paperBlueprint.create({ data: { institutionId: institution.id, name: "Class 10 Mathematics Demonstration", description: "Balanced 25-mark development blueprint", boardId: board.id, syllabusVersionId: syllabus.id, mediumId: medium.id, standardId: standard.id, subjectId: mathematicsId, totalMarks: 25, durationMinutes: 60, instructions: ["Answer all questions.", "Show working for calculation questions."], status: "ACTIVE", createdByUserId: owner.id, sections: { create: [
    { name: "Section A", displayOrder: 1, questionType: "MCQ_SINGLE", marksPerQuestion: 1, questionCount: 5, difficultyDistribution: { EASY: 40, MEDIUM: 40, HARD: 20 } },
    { name: "Section B", displayOrder: 2, questionType: "SHORT_ANSWER", marksPerQuestion: 2, questionCount: 5, difficultyDistribution: { EASY: 30, MEDIUM: 50, HARD: 20 } },
    { name: "Section C", displayOrder: 3, questionType: "LONG_ANSWER", marksPerQuestion: 5, questionCount: 2, difficultyDistribution: { EASY: 20, MEDIUM: 40, HARD: 40 } },
  ] } } });
  console.info("Seed complete. VIP Maths development owner and reviewer accounts are ready.");
}
main().catch((error: unknown) => { console.error(error); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
