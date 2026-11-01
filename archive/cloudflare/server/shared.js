export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
export async function readJson(request, limit = 20000) {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new Error("Invalid input");
  if (Number(request.headers.get("content-length")) > limit)
    throw new Error("Invalid input");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Invalid input");
  let length = 0;
  const chunks = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > limit) {
      await reader.cancel();
      throw new Error("Invalid input");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}
export function sameOrigin(request) {
  return request.headers.get("Origin") === new URL(request.url).origin;
}
const keyCache = new Map();
function decode(value) {
  return Uint8Array.from(
    atob(value.replace(/-/g, "+").replace(/_/g, "/")),
    (c) => c.charCodeAt(0),
  );
}
export async function requireAdmin(request, env) {
  const team = env.ADMIN_ACCESS_TEAM_DOMAIN;
  const audience = env.ADMIN_ACCESS_AUD;
  if (!team || !audience || !/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(team))
    return json({ error: "Admin access is not configured." }, 503);
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token || token.length > 16000)
    return json({ error: "Sign in through Cloudflare Access." }, 401);
  try {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error();
    const header = JSON.parse(new TextDecoder().decode(decode(parts[0])));
    const claims = JSON.parse(new TextDecoder().decode(decode(parts[1])));
    const now = Date.now() / 1000;
    if (
      header.alg !== "RS256" ||
      !header.kid ||
      claims.iss !== `https://${team}` ||
      !Number.isFinite(claims.exp) ||
      claims.exp <= now ||
      (claims.nbf && claims.nbf > now + 30) ||
      !Array.isArray(claims.aud) ||
      !claims.aud.includes(audience)
    )
      throw new Error();
    let cached = keyCache.get(team);
    if (
      !cached ||
      cached.expires < Date.now() ||
      !cached.keys.some((key) => key.kid === header.kid)
    ) {
      const response = await fetch(`https://${team}/cdn-cgi/access/certs`, {
        redirect: "error",
      });
      if (!response.ok) throw new Error();
      const result = await response.json();
      if (!Array.isArray(result.keys)) throw new Error();
      cached = { keys: result.keys, expires: Date.now() + 600000 };
      keyCache.set(team, cached);
    }
    const jwk = cached.keys.find(
      (key) => key.kid === header.kid && key.kty === "RSA",
    );
    if (!jwk) throw new Error();
    const key = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const valid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      decode(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    );
    if (!valid) throw new Error();
    return null;
  } catch {
    return json({ error: "Sign in through Cloudflare Access." }, 401);
  }
}
