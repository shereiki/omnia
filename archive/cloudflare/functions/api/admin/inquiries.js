import {
  json,
  readJson,
  sameOrigin,
  requireAdmin,
} from "../../../server/shared.js";
export async function onRequest({ request, env }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;
  if (!env.INQUIRIES_DB)
    return json({ error: "The inquiry database is not connected." }, 503);
  try {
    if (request.method === "GET") {
      const rawPage = Number(
        new URL(request.url).searchParams.get("page") || 0,
      );
      if (!Number.isInteger(rawPage) || rawPage < 0 || rawPage > 10000)
        return json({ error: "Invalid page." }, 400);
      const { results } = await env.INQUIRIES_DB.prepare(
        "SELECT id, name, email, interest, message, status, created_at FROM inquiries ORDER BY created_at DESC, id DESC LIMIT 51 OFFSET ?",
      )
        .bind(rawPage * 50)
        .all();
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
      const result = await env.INQUIRIES_DB.prepare(
        "UPDATE inquiries SET status = ? WHERE id = ?",
      )
        .bind(input.status, input.id)
        .run();
      if (!result.meta.changes)
        return json({ error: "Inquiry not found." }, 404);
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
