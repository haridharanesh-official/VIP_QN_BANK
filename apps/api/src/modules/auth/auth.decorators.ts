import { createParamDecorator, SetMetadata, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import type { MemberRole } from "@prisma/client";
import type { AuthUser } from "./auth.types";
export const ROLES_KEY = "roles";
export const Roles = (...roles: readonly MemberRole[]): MethodDecorator & ClassDecorator => SetMetadata(ROLES_KEY, roles);
export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): AuthUser => context.switchToHttp().getRequest<Request>().authUser as AuthUser);
export const CurrentInstitution = createParamDecorator((_data: unknown, context: ExecutionContext): string => context.switchToHttp().getRequest<Request>().institutionId as string);
