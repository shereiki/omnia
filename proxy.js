import { next } from "@vercel/functions";
import { guardAdminRequest } from "./server/session.js";
import { guardDemoRequest } from "./server/demos.js";

export default async function proxy(request) {
  const demo = await guardDemoRequest(request);
  if (demo) return demo;
  const denied = await guardAdminRequest(request);
  if (denied) return denied;
  return next();
}
