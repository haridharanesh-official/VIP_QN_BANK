import test from "node:test";
import assert from "node:assert/strict";
const modulePath = "../src/lib/auth-route-policy.ts";
const { authRedirect, clearBrowserSession } = await import(modulePath);

test("unauthenticated dashboard traffic redirects to login", () => {
  assert.equal(authRedirect("/dashboard", false), "/login");
  assert.equal(authRedirect("/questions/new", false), "/login");
  assert.equal(authRedirect("/login", false), null);
});

test("logout clears the Supabase session before active institution state", async () => {
  const actions: string[] = [];
  await clearBrowserSession(async () => { actions.push("signOut"); }, { removeItem: (key: string) => actions.push(`remove:${key}`) });
  assert.deepEqual(actions, ["signOut", "remove:edugen_institution_id"]);
});
