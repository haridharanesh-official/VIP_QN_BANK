import { Injectable, HttpStatus } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AppError } from "../../common/app-error";

@Injectable()
export class AcademicService {
  constructor(private readonly prisma: PrismaService) {}

  getBoards(): Promise<unknown> {
    return this.prisma.board.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  }

  async getBoard(boardId: string): Promise<unknown> {
    const row = await this.prisma.board.findUnique({ where: { id: boardId } });
    if (!row) throw new AppError("BOARD_NOT_FOUND", "Board not found.", HttpStatus.NOT_FOUND);
    return row;
  }

  createBoard(data: any): Promise<unknown> {
    return this.prisma.board.create({ data });
  }

  getSyllabusVersions(boardId: string): Promise<unknown> {
    return this.prisma.syllabusVersion.findMany({ where: { boardId }, orderBy: { academicYear: "desc" } });
  }

  createSyllabusVersion(data: any): Promise<unknown> {
    return this.prisma.syllabusVersion.create({ data });
  }

  getMediums(): Promise<unknown> {
    return this.prisma.medium.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  }

  getStandards(syllabusVersionId?: string): Promise<unknown> {
    return this.prisma.standard.findMany({
      where: syllabusVersionId ? { syllabusVersionId } : {},
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
    });
  }

  createStandard(data: any): Promise<unknown> {
    return this.prisma.standard.create({ data });
  }

  getSubjects(standardId?: string, mediumId?: string): Promise<unknown> {
    return this.prisma.subject.findMany({
      where: {
        ...(standardId ? { standardId } : {}),
        ...(mediumId ? { mediumId } : {})
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
    });
  }

  createSubject(data: any): Promise<unknown> {
    return this.prisma.subject.create({ data });
  }

  getChapters(subjectId?: string): Promise<unknown> {
    return this.prisma.chapter.findMany({
      where: subjectId ? { subjectId } : {},
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
    });
  }

  createChapter(data: any): Promise<unknown> {
    return this.prisma.chapter.create({ data });
  }

  getTopics(chapterId?: string): Promise<unknown> {
    return this.prisma.topic.findMany({
      where: chapterId ? { chapterId } : {},
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
    });
  }

  createTopic(data: any): Promise<unknown> {
    return this.prisma.topic.create({ data });
  }
}
