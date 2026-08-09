import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { z } from "zod";
import { parseInput } from "../../common/zod";
import { AuthGuard, InstitutionGuard, RolesGuard } from "../auth/auth.guards";
import { Roles } from "../auth/auth.decorators";
import { managerRoles } from "../auth/permission-map";
import { AcademicService } from "./academic.service";
import {
  boardCreateSchema,
  syllabusVersionCreateSchema,
  standardCreateSchema,
  subjectCreateSchema,
  chapterCreateSchema,
  topicCreateSchema,
} from "@edugen/shared";

const id = z.string().uuid();

@Controller("academic")
@UseGuards(AuthGuard, InstitutionGuard, RolesGuard)
export class AcademicController {
  constructor(private readonly academicService: AcademicService) {}

  @Get("boards")
  boards(): Promise<unknown> {
    return this.academicService.getBoards();
  }

  @Get("boards/:boardId")
  board(@Param("boardId") boardId: string): Promise<unknown> {
    return this.academicService.getBoard(parseInput(id, boardId));
  }

  @Post("boards")
  @Roles(...managerRoles)
  createBoard(@Body() body: unknown): Promise<unknown> {
    return this.academicService.createBoard(parseInput(boardCreateSchema, body));
  }

  @Get("boards/:boardId/syllabus-versions")
  syllabus(@Param("boardId") boardId: string): Promise<unknown> {
    return this.academicService.getSyllabusVersions(parseInput(id, boardId));
  }

  @Post("syllabus-versions")
  @Roles(...managerRoles)
  createSyllabus(@Body() body: unknown): Promise<unknown> {
    return this.academicService.createSyllabusVersion(parseInput(syllabusVersionCreateSchema, body));
  }

  @Get("mediums")
  mediums(): Promise<unknown> {
    return this.academicService.getMediums();
  }

  @Get("standards")
  standards(@Query("syllabusVersionId") syllabusVersionId?: string): Promise<unknown> {
    return this.academicService.getStandards(syllabusVersionId ? parseInput(id, syllabusVersionId) : undefined);
  }

  @Post("standards")
  @Roles(...managerRoles)
  createStandard(@Body() body: unknown): Promise<unknown> {
    return this.academicService.createStandard(parseInput(standardCreateSchema, body));
  }

  @Get("subjects")
  subjects(@Query("standardId") standardId?: string, @Query("mediumId") mediumId?: string): Promise<unknown> {
    return this.academicService.getSubjects(
      standardId ? parseInput(id, standardId) : undefined,
      mediumId ? parseInput(id, mediumId) : undefined
    );
  }

  @Post("subjects")
  @Roles(...managerRoles)
  createSubject(@Body() body: unknown): Promise<unknown> {
    return this.academicService.createSubject(parseInput(subjectCreateSchema, body));
  }

  @Get("chapters")
  chapters(@Query("subjectId") subjectId?: string): Promise<unknown> {
    return this.academicService.getChapters(subjectId ? parseInput(id, subjectId) : undefined);
  }

  @Post("chapters")
  @Roles(...managerRoles)
  createChapter(@Body() body: unknown): Promise<unknown> {
    return this.academicService.createChapter(parseInput(chapterCreateSchema, body));
  }

  @Get("topics")
  topics(@Query("chapterId") chapterId?: string): Promise<unknown> {
    return this.academicService.getTopics(chapterId ? parseInput(id, chapterId) : undefined);
  }

  @Post("topics")
  @Roles(...managerRoles)
  createTopic(@Body() body: unknown): Promise<unknown> {
    return this.academicService.createTopic(parseInput(topicCreateSchema, body));
  }
}
