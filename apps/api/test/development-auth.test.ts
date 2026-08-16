import test from "node:test";
import assert from "node:assert/strict";
import type { ExecutionContext } from "@nestjs/common";
import { readEnvironment } from "../src/config/environment";
import { AuthGuard, InstitutionGuard } from "../src/modules/auth/auth.guards";

const baseEnvironment = {
  DATABASE_URL: "postgresql://unused", JWT_ACCESS_SECRET: "a".repeat(32), JWT_REFRESH_SECRET: "b".repeat(32),
  DEV_USER_EMAIL: "developer@example.com", DEV_INSTITUTION_SLUG: "development-school",
};

function context(request: Record<string, unknown>): ExecutionContext { return { switchToHttp: () => ({ getRequest: () => request }) } as unknown as ExecutionContext; }

test("development bypass is rejected in production and requires a configured identity", () => {
  assert.throws(() => readEnvironment({ ...baseEnvironment, NODE_ENV: "production", DEV_AUTH_BYPASS: "true" }), /forbidden in production/);
  assert.throws(() => readEnvironment({ ...baseEnvironment, NODE_ENV: "development", DEV_AUTH_BYPASS: "true", DEV_USER_EMAIL: undefined }), /DEV_USER_EMAIL and DEV_INSTITUTION_SLUG/);
});

test("development bypass resolves a database user and real active membership", async () => {
  const prior = { ...process.env };
  Object.assign(process.env, { ...baseEnvironment, NODE_ENV: "development", DEV_AUTH_BYPASS: "true" });
  const request = { headers: {} };
  const member = { institutionId: "institution-a", user: { id: "user-a", email: "developer@example.com", firstName: "Dev", lastName: "Owner" } };
  const prisma = { institutionMember: { findFirst: async () => member } };
  try {
    const auth = new AuthGuard({} as never, {} as never, prisma as never);
    assert.equal(await auth.canActivate(context(request)), true);
    assert.equal((request as { authUser?: { id: string } }).authUser?.id, "user-a");
    assert.equal((request as { developmentInstitutionId?: string }).developmentInstitutionId, "institution-a");
    const institution = new InstitutionGuard({ institutionMember: { findFirst: async ({ where }: { where: { institutionId: string; userId: string } }) => where.institutionId === "institution-a" && where.userId === "user-a" ? { role: "OWNER" } : null } } as never);
    assert.equal(await institution.canActivate(context(request)), true);
    assert.equal((request as { memberRole?: string }).memberRole, "OWNER");
  } finally {
    for (const key of Object.keys(process.env)) if (!(key in prior)) delete process.env[key];
    Object.assign(process.env, prior);
  }
});
