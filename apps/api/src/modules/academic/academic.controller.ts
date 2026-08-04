import { Body, Controller, Get, HttpStatus, Param, Post, Query, UseGuards } from "@nestjs/common";
import { z } from "zod";
import { PrismaService } from "../../prisma/prisma.service";
import { parseInput } from "../../common/zod";
import { AppError } from "../../common/app-error";
import { AuthGuard, InstitutionGuard, RolesGuard } from "../auth/auth.guards";
import { Roles } from "../auth/auth.decorators";
import { managerRoles } from "../auth/permission-map";

const id = z.string().uuid();
const boardInput = z.object({ code: z.string().min(2).max(30), name: z.string().min(2).max(160), slug: z.string().regex(/^[a-z0-9-]+$/), sortOrder: z.number().int().default(0) }).strict();
const syllabusInput = z.object({ boardId: id, name: z.string().min(2), code: z.string().min(2), academicYear: z.string().min(4), active: z.boolean().default(true) }).strict();
const standardInput = z.object({ syllabusVersionId: id, code: z.string().min(1), name: z.string().min(2), sortOrder: z.number().int() }).strict();
const subjectInput = z.object({ standardId: id, mediumId: id, code: z.string().min(1), name: z.string().min(2), slug: z.string().regex(/^[a-z0-9-]+$/), sortOrder: z.number().int().default(0) }).strict();
const chapterInput = z.object({ subjectId: id, code: z.string().min(1), name: z.string().min(2), slug: z.string().regex(/^[a-z0-9-]+$/), sortOrder: z.number().int() }).strict();
const topicInput = z.object({ chapterId: id, name: z.string().min(2), slug: z.string().regex(/^[a-z0-9-]+$/), sortOrder: z.number().int().default(0) }).strict();

@Controller("academic") @UseGuards(AuthGuard, InstitutionGuard, RolesGuard)
export class AcademicController {
  constructor(private readonly prisma: PrismaService) {}
  @Get("boards") boards(): Promise<unknown> { return this.prisma.board.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }); }
  @Get("boards/:boardId") async board(@Param("boardId") boardId: string): Promise<unknown> { const row = await this.prisma.board.findUnique({ where: { id: parseInput(id, boardId) } }); if (!row) throw new AppError("BOARD_NOT_FOUND", "Board not found.", HttpStatus.NOT_FOUND); return row; }
  @Post("boards") @Roles(...managerRoles) createBoard(@Body() body: unknown): Promise<unknown> { return this.prisma.board.create({ data: parseInput(boardInput, body) }); }
  @Get("boards/:boardId/syllabus-versions") syllabus(@Param("boardId") boardId: string): Promise<unknown> { return this.prisma.syllabusVersion.findMany({ where: { boardId: parseInput(id, boardId) }, orderBy: { academicYear: "desc" } }); }
  @Post("syllabus-versions") @Roles(...managerRoles) createSyllabus(@Body() body: unknown): Promise<unknown> { return this.prisma.syllabusVersion.create({ data: parseInput(syllabusInput, body) }); }
  @Get("mediums") mediums(): Promise<unknown> { return this.prisma.medium.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }); }
  @Get("standards") standards(@Query("syllabusVersionId") syllabusVersionId?: string): Promise<unknown> { return this.prisma.standard.findMany({ where: syllabusVersionId ? { syllabusVersionId: parseInput(id, syllabusVersionId) } : {}, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }); }
  @Post("standards") @Roles(...managerRoles) createStandard(@Body() body: unknown): Promise<unknown> { return this.prisma.standard.create({ data: parseInput(standardInput, body) }); }
  @Get("subjects") subjects(@Query("standardId") standardId?: string, @Query("mediumId") mediumId?: string): Promise<unknown> { return this.prisma.subject.findMany({ where: { ...(standardId ? { standardId: parseInput(id, standardId) } : {}), ...(mediumId ? { mediumId: parseInput(id, mediumId) } : {}) }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }); }
  @Post("subjects") @Roles(...managerRoles) createSubject(@Body() body: unknown): Promise<unknown> { return this.prisma.subject.create({ data: parseInput(subjectInput, body) }); }
  @Get("chapters") chapters(@Query("subjectId") subjectId?: string): Promise<unknown> { return this.prisma.chapter.findMany({ where: subjectId ? { subjectId: parseInput(id, subjectId) } : {}, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }); }
  @Post("chapters") @Roles(...managerRoles) createChapter(@Body() body: unknown): Promise<unknown> { return this.prisma.chapter.create({ data: parseInput(chapterInput, body) }); }
  @Get("topics") topics(@Query("chapterId") chapterId?: string): Promise<unknown> { return this.prisma.topic.findMany({ where: chapterId ? { chapterId: parseInput(id, chapterId) } : {}, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }); }
  @Post("topics") @Roles(...managerRoles) createTopic(@Body() body: unknown): Promise<unknown> { return this.prisma.topic.create({ data: parseInput(topicInput, body) }); }
}
