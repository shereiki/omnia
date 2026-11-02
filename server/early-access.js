import { createHash, randomBytes } from "node:crypto";
import { clientIp, json, readJson, sameOrigin } from "./http.js";
import {
  adminConfigured,
  clearedCookie,
  isSecureRequest,
  passwordMatches,
  requireAdmin,
  sessionCookie,
  signSession,
} from "./session.js";
import { getStore } from "./store.js";

const memoryLimits = new Map();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function limitKey(prefix, ip, hour) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${prefix}:${hour}:${ip}`),
  );
  return [...new Uint8Array(digest)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

async function bump(store, key, hour) {
  if (store) return store.bumpLimit(key, hour);
  const current = memoryLimits.get(key);
  const count = (current?.window_start === hour ? current.count : 0) + 1;
  memoryLimits.set(key, { window_start: hour, count });
  return count;
}

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function newToken() {
  return randomBytes(24).toString("base64url");
}

function text(value, max) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed.length <= max ? trimmed : "";
}

export async function handleEarlyAccess(request, { store = getStore() } = {}) {
  if (request.method !== "POST")
    return json({ error: "Method not allowed." }, 405);
  if (!sameOrigin(request)) return json({ error: "Request not allowed." }, 403);
  let input;
  try {
    input = await readJson(request, 8192);
  } catch {
    return json({ error: "Please check your email and try again." }, 400);
  }
  if (input?.website) return json({ received: true }, 201);
  const email = text(input?.email, 254);
  if (!email || !emailPattern.test(email))
    return json({ error: "Please check your email and try again." }, 400);
  if (!store)
    return json(
      {
        error:
          "Sign-ups are not open yet. Nothing has been sent. Please check back soon.",
      },
      503,
    );
  try {
    const ip = clientIp(request);
    if (ip) {
      const hour = Math.floor(Date.now() / 3600000);
      const key = await limitKey("early-access", ip, hour);
      const count = await bump(store, key, hour);
      if (count > 10)
        return json(
          {
            error:
              "Too many requests from this connection. Please try again later.",
          },
          429,
        );
    }
    const token = newToken();
    const result = await store.insertSignup({
      id: crypto.randomUUID(),
      email,
      emailNormalized: email.toLowerCase(),
      tokenHash: hashToken(token),
    });
    return json(
      { received: true, id: result.id, token },
      result.inserted ? 201 : 200,
    );
  } catch {
    console.error("Early access storage unavailable.");
    return json(
      { error: "Your email could not be saved. Please try again later." },
      503,
    );
  }
}

export async function handleEarlyAccessDetails(
  request,
  { store = getStore() } = {},
) {
  if (request.method !== "POST")
    return json({ error: "Method not allowed." }, 405);
  if (!sameOrigin(request)) return json({ error: "Request not allowed." }, 403);
  let input;
  try {
    input = await readJson(request, 8192);
  } catch {
    return json({ error: "Please check your details and try again." }, 400);
  }
  const id = text(input?.id, 64);
  const token = text(input?.token, 200);
  const company = text(input?.company, 160);
  const role = text(input?.role, 120);
  const message = text(input?.message, 2000);
  const invalid =
    !id ||
    !token ||
    (typeof input?.company === "string" && input.company.trim().length > 160) ||
    (typeof input?.role === "string" && input.role.trim().length > 120) ||
    (typeof input?.message === "string" && input.message.trim().length > 2000) ||
    (!company && !role && !message);
  if (invalid)
    return json({ error: "Please check your details and try again." }, 400);
  if (!store)
    return json(
      { error: "Sign-ups are not open yet. Please try again later." },
      503,
    );
  try {
    const ip = clientIp(request);
    if (ip) {
      const hour = Math.floor(Date.now() / 3600000);
      const key = await limitKey("early-access-details", ip, hour);
      const count = await bump(store, key, hour);
      if (count > 10)
        return json(
          {
            error:
              "Too many requests from this connection. Please try again later.",
          },
          429,
        );
    }
    const changes = await store.updateSignupDetails(id, hashToken(token), {
      company,
      role,
      message,
    });
    if (!changes)
      return json({ error: "That link is no longer valid." }, 404);
    return json({ saved: true }, 200);
  } catch {
    console.error("Early access details unavailable.");
    return json(
      { error: "Your details could not be saved. Please try again later." },
      503,
    );
  }
}

export async function handleAdminSignups(
  request,
  { store = getStore(), env = process.env } = {},
) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;
  if (!store)
    return json({ error: "The early access database is not connected." }, 503);
  try {
    if (request.method === "GET") {
      const rawPage = Number(new URL(request.url).searchParams.get("page") || 0);
      if (!Number.isInteger(rawPage) || rawPage < 0 || rawPage > 10000)
        return json({ error: "Invalid page." }, 400);
      const results = await store.listSignups(rawPage * 50);
      return json({
        signups: results.slice(0, 50),
        hasMore: results.length > 50,
      });
    }
    if (request.method === "PATCH") {
      if (!sameOrigin(request))
        return json({ error: "Request not allowed." }, 403);
      let input;
      try {
        input = await readJson(request, 1000);
      } catch {
        return json({ error: "Invalid update." }, 400);
      }
      if (
        typeof input?.id !== "string" ||
        input.id.length > 50 ||
        !["new", "reviewed"].includes(input?.status)
      )
        return json({ error: "Invalid update." }, 400);
      const changes = await store.updateSignupStatus(input.id, input.status);
      if (!changes) return json({ error: "Sign-up not found." }, 404);
      return json({ updated: true });
    }
    return json({ error: "Method not allowed." }, 405);
  } catch {
    return json(
      { error: "The inbox could not be loaded. Please try again." },
      503,
    );
  }
}

export async function handleAdminSession(
  request,
  { store = getStore(), env = process.env } = {},
) {
  const secure = isSecureRequest(request);
  if (request.method === "DELETE") {
    if (!sameOrigin(request)) return json({ error: "Request not allowed." }, 403);
    return json({ signedOut: true }, 200, {
      "Set-Cookie": clearedCookie(secure),
    });
  }
  if (request.method !== "POST")
    return json({ error: "Method not allowed." }, 405);
  if (!sameOrigin(request)) return json({ error: "Request not allowed." }, 403);
  if (!adminConfigured(env))
    return json({ error: "Admin access is not configured." }, 503);
  let input;
  try {
    input = await readJson(request, 1000);
  } catch {
    return json({ error: "That password is not correct." }, 401);
  }
  const password = typeof input?.password === "string" ? input.password : "";
  if (!(await passwordMatches(env.ADMIN_PASSWORD, password))) {
    const ip = clientIp(request);
    if (ip) {
      try {
        const hour = Math.floor(Date.now() / 3600000);
        const key = await limitKey("login", ip, hour);
        const count = await bump(store, key, hour);
        if (count > 8)
          return json(
            { error: "Too many sign-in attempts. Please try again later." },
            429,
          );
      } catch {
        console.error("Sign-in rate limit unavailable.");
      }
    }
    return json({ error: "That password is not correct." }, 401);
  }
  const token = await signSession(env.ADMIN_SESSION_SECRET);
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(token, secure) });
}
