import assert from "node:assert/strict";
import {
  handleAdminInquiries,
  handleAdminSession,
  handleInquiry,
} from "../server/inquiries.js";
import { createMemoryStore } from "../server/store.js";

const env = {
  ADMIN_PASSWORD: "correct-horse-battery",
  ADMIN_SESSION_SECRET: "session-secret-that-is-at-least-32",
};
const store = createMemoryStore();

function post(path, body, { origin = "https://useomnia.dev", ip = "203.0.113.8", cookie } = {}) {
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

const saved = await handleInquiry(
  post("/api/inquiries", {
    name: "Lina Haddad",
    email: "lina@example.com",
    interest: "business",
    message: "We want the tools we already pay for to stop duplicating work.",
  }),
  { store },
);
assert.equal(saved.status, 201);
const created = await saved.json();
assert.equal(created.received, true);
assert.ok(created.id);

assert.equal(
  (
    await handleInquiry(
      post("/api/inquiries", {
        name: "Lina",
        email: "not-an-email",
        interest: "business",
        message: "Hello",
      }),
      { store },
    )
  ).status,
  400,
);
assert.equal(
  (
    await handleInquiry(
      post("/api/inquiries", {
        name: "Lina",
        email: "lina@example.com",
        interest: "business",
        message: "Hello",
        website: "https://spam.example",
      }),
      { store },
    )
  ).status,
  400,
);
assert.equal(
  (
    await handleInquiry(
      post("/api/inquiries", {
        name: "Lina",
        email: "lina@example.com",
        interest: "updates",
      }),
      { store },
    )
  ).status,
  201,
);
assert.equal(
  (
    await handleInquiry(
      post("/api/inquiries", {
        name: "Lina",
        email: "lina@example.com",
        interest: "business",
        message: "",
      }),
      { store },
    )
  ).status,
  400,
);
assert.equal(
  (
    await handleInquiry(
      post("/api/inquiries", {
        name: "Lina",
        email: "lina@example.com",
        interest: "business",
        message: "Hello",
      }, { origin: "https://evil.example" }),
      { store },
    )
  ).status,
  403,
);
assert.equal((await handleInquiry(new Request("https://useomnia.dev/api/inquiries"), { store })).status, 405);
assert.equal((await handleInquiry(post("/api/inquiries", { name: "A", email: "a@b.co", interest: "updates" }), {})).status, 503);

for (let i = 0; i < 10; i++) {
  const response = await handleInquiry(
    post(
      "/api/inquiries",
      { name: "Ada", email: "ada@example.com", interest: "updates" },
      { ip: "203.0.113.10" },
    ),
    { store },
  );
  assert.equal(response.status, 201);
}
assert.equal(
  (
    await handleInquiry(
      post(
        "/api/inquiries",
        { name: "Ada", email: "ada@example.com", interest: "updates" },
        { ip: "203.0.113.10" },
      ),
      { store },
    )
  ).status,
  429,
);

const signedOut = await handleAdminInquiries(
  new Request("https://useomnia.dev/api/admin/inquiries"),
  { store, env },
);
assert.equal(signedOut.status, 401);

const login = await handleAdminSession(
  post("/api/admin/session", { password: env.ADMIN_PASSWORD }, { ip: "203.0.113.20" }),
  { store, env },
);
assert.equal(login.status, 200);
const cookie = login.headers.get("set-cookie");
assert.match(cookie, /HttpOnly/);
assert.match(cookie, /omnia_admin=/);

const inbox = await handleAdminInquiries(
  new Request("https://useomnia.dev/api/admin/inquiries", {
    headers: { cookie: cookie.split(";")[0] },
  }),
  { store, env },
);
const page = await inbox.json();
assert.ok(page.inquiries.length >= 2);
assert.equal(page.inquiries[0].email, "ada@example.com");

const reviewed = await handleAdminInquiries(
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

const wrong = await handleAdminSession(
  post("/api/admin/session", { password: "not-the-password" }, { ip: "203.0.113.21" }),
  { store, env },
);
assert.equal(wrong.status, 401);

console.log("Inquiry storage checks passed.");
