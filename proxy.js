import { next } from "@vercel/functions";
import { guardAdminRequest } from "./server/session.js";

export default async function proxy(request) {
  const denied = await guardAdminRequest(request);
  if (denied) return denied;
  return next();
}
