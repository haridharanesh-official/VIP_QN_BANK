import { HttpStatus, Injectable } from "@nestjs/common";
import { MemberRole, Prisma, ReviewStatus, type Question } from "@prisma/client";
import type { PageResult, QuestionCreateInput, QuestionUpdateInput, ReviewInput } from "@edugen/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { AppError } from "../../common/app-error";
import { toJson } from "../../common/json";
import { reviewerRoles } from "../auth/permission-map";
import { tenantRecordAccessible } from "../auth/tenant-policy";

interface QuestionListQuery { page: number; pageSize: number; search?: string; subjectId?: string; chapterId?: string; topicId?: string; questionType?: Question["questionType"]; marks?: number; difficulty?: Question["difficulty"]; reviewStatus?: Question["reviewStatus"]; ownershipScope?: Question["ownershipScope"]; createdByUserId?: string; isBookBack?: boolean; isCreative?: boolean; isPreviousYear?: boolean }
@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}
  async create(institutionId: string, userId: string, input: QuestionCreateInput, requestId?: string): Promise<Question> {
    if (input.ownershipScope === "GLOBAL") throw new AppError("GLOBAL_SCOPE_FORBIDDEN", "Institution users cannot create global questions.", HttpStatus.FORBIDDEN);
    await this.validateTaxonomy(input);
    const question = await this.prisma.question.create({ data: {
      institutionId, ownershipScope: input.ownershipScope, boardId: input.boardId, syllabusVersionId: input.syllabusVersionId, mediumId: input.mediumId, standardId: input.standardId, subjectId: input.subjectId, chapterId: input.chapterId, topicId: input.topicId,
      questionType: input.questionType, marks: input.marks, difficulty: input.difficulty, bloomLevel: input.bloomLevel, questionText: input.questionText, questionTextFormat: input.questionTextFormat,
      correctAnswer: toJson(input.correctAnswer), alternativeAnswers: input.alternativeAnswers === undefined ? undefined : toJson(input.alternativeAnswers), solution: input.solution, explanation: input.explanation, hint: input.hint, markingScheme: input.markingScheme === undefined ? undefined : toJson(input.markingScheme), options: input.options === undefined ? undefined : toJson(input.options), sourceType: input.sourceType, sourceReference: input.sourceReference,
      isBookBack: input.isBookBack, isCreative: input.isCreative, isPreviousYear: input.isPreviousYear, isPta: input.isPta, isHots: input.isHots, isCaseStudy: input.isCaseStudy, createdByUserId: userId,
    } });
    await this.audit.create({ institutionId, actorUserId: userId, action: "QUESTION_CREATED", entityType: "Question", entityId: question.id, requestId, afterData: { reviewStatus: question.reviewStatus, ownershipScope: question.ownershipScope } });
    return question;
  }
  async list(institutionId: string, userId: string, role: MemberRole, query: QuestionListQuery): Promise<PageResult<Question>> {
    const filters: Prisma.QuestionWhereInput = { deletedAt: null,
      ...(query.search ? { questionText: { contains: query.search, mode: "insensitive" } } : {}), ...(query.subjectId ? { subjectId: query.subjectId } : {}), ...(query.chapterId ? { chapterId: query.chapterId } : {}), ...(query.topicId ? { topicId: query.topicId } : {}), ...(query.questionType ? { questionType: query.questionType } : {}), ...(query.marks ? { marks: query.marks } : {}), ...(query.difficulty ? { difficulty: query.difficulty } : {}), ...(query.reviewStatus ? { reviewStatus: query.reviewStatus } : {}), ...(query.ownershipScope ? { ownershipScope: query.ownershipScope } : {}), ...(query.createdByUserId ? { createdByUserId: query.createdByUserId } : {}), ...(query.isBookBack === undefined ? {} : { isBookBack: query.isBookBack }), ...(query.isCreative === undefined ? {} : { isCreative: query.isCreative }), ...(query.isPreviousYear === undefined ? {} : { isPreviousYear: query.isPreviousYear }),
      AND: [{ OR: [
        { ownershipScope: "GLOBAL", reviewStatus: "APPROVED" },
        { institutionId, ownershipScope: "INSTITUTION", reviewStatus: "APPROVED" },
        { institutionId, createdByUserId: userId },
        ...(reviewerRoles.includes(role) ? [{ institutionId, ownershipScope: "INSTITUTION" as const }] : []),
      ] }],
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.question.findMany({ where: filters, orderBy: { createdAt: "desc" }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
      this.prisma.question.count({ where: filters }),
    ]);
    return { items, page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) };
  }
  async get(institutionId: string, userId: string, role: MemberRole, id: string): Promise<Question> {
    const question = await this.prisma.question.findFirst({ where: { id, deletedAt: null } });
    if (!question || !this.canRead(question, institutionId, userId, role)) throw new AppError("QUESTION_NOT_FOUND", "Question not found.", HttpStatus.NOT_FOUND);
    return question;
  }
  async update(institutionId: string, userId: string, role: MemberRole, id: string, input: QuestionUpdateInput, requestId?: string): Promise<Question> {
    const current = await this.get(institutionId, userId, role, id);
    const privileged = reviewerRoles.includes(role);
    if (current.createdByUserId !== userId && !privileged) throw new AppError("QUESTION_UPDATE_FORBIDDEN", "You cannot update this question.", HttpStatus.FORBIDDEN);
    if (current.reviewStatus === "PENDING_REVIEW") throw new AppError("QUESTION_LOCKED", "Pending questions cannot be edited.", HttpStatus.CONFLICT);
    if (current.version !== input.version) throw new AppError("STALE_QUESTION_VERSION", "The question was updated by another user.", HttpStatus.CONFLICT, { expected: current.version, received: input.version });
    await this.validateTaxonomy({ boardId: input.boardId ?? current.boardId, syllabusVersionId: input.syllabusVersionId ?? current.syllabusVersionId, mediumId: input.mediumId ?? current.mediumId, standardId: input.standardId ?? current.standardId, subjectId: input.subjectId ?? current.subjectId, chapterId: input.chapterId ?? current.chapterId, topicId: input.topicId ?? current.topicId ?? undefined });
    const data = this.updateData(input, current.reviewStatus === "APPROVED" ? ReviewStatus.PENDING_REVIEW : current.reviewStatus);
    const updated = await this.prisma.$transaction(async (transaction) => {
      if (current.reviewStatus === "APPROVED") await transaction.questionVersion.create({ data: { questionId: current.id, versionNumber: current.version, snapshot: toJson(current), changedByUserId: userId, changeReason: input.changeReason } });
      const row = await transaction.question.update({ where: { id }, data: { ...data, version: { increment: 1 }, reviewedAt: current.reviewStatus === "APPROVED" ? null : undefined, reviewedByUserId: current.reviewStatus === "APPROVED" ? null : undefined } });
      await transaction.auditLog.create({ data: { institutionId, actorUserId: userId, action: "QUESTION_UPDATED", entityType: "Question", entityId: id, requestId, beforeData: { version: current.version, reviewStatus: current.reviewStatus }, afterData: { version: row.version, reviewStatus: row.reviewStatus } } });
      return row;
    });
    return updated;
  }
  async remove(institutionId: string, userId: string, role: MemberRole, id: string, requestId?: string): Promise<void> {
    const question = await this.get(institutionId, userId, role, id);
    if (question.createdByUserId !== userId && !reviewerRoles.includes(role)) throw new AppError("QUESTION_DELETE_FORBIDDEN", "You cannot archive this question.", HttpStatus.FORBIDDEN);
    await this.prisma.$transaction([
      this.prisma.question.update({ where: { id }, data: { deletedAt: new Date(), reviewStatus: "ARCHIVED" } }),
      this.prisma.auditLog.create({ data: { institutionId, actorUserId: userId, action: "QUESTION_ARCHIVED", entityType: "Question", entityId: id, requestId } }),
    ]);
  }
  async submit(institutionId: string, userId: string, role: MemberRole, id: string, requestId?: string): Promise<Question> {
    const question = await this.get(institutionId, userId, role, id);
    if (question.createdByUserId !== userId || !["DRAFT", "CHANGES_REQUESTED", "REJECTED"].includes(question.reviewStatus)) throw new AppError("INVALID_REVIEW_TRANSITION", "This question cannot be submitted for review.", HttpStatus.UNPROCESSABLE_ENTITY);
    const updated = await this.prisma.question.update({ where: { id }, data: { reviewStatus: "PENDING_REVIEW" } });
    await this.audit.create({ institutionId, actorUserId: userId, action: "QUESTION_SUBMITTED", entityType: "Question", entityId: id, requestId });
    return updated;
  }
  async review(institutionId: string, userId: string, role: MemberRole, id: string, input: ReviewInput, requestId?: string): Promise<Question> {
    if (!reviewerRoles.includes(role)) throw new AppError("REVIEW_FORBIDDEN", "Your role cannot review questions.", HttpStatus.FORBIDDEN);
    const question = await this.get(institutionId, userId, role, id);
    if (question.reviewStatus !== "PENDING_REVIEW") throw new AppError("INVALID_REVIEW_TRANSITION", "Only pending questions may be reviewed.", HttpStatus.UNPROCESSABLE_ENTITY);
    const newStatus: ReviewStatus = input.decision;
    return this.prisma.$transaction(async (transaction) => {
      const updated = await transaction.question.update({ where: { id }, data: { reviewStatus: newStatus, reviewedByUserId: userId, reviewedAt: new Date() } });
      await transaction.questionReview.create({ data: { questionId: id, reviewerUserId: userId, decision: input.decision, comments: input.comments, previousStatus: question.reviewStatus, newStatus } });
      await transaction.auditLog.create({ data: { institutionId, actorUserId: userId, action: `QUESTION_${input.decision}`, entityType: "Question", entityId: id, requestId, beforeData: { reviewStatus: question.reviewStatus }, afterData: { reviewStatus: newStatus } } });
      return updated;
    });
  }
  versions(institutionId: string, userId: string, role: MemberRole, id: string): Promise<unknown> { return this.get(institutionId, userId, role, id).then(() => this.prisma.questionVersion.findMany({ where: { questionId: id }, orderBy: { versionNumber: "desc" } })); }
  reviews(institutionId: string, userId: string, role: MemberRole, id: string): Promise<unknown> { return this.get(institutionId, userId, role, id).then(() => this.prisma.questionReview.findMany({ where: { questionId: id }, orderBy: { createdAt: "desc" } })); }
  private canRead(question: Question, institutionId: string, userId: string, role: MemberRole): boolean { if (question.ownershipScope === "GLOBAL") return question.reviewStatus === "APPROVED"; if (!tenantRecordAccessible(institutionId, question.institutionId)) return false; if (question.ownershipScope === "PRIVATE") return question.createdByUserId === userId; return question.reviewStatus === "APPROVED" || question.createdByUserId === userId || reviewerRoles.includes(role); }
  private async validateTaxonomy(input: Pick<QuestionCreateInput, "boardId" | "syllabusVersionId" | "mediumId" | "standardId" | "subjectId" | "chapterId" | "topicId">): Promise<void> {
    const chapter = await this.prisma.chapter.findFirst({ where: { id: input.chapterId, subjectId: input.subjectId, subject: { standardId: input.standardId, mediumId: input.mediumId, standard: { syllabusVersionId: input.syllabusVersionId, syllabusVersion: { boardId: input.boardId } } } }, include: { topics: input.topicId ? { where: { id: input.topicId } } : false } });
    if (!chapter || (input.topicId && chapter.topics.length === 0)) throw new AppError("INVALID_TAXONOMY", "The selected academic taxonomy is inconsistent.", HttpStatus.BAD_REQUEST);
  }
  private updateData(input: QuestionUpdateInput, reviewStatus: ReviewStatus): Prisma.QuestionUncheckedUpdateInput {
    const { version: _version, changeReason: _reason, correctAnswer, alternativeAnswers, markingScheme, options, ...plain } = input;
    return { ...plain, reviewStatus, ...(correctAnswer === undefined ? {} : { correctAnswer: toJson(correctAnswer) }), ...(alternativeAnswers === undefined ? {} : { alternativeAnswers: toJson(alternativeAnswers) }), ...(markingScheme === undefined ? {} : { markingScheme: toJson(markingScheme) }), ...(options === undefined ? {} : { options: toJson(options) }) };
  }
}
