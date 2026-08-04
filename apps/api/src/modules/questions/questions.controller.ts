import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { MemberRole } from "@prisma/client";
import { z } from "zod";
import { difficulties, ownershipScopes, questionCreateSchema, questionTypes, questionUpdateSchema, reviewSchema, reviewStatuses } from "@edugen/shared";
import { parseInput } from "../../common/zod";
import { AuthGuard, InstitutionGuard, RolesGuard } from "../auth/auth.guards";
import { CurrentInstitution, CurrentUser } from "../auth/auth.decorators";
import type { AuthUser } from "../auth/auth.types";
import { QuestionsService } from "./questions.service";

const uuid = z.string().uuid();
const listSchema = z.object({ page: z.coerce.number().int().positive().default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20), search: z.string().max(200).optional(), subjectId: uuid.optional(), chapterId: uuid.optional(), topicId: uuid.optional(), questionType: z.enum(questionTypes).optional(), marks: z.coerce.number().int().positive().optional(), difficulty: z.enum(difficulties).optional(), reviewStatus: z.enum(reviewStatuses).optional(), ownershipScope: z.enum(ownershipScopes).optional(), createdByUserId: uuid.optional(), isBookBack: z.coerce.boolean().optional(), isCreative: z.coerce.boolean().optional(), isPreviousYear: z.coerce.boolean().optional() }).strip();
@Controller("questions") @UseGuards(AuthGuard, InstitutionGuard, RolesGuard)
export class QuestionsController {
  constructor(private readonly service: QuestionsService) {}
  @Post() create(@CurrentInstitution() institutionId: string, @CurrentUser() user: AuthUser, @Body() body: unknown, @Req() request: Request): Promise<unknown> { return this.service.create(institutionId, user.id, parseInput(questionCreateSchema, body), request.requestId); }
  @Get() list(@CurrentInstitution() institutionId: string, @CurrentUser() user: AuthUser, @Query() query: unknown, @Req() request: Request): Promise<unknown> { return this.service.list(institutionId, user.id, request.memberRole as MemberRole, parseInput(listSchema, query)); }
  @Get(":id") get(@CurrentInstitution() institutionId: string, @CurrentUser() user: AuthUser, @Param("id") id: string, @Req() request: Request): Promise<unknown> { return this.service.get(institutionId, user.id, request.memberRole as MemberRole, parseInput(uuid, id)); }
  @Patch(":id") update(@CurrentInstitution() institutionId: string, @CurrentUser() user: AuthUser, @Param("id") id: string, @Body() body: unknown, @Req() request: Request): Promise<unknown> { return this.service.update(institutionId, user.id, request.memberRole as MemberRole, parseInput(uuid, id), parseInput(questionUpdateSchema, body), request.requestId); }
  @Delete(":id") async remove(@CurrentInstitution() institutionId: string, @CurrentUser() user: AuthUser, @Param("id") id: string, @Req() request: Request): Promise<{ success: true }> { await this.service.remove(institutionId, user.id, request.memberRole as MemberRole, parseInput(uuid, id), request.requestId); return { success: true }; }
  @Post(":id/submit-review") submit(@CurrentInstitution() institutionId: string, @CurrentUser() user: AuthUser, @Param("id") id: string, @Req() request: Request): Promise<unknown> { return this.service.submit(institutionId, user.id, request.memberRole as MemberRole, parseInput(uuid, id), request.requestId); }
  @Post(":id/review") review(@CurrentInstitution() institutionId: string, @CurrentUser() user: AuthUser, @Param("id") id: string, @Body() body: unknown, @Req() request: Request): Promise<unknown> { return this.service.review(institutionId, user.id, request.memberRole as MemberRole, parseInput(uuid, id), parseInput(reviewSchema, body), request.requestId); }
  @Get(":id/versions") versions(@CurrentInstitution() institutionId: string, @CurrentUser() user: AuthUser, @Param("id") id: string, @Req() request: Request): Promise<unknown> { return this.service.versions(institutionId, user.id, request.memberRole as MemberRole, parseInput(uuid, id)); }
  @Get(":id/reviews") reviews(@CurrentInstitution() institutionId: string, @CurrentUser() user: AuthUser, @Param("id") id: string, @Req() request: Request): Promise<unknown> { return this.service.reviews(institutionId, user.id, request.memberRole as MemberRole, parseInput(uuid, id)); }
}
