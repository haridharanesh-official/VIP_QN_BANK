import { Injectable, HttpStatus } from "@nestjs/common";
import { createHash } from "node:crypto";
import { PrismaService } from "../../prisma/prisma.service";
import { AppError } from "../../common/app-error";

@Injectable()
export class PapersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(institutionId: string, page: number, pageSize: number): Promise<unknown> {
    const where = { institutionId, deletedAt: null };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.questionPaper.findMany({
        where,
        select: {
          id: true,
          title: true,
          status: true,
          totalMarks: true,
          durationMinutes: true,
          algorithmVersion: true,
          createdAt: true,
          creator: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.questionPaper.count({ where }),
    ]);
    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async getWithProjection(
    institutionId: string,
    id: string,
    view: "QUESTION_PAPER" | "ANSWER_KEY" | "QUESTIONS_WITH_ANSWERS",
    set: "A" | "B" | "C"
  ): Promise<unknown> {
    const paper = await this.prisma.questionPaper.findFirst({
      where: { id, institutionId, deletedAt: null },
      include: {
        snapshots: { orderBy: { snapshotVersion: "desc" }, take: 1 },
        creator: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!paper || !paper.snapshots[0])
      throw new AppError("PAPER_NOT_FOUND", "Paper snapshot not found.", HttpStatus.NOT_FOUND);

    const projectedData = this.project(paper.snapshots[0].paperData, view, set);

    return {
      ...paper,
      snapshots: undefined,
      snapshot: {
        version: paper.snapshots[0].snapshotVersion,
        checksum: paper.snapshots[0].checksum,
        createdAt: paper.snapshots[0].createdAt,
        setLabel: `Set ${set}`,
        paperData: projectedData,
      },
    };
  }

  async getSnapshot(
    institutionId: string,
    id: string,
    view: "QUESTION_PAPER" | "ANSWER_KEY" | "QUESTIONS_WITH_ANSWERS",
    set: "A" | "B" | "C"
  ): Promise<unknown> {
    const paper = await this.getWithProjection(institutionId, id, view, set);
    return paper && typeof paper === "object" ? Reflect.get(paper, "snapshot") : undefined;
  }

  async createRevision(
    institutionId: string,
    userId: string,
    paperId: string,
    input: { paperData: any; reason?: string },
    requestId: string
  ): Promise<unknown> {
    await this.find(institutionId, paperId);

    const checksum = createHash("sha256")
      .update(JSON.stringify(input.paperData))
      .digest("hex");

    const latestSnapshot = await this.prisma.paperSnapshot.findFirst({
      where: { questionPaperId: paperId },
      orderBy: { snapshotVersion: "desc" },
    });

    const nextVersion = (latestSnapshot?.snapshotVersion ?? 0) + 1;

    return this.prisma.$transaction(async (transaction) => {
      const snapshot = await transaction.paperSnapshot.create({
        data: {
          questionPaperId: paperId,
          snapshotVersion: nextVersion,
          paperData: input.paperData as object,
          checksum,
          createdByUserId: userId,
        },
      });

      await transaction.questionPaper.update({
        where: { id: paperId },
        data: { updatedAt: new Date() },
      });

      await transaction.auditLog.create({
        data: {
          institutionId,
          actorUserId: userId,
          action: "PAPER_REVISION_CREATED",
          entityType: "PaperSnapshot",
          entityId: snapshot.id,
          requestId,
          afterData: { version: nextVersion, checksum, reason: input.reason },
        },
      });

      return {
        id: paperId,
        snapshotVersion: nextVersion,
        checksum,
        createdAt: snapshot.createdAt,
      };
    });
  }

  async archive(institutionId: string, userId: string, paperId: string, requestId: string): Promise<unknown> {
    await this.find(institutionId, paperId);

    const [paper] = await this.prisma.$transaction([
      this.prisma.questionPaper.update({
        where: { id: paperId },
        data: { status: "ARCHIVED", deletedAt: new Date() },
      }),
      this.prisma.auditLog.create({
        data: {
          institutionId,
          actorUserId: userId,
          action: "PAPER_ARCHIVED",
          entityType: "QuestionPaper",
          entityId: paperId,
          requestId,
        },
      }),
    ]);
    return paper;
  }

  private async find(institutionId: string, id: string): Promise<unknown> {
    const paper = await this.prisma.questionPaper.findFirst({
      where: { id, institutionId, deletedAt: null },
    });
    if (!paper) throw new AppError("PAPER_NOT_FOUND", "Paper not found.", HttpStatus.NOT_FOUND);
    return paper;
  }

  private project(
    data: unknown,
    view: "QUESTION_PAPER" | "ANSWER_KEY" | "QUESTIONS_WITH_ANSWERS",
    set: "A" | "B" | "C"
  ): unknown {
    if (!data || typeof data !== "object") return data;
    const clone = structuredClone(data);
    const sections = Reflect.get(clone, "sections");
    if (!Array.isArray(sections)) return clone;

    if (set !== "A") {
      this.applySetShuffling(sections, set);
    }

    for (const section of sections) {
      const questions = Reflect.get(section, "questions");
      if (!Array.isArray(questions)) continue;
      for (const question of questions) {
        if (view === "QUESTION_PAPER") {
          Reflect.deleteProperty(question, "correctAnswer");
          Reflect.deleteProperty(question, "solution");
        } else if (view === "ANSWER_KEY") {
          Reflect.deleteProperty(question, "questionText");
          Reflect.deleteProperty(question, "options");
        }
      }
    }

    return clone;
  }

  private applySetShuffling(sections: any[], set: "B" | "C"): void {
    let globalOrderCounter = 1;
    for (const section of sections) {
      const questions = section.questions;
      if (!Array.isArray(questions)) continue;

      if (set === "C") {
        questions.reverse();
      }

      for (const question of questions) {
        question.order = globalOrderCounter++;

        if (set === "B" && Array.isArray(question.options) && question.options.length > 0) {
          const origCorrectId = String(question.correctAnswer);
          const origCorrectOption = question.options.find((o: any) => o.id === origCorrectId || o.text === origCorrectId);

          question.options = [...question.options].reverse();

          const labels = ["A", "B", "C", "D"];
          question.options.forEach((opt: any, idx: number) => {
            opt.id = labels[idx] ?? opt.id;
          });

          if (origCorrectOption) {
            const newIndex = question.options.findIndex((o: any) => o.text === origCorrectOption.text);
            if (newIndex >= 0) {
              question.correctAnswer = labels[newIndex];
            }
          }
        }
      }
    }
  }
}
