import assert from "node:assert/strict";
import {
  handleAdminSession,
  handleAdminSignups,
  handleEarlyAccess,
  handleEarlyAccessDetails,
} from "../server/early-access.js";
import { createMemoryStore } from "../server/store.js";

const env = {
  ADMIN_PASSWORD: "correct-horse-battery",
  ADMIN_SESSION_SECRET: "session-secret-that-is-at-least-32",
};
const store = createMemoryStore();

function post(
  path,
  body,
  { origin = "https://useomnia.dev", ip = "203.0.113.8", cookie } = {},
) {
  const headers = {
    "Content-Type": "application/json",
    Origin: origin,
    "x-real-ip": ip,
  };
  if (cookie) headers.cookie = cookie;
  return new Request(`https://useomnia.dev${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

const saved = await handleEarlyAccess(
  post("/api/early-access", { email: "Lina@Example.com" }),
  { store },
);
assert.equal(saved.status, 201);
const created = await saved.json();
assert.equal(created.received, true);
assert.ok(created.id);
assert.ok(created.token);
assert.equal((await store.listSignups(0)).length, 1);

const duplicate = await handleEarlyAccess(
  post("/api/early-access", { email: "lina@example.com" }),
  { store },
);
assert.equal(duplicate.status, 200);
const duplicateBody = await duplicate.json();
assert.equal(duplicateBody.received, true);
assert.equal(duplicateBody.id, created.id);
assert.equal((await store.listSignups(0)).length, 1);

assert.equal(
  (
    await handleEarlyAccess(
      post("/api/early-access", { email: "not-an-email" }),
      { store },
    )
  ).status,
  400,
);

const honeypot = await handleEarlyAccess(
  post("/api/early-access", {
    email: "bot@example.com",
    website: "https://spam.example",
  }),
  { store },
);
assert.equal(honeypot.status, 201);
assert.equal((await honeypot.json()).received, true);
assert.equal((await store.listSignups(0)).length, 1);

assert.equal(
  (
    await handleEarlyAccess(
      post(
        "/api/early-access",
        { email: "lina@example.com" },
        { origin: "https://evil.example" },
      ),
      { store },
    )
  ).status,
  403,
);

assert.equal(
  (
    await handleEarlyAccess(
      new Request("https://useomnia.dev/api/early-access"),
      { store },
    )
  ).status,
  405,
);
assert.equal(
  (
    await handleEarlyAccess(
      post("/api/early-access", { email: "a@b.co" }),
      {},
    )
  ).status,
  503,
);

for (let i = 0; i < 10; i++) {
  const response = await handleEarlyAccess(
    post(
      "/api/early-access",
      { email: `rate${i}@example.com` },
      { ip: "203.0.113.10" },
    ),
    { store },
  );
  assert.equal(response.status, 201);
}
assert.equal(
  (
    await handleEarlyAccess(
      post(
        "/api/early-access",
        { email: "rate-limit@example.com" },
        { ip: "203.0.113.10" },
      ),
      { store },
    )
  ).status,
  429,
);

const details = await handleEarlyAccessDetails(
  post("/api/early-access/details", {
    id: created.id,
    token: duplicateBody.token,
    company: "Lina Co",
    role: "Operations",
    message: "Stop paying for the same tool twice.",
  }),
  { store },
);
assert.equal(details.status, 200);
assert.equal((await details.json()).saved, true);
const updated = (await store.listSignups(0)).find(
  (row) => row.id === created.id,
);
assert.equal(updated.company, "Lina Co");
assert.equal(updated.role, "Operations");
assert.equal(updated.message, "Stop paying for the same tool twice.");

assert.equal(
  (
    await handleEarlyAccessDetails(
      post("/api/early-access/details", {
        id: created.id,
        token: "wrong-token",
        company: "Lina Co",
      }),
      { store },
    )
  ).status,
  404,
);
assert.equal(
  (
    await handleEarlyAccessDetails(
      post("/api/early-access/details", {
        id: created.id,
        token: duplicateBody.token,
        company: "",
        role: "",
        message: "",
      }),
      { store },
    )
  ).status,
  400,
);
assert.equal(
  (
    await handleEarlyAccessDetails(
      post(
        "/api/early-access/details",
        { id: created.id, token: duplicateBody.token, company: "Lina Co" },
        { origin: "https://evil.example" },
      ),
      { store },
    )
  ).status,
  403,
);

const signedOut = await handleAdminSignups(
  new Request("https://useomnia.dev/api/admin/inquiries"),
  { store, env },
);
assert.equal(signedOut.status, 401);

const login = await handleAdminSession(
  post(
    "/api/admin/session",
    { password: env.ADMIN_PASSWORD },
    { ip: "203.0.113.20" },
  ),
  { store, env },
);
assert.equal(login.status, 200);
const cookie = login.headers.get("set-cookie");
assert.match(cookie, /HttpOnly/);
assert.match(cookie, /omnia_admin=/);

const inbox = await handleAdminSignups(
  new Request("https://useomnia.dev/api/admin/inquiries", {
    headers: { cookie: cookie.split(";")[0] },
  }),
  { store, env },
);
const page = await inbox.json();
assert.ok(Array.isArray(page.signups));
assert.ok(page.signups.length >= 2);
assert.ok(page.signups.some((row) => row.id === created.id));

const reviewed = await handleAdminSignups(
  new Request("https://useomnia.dev/api/admin/inquiries", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://useomnia.dev",
      cookie: cookie.split(";")[0],
    },
    body: JSON.stringify({ id: created.id, status: "reviewed" }),
  }),
  { store, env },
);
assert.equal(reviewed.status, 200);
assert.equal(
  (await store.listSignups(0)).find((row) => row.id === created.id).status,
  "reviewed",
);

const wrong = await handleAdminSession(
  post(
    "/api/admin/session",
    { password: "not-the-password" },
    { ip: "203.0.113.21" },
  ),
  { store, env },
);
assert.equal(wrong.status, 401);

console.log("Early access checks passed.");
