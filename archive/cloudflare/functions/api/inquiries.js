import { json, readJson, sameOrigin } from "../../server/shared.js";
const interests = new Set(["business", "partner", "investor", "updates"]);
export async function onRequest({ request, env }) {
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
  if (!env.INQUIRIES_DB)
    return json(
      {
        error:
          "Inquiries are not open yet. Nothing has been sent. Please check back soon.",
      },
      503,
    );
  try {
    const ip = request.headers.get("CF-Connecting-IP");
    if (ip) {
      const hour = Math.floor(Date.now() / 3600000);
      const hash = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(`${hour}:${ip}`),
      );
      const key = [...new Uint8Array(hash)]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("");
      const limit = await env.INQUIRIES_DB.prepare(
        "INSERT INTO submission_limits (key, window_start, count) VALUES (?, ?, 1) ON CONFLICT(key) DO UPDATE SET count = count + 1 RETURNING count",
      )
        .bind(key, hour)
        .first();
      if (limit.count > 10)
        return json(
          {
            error:
              "Too many inquiries from this connection. Please try again later.",
          },
          429,
        );
      await env.INQUIRIES_DB.prepare(
        "DELETE FROM submission_limits WHERE window_start < ?",
      )
        .bind(hour - 24)
        .run();
    }
    const id = crypto.randomUUID();
    await env.INQUIRIES_DB.prepare(
      "INSERT INTO inquiries (id, name, email, interest, message) VALUES (?, ?, ?, ?, ?)",
    )
      .bind(id, name, email, input.interest, message)
      .run();
    return json({ id, received: true }, 201);
  } catch {
    console.error("Inquiry storage unavailable.");
    return json(
      { error: "Your inquiry could not be saved. Please try again later." },
      503,
    );
  }
}
