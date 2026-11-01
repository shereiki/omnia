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

const interests = new Set(["business", "partner", "investor", "updates"]);
const memoryLimits = new Map();

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

export async function handleInquiry(request, { store = getStore() } = {}) {
  if (request.method !== "POST")
    return json({ error: "Method not allowed." }, 405);
  if (!sameOrigin(request)) return json({ error: "Request not allowed." }, 403);
  let input;
  try {
    input = await readJson(request);
  } catch {
    return json({ error: "Please check your details and try again." }, 400);
  }
  const name = typeof input?.name === "string" ? input.name.trim() : "";
  const email = typeof input?.email === "string" ? input.email.trim() : "";
  const message =
    typeof input?.message === "string" ? input.message.trim() : "";
  if (
    input?.website ||
    !name ||
    name.length > 120 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    (!message && input?.interest !== "updates") ||
    message.length > 4000 ||
    !interests.has(input?.interest)
  )
    return json({ error: "Please check your details and try again." }, 400);
  if (!store)
    return json(
      {
        error:
          "Inquiries are not open yet. Nothing has been sent. Please check back soon.",
      },
      503,
    );
  try {
    const ip = clientIp(request);
    if (ip) {
      const hour = Math.floor(Date.now() / 3600000);
      const key = await limitKey("inquiry", ip, hour);
      const count = await bump(store, key, hour);
      if (count > 10)
        return json(
          {
            error:
              "Too many inquiries from this connection. Please try again later.",
          },
          429,
        );
    }
    const id = crypto.randomUUID();
    await store.insertInquiry({
      id,
      name,
      email,
      interest: input.interest,
      message,
    });
    return json({ id, received: true }, 201);
  } catch {
    console.error("Inquiry storage unavailable.");
    return json(
      { error: "Your inquiry could not be saved. Please try again later." },
      503,
    );
  }
}

export async function handleAdminInquiries(
  request,
  { store = getStore(), env = process.env } = {},
) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;
  if (!store) return json({ error: "The inquiry database is not connected." }, 503);
  try {
    if (request.method === "GET") {
      const rawPage = Number(new URL(request.url).searchParams.get("page") || 0);
      if (!Number.isInteger(rawPage) || rawPage < 0 || rawPage > 10000)
        return json({ error: "Invalid page." }, 400);
      const results = await store.listInquiries(rawPage * 50);
      return json({
        inquiries: results.slice(0, 50),
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
      const changes = await store.updateInquiry(input.id, input.status);
      if (!changes) return json({ error: "Inquiry not found." }, 404);
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
