import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { makeToken, verifyToken, checkCreds, COOKIE } from "../lib/auth.js";

test("checkCreds matches env credentials", () => {
  assert.equal(checkCreds("admin", "jhanarich2025"), true);
  assert.equal(checkCreds("admin", "wrong"), false);
  assert.equal(checkCreds("", ""), false);
});

test("token roundtrip verifies", () => {
  assert.equal(verifyToken(makeToken()), true);
});

test("tampered signature fails", () => {
  const parts = makeToken().split(".");
  assert.equal(verifyToken(parts[0] + "." + "AAAAinvalid"), false);
});

test("expired token fails", () => {
  const SECRET = process.env.ADMIN_SECRET || "jhanarich-dev-secret-change-me";
  const payload = `admin.${Date.now() - 1000}`;
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
  assert.equal(verifyToken(`${payload}.${sig}`), false);
});

test("token from a different secret fails", () => {
  const payload = `admin.${Date.now() + 86400000}`;
  const sig = crypto.createHmac("sha256", "some-other-secret").update(payload).digest("base64url");
  assert.equal(verifyToken(`${payload}.${sig}`), false);
});

test("cookie name is stable", () => {
  assert.equal(COOKIE, "jh_admin");
});
