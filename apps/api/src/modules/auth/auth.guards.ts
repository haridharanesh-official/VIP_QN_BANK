import { CanActivate, ExecutionContext, HttpStatus, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import type { MemberRole } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AppError } from "../../common/app-error";
import { readEnvironment } from "../../config/environment";
import { ROLES_KEY } from "./auth.decorators";
import type { TokenPayload } from "./auth.types";
import { SupabaseJwtVerifier } from "./supabase-jwt-verifier";

@Injectable()
export class LegacyAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService, private readonly prisma: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const bearer = request.headers.authorization?.startsWith("Bearer ") ? request.headers.authorization.slice(7) : undefined;
    const token = bearer ?? request.cookies?.edugen_access;
    if (typeof token !== "string") throw new AppError("UNAUTHENTICATED", "Authentication is required.", HttpStatus.UNAUTHORIZED);
    try {
      const payload = await this.jwt.verifyAsync<TokenPayload>(token, { secret: readEnvironment().JWT_ACCESS_SECRET });
      if (payload.type !== "access") throw new Error("Wrong token type");
      const user = await this.prisma.user.findFirst({ where: { id: payload.sub, status: "ACTIVE", deletedAt: null }, select: { id: true, email: true, firstName: true, lastName: true } });
      if (!user) throw new Error("User not active");
      request.authUser = user;
      return true;
    } catch { throw new AppError("INVALID_ACCESS_TOKEN", "The access token is invalid or expired.", HttpStatus.UNAUTHORIZED); }
  }
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly verifier: SupabaseJwtVerifier, private readonly prisma: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const bearer = request.headers.authorization?.startsWith("Bearer ") ? request.headers.authorization.slice(7) : undefined;
    if (!bearer) throw new AppError("UNAUTHENTICATED", "Authentication is required.", HttpStatus.UNAUTHORIZED);
    const identity = await this.verifier.verify(bearer);
    const user = await this.prisma.user.findFirst({ where: { authUserId: identity.sub, email: identity.email, status: "ACTIVE", deletedAt: null }, select: { id: true, email: true, firstName: true, lastName: true } });
    if (!user) throw new AppError("USER_NOT_LINKED", "This Supabase account is not linked to an application user.", HttpStatus.UNAUTHORIZED);
    request.authUser = user;
    return true;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly legacy: LegacyAuthGuard, private readonly supabase: SupabaseAuthGuard) {}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    return readEnvironment().AUTH_PROVIDER === "supabase" ? this.supabase.canActivate(context) : this.legacy.canActivate(context);
  }
}

@Injectable()
export class InstitutionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const institutionId = request.headers["x-institution-id"];
    if (typeof institutionId !== "string" || !request.authUser) throw new AppError("INSTITUTION_REQUIRED", "X-Institution-Id is required.", HttpStatus.BAD_REQUEST);
    const membership = await this.prisma.institutionMember.findFirst({ where: { institutionId, userId: request.authUser.id, status: "ACTIVE", deletedAt: null, institution: { status: "ACTIVE", deletedAt: null } }, select: { role: true } });
    if (!membership) throw new AppError("TENANT_ACCESS_DENIED", "You are not an active member of this institution.", HttpStatus.FORBIDDEN);
    request.institutionId = institutionId;
    request.memberRole = membership.role;
    return true;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<readonly MemberRole[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!required?.length) return true;
    const role = context.switchToHttp().getRequest<Request>().memberRole as MemberRole | undefined;
    if (!role || !required.includes(role)) throw new AppError("ROLE_FORBIDDEN", "Your institution role does not permit this action.", HttpStatus.FORBIDDEN);
    return true;
  }
}
