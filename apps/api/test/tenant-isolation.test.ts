import test from "node:test";
import assert from "node:assert/strict";
import { tenantRecordAccessible } from "../src/modules/auth/tenant-policy";

test("tenant policy denies questions, blueprints, papers and audit records from another institution", () => {
  const institutionA = "11111111-1111-4111-8111-111111111111";
  const institutionB = "22222222-2222-4222-8222-222222222222";
  for (const entity of ["question", "blueprint", "paper", "audit log"]) {
    assert.equal(tenantRecordAccessible(institutionA, institutionB), false, `${entity} must be isolated`);
    assert.equal(tenantRecordAccessible(institutionA, institutionA), true, `${entity} from the current tenant is accessible`);
  }
});

test("a null institution is never treated as tenant-owned content", () => { assert.equal(tenantRecordAccessible("11111111-1111-4111-8111-111111111111", null), false); });
