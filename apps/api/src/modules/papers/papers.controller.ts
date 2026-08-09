import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { z } from "zod";
import { parseInput } from "../../common/zod";
import { AuthGuard, InstitutionGuard, RolesGuard } from "../auth/auth.guards";
import { CurrentInstitution, CurrentUser } from "../auth/auth.decorators";
import type { AuthUser } from "../auth/auth.types";
import { PapersService } from "./papers.service";

const uuid = z.string().uuid();
const viewSchema = z.enum(["QUESTION_PAPER", "ANSWER_KEY", "QUESTIONS_WITH_ANSWERS"]).default("QUESTIONS_WITH_ANSWERS");
const setSchema = z.enum(["A", "B", "C"]).default("A");

const revisionSchema = z.object({
  paperData: z.record(z.unknown()),
  reason: z.string().optional(),
}).strip();

@Controller("papers")
@UseGuards(AuthGuard, InstitutionGuard, RolesGuard)
export class PapersController {
  constructor(private readonly papersService: PapersService) {}

  @Get()
  async list(
    @CurrentInstitution() institutionId: string,
    @Query("page") rawPage?: string,
    @Query("pageSize") rawPageSize?: string
  ): Promise<unknown> {
    const page = z.coerce.number().int().positive().default(1).parse(rawPage);
    const pageSize = z.coerce.number().int().min(1).max(100).default(20).parse(rawPageSize);
    return this.papersService.list(institutionId, page, pageSize);
  }

  @Get(":id")
  async get(
    @CurrentInstitution() institutionId: string,
    @Param("id") id: string,
    @Query("view") rawView?: string,
    @Query("set") rawSet?: string
  ): Promise<unknown> {
    return this.papersService.getWithProjection(
      institutionId,
      parseInput(uuid, id),
      parseInput(viewSchema, rawView),
      parseInput(setSchema, rawSet)
    );
  }

  @Get(":id/snapshot")
  async snapshot(
    @CurrentInstitution() institutionId: string,
    @Param("id") id: string,
    @Query("view") rawView?: string,
    @Query("set") rawSet?: string
  ): Promise<unknown> {
    return this.papersService.getSnapshot(
      institutionId,
      parseInput(uuid, id),
      parseInput(viewSchema, rawView),
      parseInput(setSchema, rawSet)
    );
  }

  @Post(":id/revision")
  async createRevision(
    @CurrentInstitution() institutionId: string,
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() body: unknown,
    @Req() request: Request
  ): Promise<unknown> {
    const paperId = parseInput(uuid, id);
    const input = parseInput(revisionSchema, body);
    return this.papersService.createRevision(institutionId, user.id, paperId, input, String(request.requestId));
  }

  @Post(":id/archive")
  async archive(
    @CurrentInstitution() institutionId: string,
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Req() request: Request
  ): Promise<unknown> {
    const paperId = parseInput(uuid, id);
    return this.papersService.archive(institutionId, user.id, paperId, String(request.requestId));
  }
}
