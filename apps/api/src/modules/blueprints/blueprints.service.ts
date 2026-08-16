import { randomUUID } from "node:crypto";
import { HttpStatus, Injectable } from "@nestjs/common";
import { Prisma, type MemberRole } from "@prisma/client";
import type { BlueprintCreateInput, BlueprintSectionInput, BlueprintUpdateInput } from "@edugen/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { AppError } from "../../common/app-error";
import { toJson } from "../../common/json";
import { BlueprintValidatorService } from "../papers/domain/blueprint-validator.service";
import { PaperGeneratorService } from "../papers/domain/paper-generator.service";
import type { Candidate, GenerationSection, ValidationResult } from "../papers/domain/generation.types";
import { questionSnapshot, snapshotChecksum } from "../papers/domain/snapshot-checksum";

type BlueprintWithSections = Prisma.PaperBlueprintGetPayload<{ include: { sections: true } }>;
@Injectable()
export class BlueprintsService {
  constructor(private readonly prisma: PrismaService, private readonly validator: BlueprintValidatorService, private readonly generator: PaperGeneratorService) {}
  async create(institutionId: string, userId: string, input: BlueprintCreateInput, requestId?: string): Promise<BlueprintWithSections> {
    await this.validateTaxonomy(input);
    return this.prisma.$transaction(async (transaction) => {
      const blueprint = await transaction.paperBlueprint.create({ data: { institutionId, name: input.name, description: input.description, boardId: input.boardId, syllabusVersionId: input.syllabusVersionId, mediumId: input.mediumId, standardId: input.standardId, subjectId: input.subjectId, totalMarks: input.totalMarks, durationMinutes: input.durationMinutes, instructions: input.instructions, createdByUserId: userId, sections: { create: input.sections.map((section) => this.sectionData(section)) } }, include: { sections: { orderBy: { displayOrder: "asc" } } } });
      await transaction.auditLog.create({ data: { institutionId, actorUserId: userId, action: "BLUEPRINT_CREATED", entityType: "PaperBlueprint", entityId: blueprint.id, requestId, afterData: { name: blueprint.name, totalMarks: blueprint.totalMarks } } });
      return blueprint;
    });
  }
  list(institutionId: string): Promise<unknown> { return this.prisma.paperBlueprint.findMany({ where: { institutionId, deletedAt: null }, include: { sections: { orderBy: { displayOrder: "asc" } } }, orderBy: { updatedAt: "desc" } }); }
  async get(institutionId: string, id: string): Promise<BlueprintWithSections> { const blueprint = await this.prisma.paperBlueprint.findFirst({ where: { id, institutionId, deletedAt: null }, include: { sections: { orderBy: { displayOrder: "asc" } } } }); if (!blueprint) throw new AppError("BLUEPRINT_NOT_FOUND", "Blueprint not found.", HttpStatus.NOT_FOUND); return blueprint; }
  async update(institutionId: string, userId: string, id: string, input: BlueprintUpdateInput, requestId?: string): Promise<BlueprintWithSections> {
    const current = await this.get(institutionId, id);
    const merged = { ...current, ...input };
    await this.validateTaxonomy(merged);
    return this.prisma.$transaction(async (transaction) => {
      if (input.sections) await transaction.blueprintSection.deleteMany({ where: { blueprintId: id } });
      const updated = await transaction.paperBlueprint.update({ where: { id }, data: { name: input.name, description: input.description, boardId: input.boardId, syllabusVersionId: input.syllabusVersionId, mediumId: input.mediumId, standardId: input.standardId, subjectId: input.subjectId, totalMarks: input.totalMarks, durationMinutes: input.durationMinutes, instructions: input.instructions, ...(input.sections ? { sections: { create: input.sections.map((section) => this.sectionData(section)) } } : {}) }, include: { sections: { orderBy: { displayOrder: "asc" } } } });
      await transaction.auditLog.create({ data: { institutionId, actorUserId: userId, action: "BLUEPRINT_UPDATED", entityType: "PaperBlueprint", entityId: id, requestId, beforeData: { name: current.name, totalMarks: current.totalMarks }, afterData: { name: updated.name, totalMarks: updated.totalMarks } } });
      return updated;
    });
  }
  async remove(institutionId: string, userId: string, id: string, requestId?: string): Promise<void> { await this.get(institutionId, id); await this.prisma.$transaction([this.prisma.paperBlueprint.update({ where: { id }, data: { deletedAt: new Date(), status: "ARCHIVED" } }), this.prisma.auditLog.create({ data: { institutionId, actorUserId: userId, action: "BLUEPRINT_ARCHIVED", entityType: "PaperBlueprint", entityId: id, requestId } })]); }
  async validate(institutionId: string, id: string): Promise<ValidationResult> { const blueprint = await this.get(institutionId, id); const candidates = await this.candidates(blueprint); return this.validator.validate(blueprint.totalMarks, blueprint.sections.map((section) => this.generationSection(section)), candidates); }
  async generate(institutionId: string, userId: string, id: string, requestId?: string): Promise<unknown> {
    const blueprint = await this.get(institutionId, id);
    const candidates = await this.candidates(blueprint);
    const sections = blueprint.sections.map((section) => this.generationSection(section));
    const validation = this.validator.validate(blueprint.totalMarks, sections, candidates);
    if (!validation.valid) throw new AppError("INVALID_BLUEPRINT", "Blueprint validation failed.", HttpStatus.UNPROCESSABLE_ENTITY, validation);
    const seed = randomUUID();
    const selections = this.generator.generate(sections, candidates, seed);
    const snapshot = { metadata: { title: blueprint.name, boardId: blueprint.boardId, syllabusVersionId: blueprint.syllabusVersionId, mediumId: blueprint.mediumId, standardId: blueprint.standardId, subjectId: blueprint.subjectId, totalMarks: blueprint.totalMarks, durationMinutes: blueprint.durationMinutes, instructions: blueprint.instructions, algorithmVersion: "edugen-greedy-1.0", generationSeed: seed, warnings: validation.warnings }, sections: selections.map((selection) => ({ id: selection.section.id, name: selection.section.name, displayOrder: selection.section.displayOrder, internalChoiceCount: selection.section.internalChoiceCount, questions: selection.questions.map((question, index) => questionSnapshot(question, index + 1)) })) };
    const checksum = snapshotChecksum(snapshot);
    return this.prisma.$transaction(async (transaction) => {
      const paper = await transaction.questionPaper.create({ data: { institutionId, blueprintId: blueprint.id, title: blueprint.name, boardId: blueprint.boardId, syllabusVersionId: blueprint.syllabusVersionId, mediumId: blueprint.mediumId, standardId: blueprint.standardId, subjectId: blueprint.subjectId, totalMarks: blueprint.totalMarks, durationMinutes: blueprint.durationMinutes, instructions: blueprint.instructions, generationMode: "BLUEPRINT", algorithmVersion: "edugen-greedy-1.0", generationSeed: seed, generationWarnings: toJson(validation.warnings), selectionDecisions: toJson(selections.map((selection) => ({ sectionId: selection.section.id, questionIds: selection.questions.map((question) => question.id) }))), createdByUserId: userId } });
      await transaction.paperSnapshot.create({ data: { questionPaperId: paper.id, snapshotVersion: 1, paperData: toJson(snapshot), checksum, createdByUserId: userId } });
      const questionIds = selections.flatMap((selection) => selection.questions.map((question) => question.id));
      await transaction.paperQuestionUsage.createMany({ data: questionIds.map((questionId) => ({ questionPaperId: paper.id, questionId, institutionId })) });
      await transaction.question.updateMany({ where: { id: { in: questionIds } }, data: { usageCount: { increment: 1 }, lastUsedAt: new Date() } });
      await transaction.auditLog.create({ data: { institutionId, actorUserId: userId, action: "PAPER_GENERATED", entityType: "QuestionPaper", entityId: paper.id, requestId, afterData: { blueprintId: blueprint.id, checksum, questionCount: questionIds.length } } });
      return { ...paper, snapshot: { ...snapshot, checksum } };
    });
  }
  private async candidates(blueprint: BlueprintWithSections): Promise<readonly Candidate[]> {
    const pairs = blueprint.sections.map((section) => ({ questionType: section.questionType, marks: section.marksPerQuestion }));
    const chapterIds = [...new Set(blueprint.sections.flatMap((section) => this.jsonKeys(section.chapterDistribution)))];
    const rows = await this.prisma.question.findMany({ where: { deletedAt: null, reviewStatus: "APPROVED", subjectId: blueprint.subjectId, ...(chapterIds.length ? { chapterId: { in: chapterIds } } : {}), OR: [{ ownershipScope: "GLOBAL" }, { institutionId: blueprint.institutionId, ownershipScope: "INSTITUTION" }], AND: [{ OR: pairs }] }, take: 2000 });
    // marks/difficulty/bloomLevel are nullable on Question (unclassified imported content), but the
    // `pairs` filter above already requires an exact marks match, so no null-marks row can reach
    // here; difficulty/bloomLevel are excluded defensively since classification is still pending
    // for freshly imported, not-yet-reviewed questions.
    return rows
      .filter((row): row is typeof row & { marks: number; difficulty: NonNullable<typeof row.difficulty>; bloomLevel: NonNullable<typeof row.bloomLevel> } => row.marks !== null && row.difficulty !== null && row.bloomLevel !== null)
      .map((row) => ({ id: row.id, chapterId: row.chapterId, questionType: row.questionType, marks: row.marks, difficulty: row.difficulty, bloomLevel: row.bloomLevel, sourceType: row.sourceType, usageCount: row.usageCount, lastUsedAt: row.lastUsedAt, questionText: row.questionText, options: row.options, correctAnswer: row.correctAnswer, solution: row.solution, isBookBack: row.isBookBack, isCreative: row.isCreative, isPreviousYear: row.isPreviousYear }));
  }
  private generationSection(section: BlueprintWithSections["sections"][number]): GenerationSection { return { id: section.id, name: section.name, displayOrder: section.displayOrder, questionType: section.questionType, marksPerQuestion: section.marksPerQuestion, questionCount: section.questionCount, internalChoiceCount: section.internalChoiceCount, difficultyDistribution: section.difficultyDistribution, chapterDistribution: section.chapterDistribution }; }
  private sectionData(section: BlueprintSectionInput): Prisma.BlueprintSectionCreateWithoutBlueprintInput { return { name: section.name, description: section.description, displayOrder: section.displayOrder, questionType: section.questionType, marksPerQuestion: section.marksPerQuestion, questionCount: section.questionCount, internalChoiceCount: section.internalChoiceCount, isCompulsory: section.isCompulsory, chapterDistribution: section.chapterDistribution ? toJson(section.chapterDistribution) : undefined, difficultyDistribution: section.difficultyDistribution ? toJson(section.difficultyDistribution) : undefined, bloomDistribution: section.bloomDistribution ? toJson(section.bloomDistribution) : undefined, sourceConstraints: section.sourceConstraints ? toJson(section.sourceConstraints) : undefined }; }
  private jsonKeys(value: unknown): readonly string[] { return value && typeof value === "object" && !Array.isArray(value) ? Object.keys(value) : []; }
  private async validateTaxonomy(input: { boardId: string; syllabusVersionId: string; mediumId: string; standardId: string; subjectId: string }): Promise<void> { const subject = await this.prisma.subject.findFirst({ where: { id: input.subjectId, standardId: input.standardId, mediumId: input.mediumId, standard: { syllabusVersionId: input.syllabusVersionId, syllabusVersion: { boardId: input.boardId } } } }); if (!subject) throw new AppError("INVALID_TAXONOMY", "Blueprint taxonomy is inconsistent.", HttpStatus.BAD_REQUEST); }
}
