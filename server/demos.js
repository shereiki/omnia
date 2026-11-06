import { timingSafeEqual } from "node:crypto";
import { json } from "./http.js";
import { readCookie, signSession, verifySession } from "./session.js";

/*
 * /demos is a client-facing workspace demo, so it is gated behind its own
 * password rather than the admin one. Only a salted hash of that password lives
 * in the repo, and the session is signed with the existing admin secret, so the
 * gate needs no new environment configuration.
 */

export const DEMO_COOKIE = "omnia_demo";
const SALT = "omnia-demo-v1";
// sha256("omnia-demo-v1:omnia-demo-2026")
const PASSWORD_HASH =
  "7ca0dfe82440eea62133cc2493d44c01a1f0ac3c8f5b26e842b550735c6ec0f5";
const TTL_SECONDS = 60 * 60 * 24 * 7;

const attempts = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function secret(env = process.env) {
  return env.DEMO_SESSION_SECRET || env.ADMIN_SESSION_SECRET || "";
}

export function demoConfigured(env = process.env) {
  return secret(env).length >= 32;
}

async function sha256(value) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Buffer.from(digest);
}

export async function demoPasswordMatches(given, env = process.env) {
  if (typeof given !== "string" || given.length === 0 || given.length > 200)
    return false;
  const expected = Buffer.from(env.DEMO_PASSWORD_HASH || PASSWORD_HASH, "hex");
  if (expected.length !== 32) return false;
  const actual = await sha256(`${SALT}:${given}`);
  return timingSafeEqual(expected, actual);
}

export function tooManyAttempts(key) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.start > WINDOW_MS) return false;
  return entry.count >= MAX_ATTEMPTS;
}

export function noteAttempt(key, ok) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (ok) {
    attempts.delete(key);
    return;
  }
  if (!entry || now - entry.start > WINDOW_MS) {
    attempts.set(key, { start: now, count: 1 });
    if (attempts.size > 5000) attempts.clear();
    return;
  }
  entry.count += 1;
}

function isSecure(request) {
  return new URL(request.url).protocol === "https:";
}

export async function demoCookie(request, env = process.env) {
  const token = await signSession(secret(env), TTL_SECONDS);
  return [
    `${DEMO_COOKIE}=${token}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${TTL_SECONDS}`,
    isSecure(request) ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function clearedDemoCookie(secure) {
  return [
    `${DEMO_COOKIE}=`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    "Max-Age=0",
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export async function demoSessionValid(request, env = process.env) {
  if (!demoConfigured(env)) return false;
  return verifySession(secret(env), readCookie(request, DEMO_COOKIE));
}

function pathname(request) {
  const path = new URL(request.url).pathname.replace(/\/+$/, "");
  return path || "/";
}

function redirect(request, path) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: new URL(path, request.url).toString(),
      "Cache-Control": "no-store",
    },
  });
}

const LOGIN_PATHS = new Set(["/demos/login", "/demos/login.html"]);
const PUBLIC_DEMO_ASSETS = new Set([
  "/demos/demo.css",
  "/demos/login.js",
  "/demos/index.js",
  "/demos/clients.js",
]);

export async function guardDemoRequest(request, env = process.env) {
  const path = pathname(request);
  if (path !== "/demos" && !path.startsWith("/demos/")) return null;

  const configured = demoConfigured(env);
  const valid = configured && (await demoSessionValid(request, env));

  if (LOGIN_PATHS.has(path)) return valid ? redirect(request, "/demos") : null;
  if (PUBLIC_DEMO_ASSETS.has(path)) return null;

  if (path === "/demos/logout") {
    return new Response(null, {
      status: 302,
      headers: {
        Location: new URL("/demos/login", request.url).toString(),
        "Set-Cookie": clearedDemoCookie(isSecure(request)),
        "Cache-Control": "no-store",
      },
    });
  }

  if (!configured) {
    return json(
      { error: "The demo is not configured on this deployment." },
      503,
      { "Cache-Control": "no-store" },
    );
  }
  if (valid) return null;
  return redirect(request, `/demos/login?${new URLSearchParams({ next: path })}`);
}
