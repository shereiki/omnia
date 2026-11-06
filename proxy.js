import { next } from "@vercel/functions";
import { guardAdminRequest } from "./server/session.js";
import { guardDemoRequest } from "./server/demos.js";

// Vercel serves files before vercel.json rewrites, so server/ was readable at
// /server/*. The proxy runs first, so this is the only place that can answer
// with a real status code. api/ imports these modules at build time and is
// untouched by this guard.
const INTERNAL =
  /^\/(?:server|db|docs|tests|archive|scripts)(?:\/|$)|^\/(?:proxy\.js|package(?:-lock)?\.json|vercel\.json|README\.md|\.vercelignore)$/;

export default async function proxy(request) {
  if (INTERNAL.test(new URL(request.url).pathname))
    return new Response("Not found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });

  const demo = await guardDemoRequest(request);
  if (demo) return demo;
  const denied = await guardAdminRequest(request);
  if (denied) return denied;
  return next();
}
