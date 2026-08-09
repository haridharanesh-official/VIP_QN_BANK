import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { parseInput } from "../../common/zod";
import { AuthGuard, InstitutionGuard, RolesGuard } from "../auth/auth.guards";
import { CurrentInstitution, CurrentUser, Roles } from "../auth/auth.decorators";
import type { AuthUser } from "../auth/auth.types";
import { managerRoles } from "../auth/permission-map";
import { InstitutionsService } from "./institutions.service";
import { memberCreateSchema } from "@edugen/shared";

@Controller("institutions")
@UseGuards(AuthGuard, InstitutionGuard, RolesGuard)
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Get("current")
  current(@CurrentInstitution() institutionId: string): Promise<unknown> {
    return this.institutionsService.getCurrent(institutionId);
  }

  @Get("members")
  members(@CurrentInstitution() institutionId: string): Promise<unknown> {
    return this.institutionsService.getMembers(institutionId);
  }

  @Post("members")
  @Roles(...managerRoles)
  async addMember(
    @CurrentInstitution() institutionId: string,
    @CurrentUser() actor: AuthUser,
    @Body() body: unknown,
    @Req() request: Request
  ): Promise<unknown> {
    const input = parseInput(memberCreateSchema, body);
    return this.institutionsService.addMember(institutionId, input.email, input.role, actor.id, String(request.requestId));
  }

  @Get("dashboard")
  async dashboard(
    @CurrentInstitution() institutionId: string,
    @CurrentUser() user: AuthUser
  ): Promise<unknown> {
    return this.institutionsService.getDashboard(institutionId, user);
  }
}
