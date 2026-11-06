import { next } from "@vercel/functions";
import { guardAdminRequest } from "./server/session.js";

const internal =
  /^\/(?:server|docs|tests|db|scripts|archive)(?:\/|$)|^\/(?:proxy\.js|package(?:-lock)?\.json|vercel\.json|README\.md|\.vercelignore)$/;

export default async function proxy(request) {
  // Vercel serves files before vercel.json rewrites, so source files that are
  // not part of the site are hidden here instead.
  if (internal.test(new URL(request.url).pathname))
    return new Response("Not found", {
      status: 404,
      headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" },
    });
  const denied = await guardAdminRequest(request);
  if (denied) return denied;
  return next();
}
