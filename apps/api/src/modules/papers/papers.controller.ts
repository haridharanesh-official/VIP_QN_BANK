import { Controller, Get, HttpStatus, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { z } from "zod";
import { PrismaService } from "../../prisma/prisma.service";
import { AppError } from "../../common/app-error";
import { parseInput } from "../../common/zod";
import { AuthGuard, InstitutionGuard, RolesGuard } from "../auth/auth.guards";
import { CurrentInstitution, CurrentUser } from "../auth/auth.decorators";
import type { AuthUser } from "../auth/auth.types";

const uuid = z.string().uuid();
const viewSchema = z.enum(["QUESTION_PAPER", "ANSWER_KEY", "QUESTIONS_WITH_ANSWERS"]).default("QUESTIONS_WITH_ANSWERS");
@Controller("papers") @UseGuards(AuthGuard, InstitutionGuard, RolesGuard)
export class PapersController {
  constructor(private readonly prisma: PrismaService) {}
  @Get() async list(@CurrentInstitution() institutionId: string, @Query("page") rawPage?: string, @Query("pageSize") rawPageSize?: string): Promise<unknown> {
    const page = z.coerce.number().int().positive().default(1).parse(rawPage); const pageSize = z.coerce.number().int().min(1).max(100).default(20).parse(rawPageSize);
    const where = { institutionId, deletedAt: null };
    const [items, total] = await this.prisma.$transaction([this.prisma.questionPaper.findMany({ where, select: { id: true, title: true, status: true, totalMarks: true, durationMinutes: true, algorithmVersion: true, createdAt: true, creator: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }), this.prisma.questionPaper.count({ where })]);
    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }
  @Get(":id") async get(@CurrentInstitution() institutionId: string, @Param("id") id: string, @Query("view") rawView?: string): Promise<unknown> { return this.paper(institutionId, parseInput(uuid, id), parseInput(viewSchema, rawView)); }
  @Get(":id/snapshot") async snapshot(@CurrentInstitution() institutionId: string, @Param("id") id: string, @Query("view") rawView?: string): Promise<unknown> { const paper = await this.paper(institutionId, parseInput(uuid, id), parseInput(viewSchema, rawView)); return paper && typeof paper === "object" ? Reflect.get(paper, "snapshot") : undefined; }
  @Post(":id/archive") async archive(@CurrentInstitution() institutionId: string, @CurrentUser() user: AuthUser, @Param("id") id: string, @Req() request: Request): Promise<unknown> {
    const paperId = parseInput(uuid, id); await this.find(institutionId, paperId);
    const [paper] = await this.prisma.$transaction([this.prisma.questionPaper.update({ where: { id: paperId }, data: { status: "ARCHIVED", deletedAt: new Date() } }), this.prisma.auditLog.create({ data: { institutionId, actorUserId: user.id, action: "PAPER_ARCHIVED", entityType: "QuestionPaper", entityId: paperId, requestId: request.requestId } })]); return paper;
  }
  private async find(institutionId: string, id: string): Promise<unknown> { const paper = await this.prisma.questionPaper.findFirst({ where: { id, institutionId, deletedAt: null } }); if (!paper) throw new AppError("PAPER_NOT_FOUND", "Paper not found.", HttpStatus.NOT_FOUND); return paper; }
  private async paper(institutionId: string, id: string, view: "QUESTION_PAPER" | "ANSWER_KEY" | "QUESTIONS_WITH_ANSWERS"): Promise<unknown> {
    const paper = await this.prisma.questionPaper.findFirst({ where: { id, institutionId, deletedAt: null }, include: { snapshots: { orderBy: { snapshotVersion: "desc" }, take: 1 }, creator: { select: { id: true, firstName: true, lastName: true } } } });
    if (!paper || !paper.snapshots[0]) throw new AppError("PAPER_NOT_FOUND", "Paper snapshot not found.", HttpStatus.NOT_FOUND);
    return { ...paper, snapshots: undefined, snapshot: { version: paper.snapshots[0].snapshotVersion, checksum: paper.snapshots[0].checksum, createdAt: paper.snapshots[0].createdAt, paperData: this.project(paper.snapshots[0].paperData, view) } };
  }
  private project(data: unknown, view: "QUESTION_PAPER" | "ANSWER_KEY" | "QUESTIONS_WITH_ANSWERS"): unknown {
    if (view === "QUESTIONS_WITH_ANSWERS") return data;
    if (!data || typeof data !== "object") return data;
    const clone = structuredClone(data);
    const sections = Reflect.get(clone, "sections");
    if (!Array.isArray(sections)) return clone;
    for (const section of sections) { const questions = Reflect.get(section, "questions"); if (!Array.isArray(questions)) continue; for (const question of questions) { if (view === "QUESTION_PAPER") { Reflect.deleteProperty(question, "correctAnswer"); Reflect.deleteProperty(question, "solution"); } else { Reflect.deleteProperty(question, "questionText"); Reflect.deleteProperty(question, "options"); } } }
    return clone;
  }
}
