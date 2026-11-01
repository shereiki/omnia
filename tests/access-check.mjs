import assert from "node:assert/strict";
import {
  guardAdminRequest,
  passwordMatches,
  signSession,
  verifySession,
} from "../server/session.js";

const env = {
  ADMIN_PASSWORD: "correct-horse-battery",
  ADMIN_SESSION_SECRET: "session-secret-that-is-at-least-32",
};
const request = (path, token) =>
  new Request(`https://useomnia.dev${path}`, {
    headers: token ? { cookie: `omnia_admin=${token}` } : {},
  });

assert.equal(await passwordMatches(env.ADMIN_PASSWORD, env.ADMIN_PASSWORD), true);
assert.equal(await passwordMatches(env.ADMIN_PASSWORD, "wrong-password-here"), false);
assert.equal(await passwordMatches(env.ADMIN_PASSWORD, ""), false);

const valid = await signSession(env.ADMIN_SESSION_SECRET);
assert.equal(await verifySession(env.ADMIN_SESSION_SECRET, valid), true);
assert.equal(await verifySession(env.ADMIN_SESSION_SECRET, valid.slice(0, -4) + "aaaa"), false);
assert.equal(
  await verifySession(
    env.ADMIN_SESSION_SECRET,
    await signSession(env.ADMIN_SESSION_SECRET, -30),
  ),
  false,
);
assert.equal(await verifySession("other-secret-that-is-at-least-32", valid), false);

assert.equal((await guardAdminRequest(request("/api/admin/inquiries"), {})).status, 503);
assert.equal((await guardAdminRequest(request("/admin"), {})).status, 302);
assert.equal(await guardAdminRequest(request("/admin/login"), {}), null);
assert.equal((await guardAdminRequest(request("/api/admin/inquiries"), env)).status, 401);
assert.equal(await guardAdminRequest(request("/api/admin/inquiries", valid), env), null);
assert.equal((await guardAdminRequest(request("/admin", valid), env)), null);
assert.equal((await guardAdminRequest(request("/admin/login", valid), env)).status, 302);
assert.equal(await guardAdminRequest(request("/"), env), null);
assert.equal(await guardAdminRequest(request("/admin/login.js"), {}), null);
assert.equal(await guardAdminRequest(request("/admin/admin.css"), {}), null);
assert.equal((await guardAdminRequest(request("/admin/index.html"), {})).status, 302);

console.log("Admin session checks passed.");
