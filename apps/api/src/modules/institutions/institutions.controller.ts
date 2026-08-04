import { Body, Controller, Get, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { z } from "zod";
import { PrismaService } from "../../prisma/prisma.service";
import { AppError } from "../../common/app-error";
import { parseInput } from "../../common/zod";
import { AuthGuard, InstitutionGuard, RolesGuard } from "../auth/auth.guards";
import { CurrentInstitution, CurrentUser, Roles } from "../auth/auth.decorators";
import type { AuthUser } from "../auth/auth.types";
import { managerRoles } from "../auth/permission-map";
const memberSchema = z.object({ email: z.string().email(), role: z.enum(["ADMIN", "HOD", "TEACHER", "CONTENT_REVIEWER"]) }).strict();
@Controller("institutions") @UseGuards(AuthGuard, InstitutionGuard, RolesGuard)
export class InstitutionsController {
  constructor(private readonly prisma: PrismaService) {}
  @Get("current") current(@CurrentInstitution() institutionId: string): Promise<unknown> { return this.prisma.institution.findUnique({ where: { id: institutionId }, select: { id: true, name: true, slug: true, institutionType: true, status: true } }); }
  @Get("members") members(@CurrentInstitution() institutionId: string): Promise<unknown> { return this.prisma.institutionMember.findMany({ where: { institutionId, deletedAt: null }, select: { id: true, role: true, status: true, joinedAt: true, user: { select: { id: true, email: true, firstName: true, lastName: true } } }, orderBy: { joinedAt: "asc" } }); }
  @Post("members") @Roles(...managerRoles) async addMember(@CurrentInstitution() institutionId: string, @CurrentUser() actor: AuthUser, @Body() body: unknown, @Req() request: Request): Promise<unknown> { const input = parseInput(memberSchema, body); const user = await this.prisma.user.findUnique({ where: { email: input.email.toLowerCase() } }); if (!user) throw new AppError("USER_NOT_FOUND", "Invitee must register before being added.", HttpStatus.NOT_FOUND); return this.prisma.$transaction(async (transaction) => { const member = await transaction.institutionMember.upsert({ where: { institutionId_userId: { institutionId, userId: user.id } }, create: { institutionId, userId: user.id, role: input.role }, update: { role: input.role, status: "ACTIVE", deletedAt: null } }); await transaction.auditLog.create({ data: { institutionId, actorUserId: actor.id, action: "MEMBER_ADDED", entityType: "InstitutionMember", entityId: member.id, requestId: request.requestId, afterData: { userId: user.id, role: input.role } } }); return member; }); }
  @Get("dashboard") async dashboard(@CurrentInstitution() institutionId: string, @CurrentUser() user: AuthUser): Promise<unknown> { const [institution, questions, approvedQuestions, draftQuestions, blueprints, papers, recentPapers] = await this.prisma.$transaction([this.prisma.institution.findUnique({ where: { id: institutionId }, select: { id: true, name: true } }), this.prisma.question.count({ where: { institutionId, deletedAt: null } }), this.prisma.question.count({ where: { institutionId, deletedAt: null, reviewStatus: "APPROVED" } }), this.prisma.question.count({ where: { institutionId, deletedAt: null, reviewStatus: "DRAFT" } }), this.prisma.paperBlueprint.count({ where: { institutionId, deletedAt: null } }), this.prisma.questionPaper.count({ where: { institutionId, deletedAt: null } }), this.prisma.questionPaper.findMany({ where: { institutionId, deletedAt: null }, select: { id: true, title: true, totalMarks: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 5 })]); return { institution, user, metrics: { questions, approvedQuestions, draftQuestions, blueprints, papers }, recentPapers }; }
}
