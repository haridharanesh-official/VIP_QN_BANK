import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import type { ExecutionContext } from "@nestjs/common";
import { AuthService } from "../src/modules/auth/auth.service";
import { SupabaseAuthGuard } from "../src/modules/auth/auth.guards";
import { SupabaseJwtVerifier, type SupabaseIdentity } from "../src/modules/auth/supabase-jwt-verifier";

const projectUrl = "https://uslbsxgustdhzfxbpout.supabase.co";
Object.assign(process.env, { DATABASE_URL: "postgresql://unused", JWT_ACCESS_SECRET: "a".repeat(32), JWT_REFRESH_SECRET: "b".repeat(32), AUTH_PROVIDER: "supabase", NEXT_PUBLIC_SUPABASE_URL: projectUrl });

function encoded(value: unknown): string { return Buffer.from(JSON.stringify(value)).toString("base64url"); }
function executionContext(request: Record<string, unknown>): ExecutionContext { return { switchToHttp: () => ({ getRequest: () => request }) } as unknown as ExecutionContext; }

test("Supabase verifier accepts a valid ES256 access token and rejects a forged signature", async () => {
  const { publicKey, privateKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
  const jwk = publicKey.export({ format: "jwk" });
  const kid = "test-signing-key";
  const originalFetch = global.fetch;
  global.fetch = async () => new Response(JSON.stringify({ keys: [{ ...jwk, kid, alg: "ES256", use: "sig" }] }), { status: 200 });
  try {
    const header = encoded({ alg: "ES256", kid, typ: "JWT" });
    const payload = encoded({ iss: `${projectUrl}/auth/v1`, aud: "authenticated", sub: "11111111-1111-4111-8111-111111111111", email: "Teacher@Example.com", exp: Math.floor(Date.now() / 1000) + 300 });
    const input = `${header}.${payload}`;
    const signature = sign("SHA256", Buffer.from(input), { key: privateKey, dsaEncoding: "ieee-p1363" });
    const token = `${input}.${signature.toString("base64url")}`;
    assert.deepEqual(await new SupabaseJwtVerifier().verify(token), { sub: "11111111-1111-4111-8111-111111111111", email: "teacher@example.com" });
    signature[0] ^= 1;
    await assert.rejects(() => new SupabaseJwtVerifier().verify(`${input}.${signature.toString("base64url")}`), (error: { code?: string }) => error.code === "INVALID_ACCESS_TOKEN");
  } finally { global.fetch = originalFetch; }
});

test("Supabase auth guard resolves a verified identity only through auth_user_id", async () => {
  const request = { headers: { authorization: "Bearer verified-token" } };
  const verifier = { verify: async (): Promise<SupabaseIdentity> => ({ sub: "11111111-1111-4111-8111-111111111111", email: "owner@example.com" }) };
  const prisma = { user: { findFirst: async ({ where }: { where: Record<string, unknown> }) => where.authUserId === "11111111-1111-4111-8111-111111111111" ? { id: "app-user", email: "owner@example.com", firstName: "VIP", lastName: "Owner" } : null } };
  const guard = new SupabaseAuthGuard(verifier as unknown as SupabaseJwtVerifier, prisma as never);
  assert.equal(await guard.canActivate(executionContext(request)), true);
  assert.equal((request as { authUser?: { id: string } }).authUser?.id, "app-user");
});

test("Supabase auth guard rejects a missing Bearer token with 401", async () => {
  const guard = new SupabaseAuthGuard({} as SupabaseJwtVerifier, {} as never);
  await assert.rejects(() => guard.canActivate(executionContext({ headers: {} })), (error: { code?: string; getStatus?: () => number }) => error.code === "UNAUTHENTICATED" && error.getStatus?.() === 401);
});

function fakeDatabase(legacy = false) {
  const state = {
    users: legacy ? [{ id: "legacy-user", authUserId: null as string | null, email: "legacy@example.com", passwordHash: "legacy-hash", firstName: "Legacy", lastName: "Owner", status: "ACTIVE", deletedAt: null, emailVerifiedAt: null }] : [] as Record<string, unknown>[],
    institutions: [] as Record<string, unknown>[], members: [] as Record<string, unknown>[], audits: [] as Record<string, unknown>[],
  };
  const transaction = {
    user: {
      findUnique: async ({ where }: { where: { authUserId?: string; email?: string } }) => state.users.find((user) => where.authUserId ? user.authUserId === where.authUserId : user.email === where.email) ?? null,
      update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => Object.assign(state.users.find((user) => user.id === where.id)!, data),
      create: async ({ data }: { data: Record<string, unknown> }) => { const user = { id: "new-user", status: "ACTIVE", deletedAt: null, ...data }; state.users.push(user); return user; },
    },
    institutionMember: {
      findMany: async ({ where }: { where: { userId: string } }) => state.members.filter((member) => member.userId === where.userId).map((member) => ({ institutionId: member.institutionId, role: member.role, institution: { name: state.institutions.find((institution) => institution.id === member.institutionId)!.name } })),
      upsert: async ({ create }: { create: Record<string, unknown> }) => { if (!state.members.some((member) => member.institutionId === create.institutionId && member.userId === create.userId)) state.members.push(create); },
    },
    institution: {
      findUnique: async ({ where }: { where: { slug: string } }) => state.institutions.find((institution) => institution.slug === where.slug) ?? null,
      create: async ({ data }: { data: Record<string, unknown> }) => { const institution = { id: "new-institution", status: "ACTIVE", deletedAt: null, ...data }; state.institutions.push(institution); return institution; },
    },
    auditLog: { create: async ({ data }: { data: Record<string, unknown> }) => { state.audits.push(data); } },
  };
  return { state, prisma: { $transaction: async (callback: (tx: typeof transaction) => unknown) => callback(transaction) } };
}

const profile = { firstName: "New", lastName: "Owner", institutionName: "New Academy", institutionType: "SCHOOL" as const };
test("bootstrap links a matching legacy email without creating a duplicate user", async () => {
  const { state, prisma } = fakeDatabase(true);
  const service = new AuthService(prisma as never, {} as never, {} as never);
  const result = await service.bootstrapSupabaseIdentity({ sub: "22222222-2222-4222-8222-222222222222", email: "legacy@example.com" }, profile);
  assert.equal(state.users.length, 1); assert.equal(state.users[0].authUserId, "22222222-2222-4222-8222-222222222222"); assert.equal(result.memberships[0].role, "OWNER");
});

test("first bootstrap creates one user, institution and OWNER membership; retry is idempotent", async () => {
  const { state, prisma } = fakeDatabase();
  const service = new AuthService(prisma as never, {} as never, {} as never);
  const identity = { sub: "33333333-3333-4333-8333-333333333333", email: "new@example.com" };
  await service.bootstrapSupabaseIdentity(identity, profile);
  await service.bootstrapSupabaseIdentity(identity, profile);
  assert.deepEqual({ users: state.users.length, institutions: state.institutions.length, memberships: state.members.length, role: state.members[0].role }, { users: 1, institutions: 1, memberships: 1, role: "OWNER" });
});
