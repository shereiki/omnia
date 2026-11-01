import { timingSafeEqual } from "node:crypto";
import { isSecureRequest, json } from "./http.js";

export const COOKIE = "omnia_admin";
const MIN_PASSWORD = 12;
const MIN_SECRET = 32;

export function adminConfigured(env = process.env) {
  return Boolean(
    env.ADMIN_PASSWORD &&
      env.ADMIN_PASSWORD.length >= MIN_PASSWORD &&
      env.ADMIN_SESSION_SECRET &&
      env.ADMIN_SESSION_SECRET.length >= MIN_SECRET,
  );
}

function bytesToBase64Url(bytes) {
  return Buffer.from(bytes).toString("base64url");
}

async function hmac(secret, value) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );
  return Buffer.from(signature);
}

export async function passwordMatches(expected, given) {
  if (typeof expected !== "string" || typeof given !== "string") return false;
  if (given.length > 200) return false;
  try {
    const [left, right] = await Promise.all([
      hmac(expected, "omnia-admin-password"),
      hmac(given, "omnia-admin-password"),
    ]);
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

export async function signSession(secret, ttlSeconds = 60 * 60 * 12) {
  const payload = bytesToBase64Url(
    new TextEncoder().encode(
      JSON.stringify({
        exp: Math.floor(Date.now() / 1000) + ttlSeconds,
        v: 1,
      }),
    ),
  );
  const signature = (await hmac(secret, payload)).toString("base64url");
  return `${payload}.${signature}`;
}

export function readCookie(request, name = COOKIE) {
  const header = request.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    if (trimmed.slice(0, eq) === name)
      return decodeURIComponent(trimmed.slice(eq + 1));
  }
  return "";
}

export async function verifySession(secret, token) {
  if (!secret || typeof token !== "string" || token.length > 2000) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = (await hmac(secret, payload)).toString("base64url");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return false;
  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString());
    return Number.isFinite(claims.exp) && claims.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

export function sessionCookie(token, secure) {
  return [
    `${COOKIE}=${token}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    "Max-Age=43200",
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function clearedCookie(secure) {
  return [
    `${COOKIE}=`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    "Max-Age=0",
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export async function requireAdmin(request, env = process.env) {
  if (!adminConfigured(env))
    return json({ error: "Admin access is not configured." }, 503);
  const valid = await verifySession(
    env.ADMIN_SESSION_SECRET,
    readCookie(request),
  );
  if (!valid) return json({ error: "Sign in to open the inbox." }, 401);
  return null;
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

export async function guardAdminRequest(request, env = process.env) {
  const path = pathname(request);
  const adminPage = path === "/admin" || path.startsWith("/admin/");
  const adminApi = path === "/api/admin" || path.startsWith("/api/admin/");
  if (!adminPage && !adminApi) return null;
  if (path === "/api/admin/session") return null;
  if (
    path === "/admin/login.js" ||
    path === "/admin/admin.js" ||
    path === "/admin/admin.css"
  )
    return null;
  if (path === "/admin/login.html") return redirect(request, "/admin/login");
  const valid =
    adminConfigured(env) &&
    (await verifySession(env.ADMIN_SESSION_SECRET, readCookie(request)));
  if (path === "/admin/login") return valid ? redirect(request, "/admin") : null;
  if (!adminConfigured(env)) {
    if (adminApi) return json({ error: "Admin access is not configured." }, 503);
    return redirect(request, "/admin/login");
  }
  if (valid) return null;
  if (adminApi) return json({ error: "Sign in to open the inbox." }, 401);
  return redirect(request, "/admin/login");
}

export { isSecureRequest };
