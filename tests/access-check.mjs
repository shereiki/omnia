import assert from "node:assert/strict";
import { requireAdmin } from "../server/shared.js";
const env = {
  ADMIN_ACCESS_TEAM_DOMAIN: "omnia-test.cloudflareaccess.com",
  ADMIN_ACCESS_AUD: "test-audience",
};
const keys = await crypto.subtle.generateKey(
  {
    name: "RSASSA-PKCS1-v1_5",
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256",
  },
  true,
  ["sign", "verify"],
);
const jwk = await crypto.subtle.exportKey("jwk", keys.publicKey);
jwk.kid = "test-key";
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url) => {
  assert.equal(
    url,
    "https://omnia-test.cloudflareaccess.com/cdn-cgi/access/certs",
  );
  return Response.json({ keys: [jwk] });
};
const b64 = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
async function token(overrides = {}) {
  const head = b64({ alg: "RS256", kid: "test-key" }),
    body = b64({
      iss: "https://omnia-test.cloudflareaccess.com",
      aud: ["test-audience"],
      exp: Math.floor(Date.now() / 1000) + 600,
      ...overrides,
    });
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    keys.privateKey,
    new TextEncoder().encode(`${head}.${body}`),
  );
  return `${head}.${body}.${Buffer.from(signature).toString("base64url")}`;
}
const request = (token) =>
  new Request("https://useomnia.dev/api/admin/inquiries", {
    headers: token ? { "Cf-Access-Jwt-Assertion": token } : {},
  });
assert.equal((await requireAdmin(request(), {})).status, 503);
assert.equal((await requireAdmin(request(), env)).status, 401);
assert.equal(await requireAdmin(request(await token()), env), null);
for (const changes of [
  { exp: 0 },
  { aud: ["wrong"] },
  { iss: "https://wrong.cloudflareaccess.com" },
  { nbf: Math.floor(Date.now() / 1000) + 600 },
])
  assert.equal(
    (await requireAdmin(request(await token(changes)), env)).status,
    401,
  );
const valid = await token();
assert.equal(
  (await requireAdmin(request(valid.slice(0, -8) + "AAAAAAAA"), env)).status,
  401,
);
globalThis.fetch = originalFetch;
console.log("Cloudflare Access token verification checks passed.");
