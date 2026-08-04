import type { MemberRole } from "@prisma/client";
export interface AuthUser { readonly id: string; readonly email: string; readonly firstName: string; readonly lastName: string }
export interface AuthMembership { readonly institutionId: string; readonly institutionName: string; readonly role: MemberRole }
export interface AuthResult { readonly user: AuthUser; readonly memberships: readonly AuthMembership[] }
export interface TokenPayload { readonly sub: string; readonly email: string; readonly type: "access" | "refresh"; readonly jti?: string; readonly familyId?: string }
