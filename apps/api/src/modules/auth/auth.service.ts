import { HttpStatus, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { createHash, randomUUID } from "node:crypto";
import * as argon2 from "argon2";
import type { Response } from "express";
import type { LoginInput, RegisterInput, SupabaseBootstrapInput } from "@edugen/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { AppError } from "../../common/app-error";
import { durationSeconds, readEnvironment } from "../../config/environment";
import type { AuthResult, TokenPayload } from "./auth.types";
import { SupabaseJwtVerifier, type SupabaseIdentity } from "./supabase-jwt-verifier";

interface SessionTokens { readonly accessToken: string; readonly refreshToken: string; readonly refreshId: string; readonly familyId: string; readonly refreshExpiresAt: Date }
@Injectable()
export class AuthService {
  private readonly attempts = new Map<string, readonly number[]>();
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService, private readonly supabaseVerifier: SupabaseJwtVerifier) {}

  async register(input: RegisterInput, response: Response, requestId?: string, ipAddress?: string): Promise<AuthResult> {
    this.assertLegacyEnabled();
    this.checkRate(`register:${input.email.toLowerCase()}`, 5);
    if (ipAddress) this.checkRate(`auth-ip:${ipAddress}`, 20);
    const email = input.email.trim().toLowerCase();
    const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
    const result = await this.prisma.$transaction(async (transaction) => {
      if (await transaction.user.findUnique({ where: { email } })) throw new AppError("EMAIL_ALREADY_EXISTS", "An account already exists for this email.", HttpStatus.CONFLICT);
      const user = await transaction.user.create({ data: { email, passwordHash, firstName: input.firstName.trim(), lastName: input.lastName.trim() } });
      const baseSlug = this.slugify(input.institutionName);
      const institution = await transaction.institution.create({ data: { name: input.institutionName.trim(), slug: `${baseSlug}-${randomUUID().slice(0, 8)}`, institutionType: input.institutionType, createdByUserId: user.id } });
      await transaction.institutionMember.create({ data: { institutionId: institution.id, userId: user.id, role: "OWNER" } });
      await transaction.auditLog.create({ data: { institutionId: institution.id, actorUserId: user.id, action: "USER_REGISTERED", entityType: "User", entityId: user.id, requestId, afterData: { email, institutionId: institution.id } } });
      const tokens = await this.issueSession(user.id, user.email);
      await transaction.refreshToken.create({ data: { id: tokens.refreshId, userId: user.id, tokenHash: this.hash(tokens.refreshToken), familyId: tokens.familyId, expiresAt: tokens.refreshExpiresAt } });
      return { user, institution, tokens };
    });
    this.setCookies(response, result.tokens);
    return { user: this.publicUser(result.user), memberships: [{ institutionId: result.institution.id, institutionName: result.institution.name, role: "OWNER" }] };
  }

  async login(input: LoginInput, response: Response, requestId?: string, ipAddress?: string): Promise<AuthResult> {
    this.assertLegacyEnabled();
    const email = input.email.trim().toLowerCase();
    this.checkRate(`login:${email}`, 5);
    if (ipAddress) this.checkRate(`auth-ip:${ipAddress}`, 20);
    const user = await this.prisma.user.findUnique({ where: { email } });
    const valid = user && !user.deletedAt && user.status === "ACTIVE" && await argon2.verify(user.passwordHash, input.password);
    if (!valid || !user) {
      await this.prisma.auditLog.create({ data: { action: "LOGIN_FAILED", entityType: "User", entityId: email, requestId, ipAddress, metadata: { reason: "INVALID_CREDENTIALS" } } });
      throw new AppError("INVALID_CREDENTIALS", "Email or password is incorrect.", HttpStatus.UNAUTHORIZED);
    }
    const [tokens, memberships] = await Promise.all([this.issueSession(user.id, user.email), this.memberships(user.id)]);
    await this.prisma.$transaction([
      this.prisma.refreshToken.create({ data: { id: tokens.refreshId, userId: user.id, tokenHash: this.hash(tokens.refreshToken), familyId: tokens.familyId, expiresAt: tokens.refreshExpiresAt } }),
      this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }),
      this.prisma.auditLog.create({ data: { actorUserId: user.id, action: "LOGIN_SUCCEEDED", entityType: "User", entityId: user.id, requestId, ipAddress } }),
    ]);
    this.setCookies(response, tokens);
    return { user: this.publicUser(user), memberships };
  }

  async refresh(rawToken: string | undefined, response: Response): Promise<AuthResult> {
    this.assertLegacyEnabled();
    if (!rawToken) throw new AppError("REFRESH_TOKEN_REQUIRED", "Refresh token is required.", HttpStatus.UNAUTHORIZED);
    let payload: TokenPayload;
    try { payload = await this.jwt.verifyAsync<TokenPayload>(rawToken, { secret: readEnvironment().JWT_REFRESH_SECRET }); }
    catch { throw new AppError("INVALID_REFRESH_TOKEN", "Refresh token is invalid or expired.", HttpStatus.UNAUTHORIZED); }
    if (payload.type !== "refresh" || !payload.jti || !payload.familyId) throw new AppError("INVALID_REFRESH_TOKEN", "Refresh token is invalid.", HttpStatus.UNAUTHORIZED);
    const existing = await this.prisma.refreshToken.findUnique({ where: { id: payload.jti }, include: { user: true } });
    if (!existing || existing.revokedAt || existing.tokenHash !== this.hash(rawToken) || existing.expiresAt <= new Date() || existing.user.status !== "ACTIVE" || existing.user.deletedAt) {
      if (existing) await this.prisma.refreshToken.updateMany({ where: { familyId: existing.familyId, revokedAt: null }, data: { revokedAt: new Date() } });
      throw new AppError("REFRESH_TOKEN_REUSED", "This refresh token is no longer valid.", HttpStatus.UNAUTHORIZED);
    }
    const tokens = await this.issueSession(existing.user.id, existing.user.email, existing.familyId);
    await this.prisma.$transaction([
      this.prisma.refreshToken.update({ where: { id: existing.id }, data: { revokedAt: new Date(), replacedById: tokens.refreshId } }),
      this.prisma.refreshToken.create({ data: { id: tokens.refreshId, userId: existing.user.id, tokenHash: this.hash(tokens.refreshToken), familyId: tokens.familyId, expiresAt: tokens.refreshExpiresAt } }),
    ]);
    this.setCookies(response, tokens);
    return { user: this.publicUser(existing.user), memberships: await this.memberships(existing.user.id) };
  }

  async logout(rawToken: string | undefined, response: Response): Promise<void> {
    if (rawToken) await this.prisma.refreshToken.updateMany({ where: { tokenHash: this.hash(rawToken), revokedAt: null }, data: { revokedAt: new Date() } });
    response.clearCookie("edugen_access", { path: "/" });
    response.clearCookie("edugen_refresh", { path: "/api/v1/auth" });
  }

  async me(userId: string): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("USER_NOT_FOUND", "User not found.", HttpStatus.NOT_FOUND);
    return { user: this.publicUser(user), memberships: await this.memberships(user.id) };
  }

  async bootstrapSupabase(accessToken: string, input: SupabaseBootstrapInput, requestId?: string, ipAddress?: string): Promise<AuthResult> {
    if (readEnvironment().AUTH_PROVIDER !== "supabase") throw new AppError("SUPABASE_AUTH_DISABLED", "Supabase authentication is disabled.", HttpStatus.NOT_FOUND);
    const identity = await this.supabaseVerifier.verify(accessToken);
    return this.bootstrapSupabaseIdentity(identity, input, requestId, ipAddress);
  }

  async bootstrapSupabaseIdentity(identity: SupabaseIdentity, input: SupabaseBootstrapInput, requestId?: string, ipAddress?: string): Promise<AuthResult> {
    const email = identity.email.trim().toLowerCase();
    const unusableLegacyPassword = await argon2.hash(randomUUID(), { type: argon2.argon2id });
    return this.prisma.$transaction(async (transaction) => {
      let user = await transaction.user.findUnique({ where: { authUserId: identity.sub } });
      if (!user) {
        const legacyUser = await transaction.user.findUnique({ where: { email } });
        if (legacyUser?.authUserId && legacyUser.authUserId !== identity.sub) throw new AppError("AUTH_IDENTITY_CONFLICT", "This email is already linked to another authentication identity.", HttpStatus.CONFLICT);
        user = legacyUser
          ? await transaction.user.update({ where: { id: legacyUser.id }, data: { authUserId: identity.sub, emailVerifiedAt: legacyUser.emailVerifiedAt ?? new Date() } })
          : await transaction.user.create({ data: { authUserId: identity.sub, email, passwordHash: unusableLegacyPassword, firstName: input.firstName.trim(), lastName: input.lastName.trim(), emailVerifiedAt: new Date() } });
      }
      if (user.email !== email) throw new AppError("AUTH_IDENTITY_CONFLICT", "The verified authentication email does not match the linked user.", HttpStatus.CONFLICT);
      if (user.deletedAt || user.status !== "ACTIVE") throw new AppError("USER_NOT_ACTIVE", "This user account is not active.", HttpStatus.FORBIDDEN);

      let memberships = await transaction.institutionMember.findMany({ where: { userId: user.id, status: "ACTIVE", deletedAt: null, institution: { status: "ACTIVE", deletedAt: null } }, select: { institutionId: true, role: true, institution: { select: { name: true } } } });
      if (!memberships.length) {
        const slug = `${this.slugify(input.institutionName)}-${identity.sub.replace(/-/g, "").slice(0, 12)}`;
        let institution = await transaction.institution.findUnique({ where: { slug } });
        if (institution && institution.createdByUserId !== user.id) throw new AppError("INSTITUTION_SLUG_CONFLICT", "Unable to create an institution for this account.", HttpStatus.CONFLICT);
        institution ??= await transaction.institution.create({ data: { name: input.institutionName.trim(), slug, institutionType: input.institutionType, createdByUserId: user.id } });
        await transaction.institutionMember.upsert({ where: { institutionId_userId: { institutionId: institution.id, userId: user.id } }, update: { role: "OWNER", status: "ACTIVE", deletedAt: null }, create: { institutionId: institution.id, userId: user.id, role: "OWNER" } });
        await transaction.auditLog.create({ data: { institutionId: institution.id, actorUserId: user.id, action: "SUPABASE_USER_BOOTSTRAPPED", entityType: "User", entityId: user.id, requestId, ipAddress, afterData: { email, authUserId: identity.sub, institutionId: institution.id } } });
        memberships = [{ institutionId: institution.id, role: "OWNER", institution: { name: institution.name } }];
      }
      return { user: this.publicUser(user), memberships: memberships.map((membership) => ({ institutionId: membership.institutionId, institutionName: membership.institution.name, role: membership.role })) };
    });
  }

  private async memberships(userId: string): Promise<AuthResult["memberships"]> {
    const rows = await this.prisma.institutionMember.findMany({ where: { userId, status: "ACTIVE", deletedAt: null, institution: { deletedAt: null, status: "ACTIVE" } }, select: { institutionId: true, role: true, institution: { select: { name: true } } } });
    return rows.map((row) => ({ institutionId: row.institutionId, institutionName: row.institution.name, role: row.role }));
  }
  private publicUser(user: { id: string; email: string; firstName: string; lastName: string }): AuthResult["user"] { return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }; }
  private async issueSession(userId: string, email: string, familyId: string = randomUUID()): Promise<SessionTokens> {
    const environment = readEnvironment();
    const refreshId = randomUUID();
    const accessSeconds = durationSeconds(environment.JWT_ACCESS_EXPIRES_IN);
    const refreshSeconds = durationSeconds(environment.JWT_REFRESH_EXPIRES_IN);
    const accessPayload: TokenPayload = { sub: userId, email, type: "access" };
    const refreshPayload: TokenPayload = { sub: userId, email, type: "refresh", jti: refreshId, familyId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(accessPayload, { secret: environment.JWT_ACCESS_SECRET, expiresIn: accessSeconds }),
      this.jwt.signAsync(refreshPayload, { secret: environment.JWT_REFRESH_SECRET, expiresIn: refreshSeconds }),
    ]);
    return { accessToken, refreshToken, refreshId, familyId, refreshExpiresAt: new Date(Date.now() + refreshSeconds * 1000) };
  }
  private setCookies(response: Response, tokens: SessionTokens): void {
    const environment = readEnvironment();
    const common = { httpOnly: true, secure: environment.COOKIE_SECURE === "true", sameSite: "lax" as const, ...(environment.COOKIE_DOMAIN ? { domain: environment.COOKIE_DOMAIN } : {}) };
    response.cookie("edugen_access", tokens.accessToken, { ...common, path: "/", maxAge: durationSeconds(environment.JWT_ACCESS_EXPIRES_IN) * 1000 });
    response.cookie("edugen_refresh", tokens.refreshToken, { ...common, path: "/api/v1/auth", maxAge: durationSeconds(environment.JWT_REFRESH_EXPIRES_IN) * 1000 });
  }
  private hash(value: string): string { return createHash("sha256").update(value).digest("hex"); }
  private slugify(value: string): string { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "institution"; }
  private checkRate(key: string, limit: number): void {
    const cutoff = Date.now() - 15 * 60_000;
    const recent = (this.attempts.get(key) ?? []).filter((value) => value > cutoff);
    if (recent.length >= limit) throw new AppError("AUTH_RATE_LIMITED", "Too many authentication attempts. Try again later.", HttpStatus.TOO_MANY_REQUESTS);
    this.attempts.set(key, [...recent, Date.now()]);
  }
  private assertLegacyEnabled(): void {
    if (readEnvironment().AUTH_PROVIDER !== "legacy") throw new AppError("LEGACY_AUTH_DISABLED", "Legacy authentication is disabled.", HttpStatus.NOT_FOUND);
  }
}
