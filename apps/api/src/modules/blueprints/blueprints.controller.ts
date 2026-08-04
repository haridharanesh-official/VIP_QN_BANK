import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { z } from "zod";
import { blueprintCreateSchema, blueprintUpdateSchema } from "@edugen/shared";
import { parseInput } from "../../common/zod";
import { AuthGuard, InstitutionGuard, RolesGuard } from "../auth/auth.guards";
import { CurrentInstitution, CurrentUser } from "../auth/auth.decorators";
import type { AuthUser } from "../auth/auth.types";
import { BlueprintsService } from "./blueprints.service";
const uuid = z.string().uuid();
@Controller("blueprints") @UseGuards(AuthGuard, InstitutionGuard, RolesGuard)
export class BlueprintsController {
  constructor(private readonly service: BlueprintsService) {}
  @Post() create(@CurrentInstitution() institutionId: string, @CurrentUser() user: AuthUser, @Body() body: unknown, @Req() request: Request): Promise<unknown> { return this.service.create(institutionId, user.id, parseInput(blueprintCreateSchema, body), request.requestId); }
  @Get() list(@CurrentInstitution() institutionId: string): Promise<unknown> { return this.service.list(institutionId); }
  @Get(":id") get(@CurrentInstitution() institutionId: string, @Param("id") id: string): Promise<unknown> { return this.service.get(institutionId, parseInput(uuid, id)); }
  @Patch(":id") update(@CurrentInstitution() institutionId: string, @CurrentUser() user: AuthUser, @Param("id") id: string, @Body() body: unknown, @Req() request: Request): Promise<unknown> { return this.service.update(institutionId, user.id, parseInput(uuid, id), parseInput(blueprintUpdateSchema, body), request.requestId); }
  @Delete(":id") async remove(@CurrentInstitution() institutionId: string, @CurrentUser() user: AuthUser, @Param("id") id: string, @Req() request: Request): Promise<{ success: true }> { await this.service.remove(institutionId, user.id, parseInput(uuid, id), request.requestId); return { success: true }; }
  @Post(":id/validate") validate(@CurrentInstitution() institutionId: string, @Param("id") id: string): Promise<unknown> { return this.service.validate(institutionId, parseInput(uuid, id)); }
  @Post(":id/generate") generate(@CurrentInstitution() institutionId: string, @CurrentUser() user: AuthUser, @Param("id") id: string, @Req() request: Request): Promise<unknown> { return this.service.generate(institutionId, user.id, parseInput(uuid, id), request.requestId); }
}
