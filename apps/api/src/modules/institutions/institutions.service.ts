import { Injectable, HttpStatus } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AppError } from "../../common/app-error";
import type { Request } from "express";

@Injectable()
export class InstitutionsService {
  constructor(private readonly prisma: PrismaService) {}

  getCurrent(institutionId: string): Promise<unknown> {
    return this.prisma.institution.findUnique({
      where: { id: institutionId },
      select: { id: true, name: true, slug: true, institutionType: true, status: true },
    });
  }

  getMembers(institutionId: string): Promise<unknown> {
    return this.prisma.institutionMember.findMany({
      where: { institutionId, deletedAt: null },
      select: {
        id: true,
        role: true,
        status: true,
        joinedAt: true,
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
      orderBy: { joinedAt: "asc" },
    });
  }

  async addMember(institutionId: string, email: string, role: any, actorUserId: string, requestId: string): Promise<unknown> {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      throw new AppError(
        "USER_NOT_FOUND",
        "Invitee must register before being added.",
        HttpStatus.NOT_FOUND
      );
    }
    return this.prisma.$transaction(async (transaction) => {
      const member = await transaction.institutionMember.upsert({
        where: { institutionId_userId: { institutionId, userId: user.id } },
        create: { institutionId, userId: user.id, role },
        update: { role, status: "ACTIVE", deletedAt: null },
      });
      await transaction.auditLog.create({
        data: {
          institutionId,
          actorUserId,
          action: "MEMBER_ADDED",
          entityType: "InstitutionMember",
          entityId: member.id,
          requestId,
          afterData: { userId: user.id, role },
        },
      });
      return member;
    });
  }

  async getDashboard(institutionId: string, user: any): Promise<unknown> {
    const [
      institution,
      questions,
      approvedQuestions,
      pendingQuestions,
      draftQuestions,
      blueprints,
      papers,
      recentPapers,
    ] = await this.prisma.$transaction([
      this.prisma.institution.findUnique({ where: { id: institutionId }, select: { id: true, name: true } }),
      this.prisma.question.count({ where: { institutionId, deletedAt: null } }),
      this.prisma.question.count({ where: { institutionId, deletedAt: null, reviewStatus: "APPROVED" } }),
      this.prisma.question.count({ where: { institutionId, deletedAt: null, reviewStatus: "PENDING_REVIEW" } }),
      this.prisma.question.count({ where: { institutionId, deletedAt: null, reviewStatus: "DRAFT" } }),
      this.prisma.paperBlueprint.count({ where: { institutionId, deletedAt: null } }),
      this.prisma.questionPaper.count({ where: { institutionId, deletedAt: null } }),
      this.prisma.questionPaper.findMany({
        where: { institutionId, deletedAt: null },
        select: { id: true, title: true, totalMarks: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);
    return {
      institution,
      user,
      metrics: { questions, approvedQuestions, pendingQuestions, draftQuestions, blueprints, papers },
      recentPapers,
    };
  }
}
