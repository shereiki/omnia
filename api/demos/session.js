import { clientIp, json, readJson, sameOrigin } from "../../server/http.js";
import {
  clearedDemoCookie,
  demoCookie,
  demoPasswordMatches,
  demoSessionValid,
  noteAttempt,
  tooManyAttempts,
} from "../../server/demos.js";

export default {
  async fetch(request) {
    const method = request.method;

    if (method === "GET") {
      return json({ ok: await demoSessionValid(request) });
    }

    if (method === "DELETE") {
      return json(
        { ok: true },
        200,
        { "Set-Cookie": clearedDemoCookie(new URL(request.url).protocol === "https:") },
      );
    }

    if (method !== "POST") return json({ error: "Method not allowed." }, 405);
    if (!sameOrigin(request)) return json({ error: "Request not allowed." }, 403);

    const key = clientIp(request) || "unknown";
    if (tooManyAttempts(key))
      return json({ error: "Too many attempts." }, 429);

    let password = "";
    try {
      const body = await readJson(request, 2000);
      password = typeof body.password === "string" ? body.password : "";
    } catch {
      return json({ error: "Invalid input." }, 400);
    }

    if (!(await demoPasswordMatches(password))) {
      noteAttempt(key, false);
      return json({ error: "That password doesn’t match." }, 401);
    }

    noteAttempt(key, true);
    return json(
      { ok: true },
      200,
      { "Set-Cookie": await demoCookie(request) },
    );
  },
};
