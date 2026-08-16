import test from "node:test";
import assert from "node:assert/strict";
import { browserDevelopmentAuthBypassEnabled, developmentAuthBypassEnabled } from "../src/lib/development-auth.ts";

test("development auth bypass is unavailable outside development", () => {
  const original = { ...process.env };
  try {
    Object.assign(process.env, { NODE_ENV: "production", DEV_AUTH_BYPASS: "true", NEXT_PUBLIC_DEV_AUTH_BYPASS: "true" });
    assert.throws(developmentAuthBypassEnabled, /forbidden in production/);
    assert.throws(browserDevelopmentAuthBypassEnabled, /forbidden in production/);
  } finally {
    for (const key of Object.keys(process.env)) if (!(key in original)) delete process.env[key];
    Object.assign(process.env, original);
  }
});
