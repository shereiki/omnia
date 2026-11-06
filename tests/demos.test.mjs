import assert from "node:assert/strict";
import { guardDemoRequest, demoPasswordMatches } from "../server/demos.js";
import { signSession } from "../server/session.js";
import sessionRoute from "../api/demos/session.js";

const SECRET = "test-demo-session-secret-at-least-32ch";
const env = { ADMIN_SESSION_SECRET: SECRET };
const later = {};

// The demo password is stored as a salted hash, never in clear.
assert.equal(await demoPasswordMatches("wrong-password"), false);
assert.equal(await demoPasswordMatches(""), false);
assert.equal(await demoPasswordMatches("omnia-demo-2026"), true);

// Signed out: the workspace redirects to the gate.
const guarded = await guardDemoRequest(
  new Request("https://useomnia.dev/demos/", {}),
  env,
);
assert.equal(guarded.status, 302);
assert.match(guarded.headers.get("location"), /\/demos\/login/);

// The gate itself and its stylesheet stay reachable while signed out.
assert.equal(
  await guardDemoRequest(new Request("https://useomnia.dev/demos/login"), env),
  null,
);
assert.equal(
  await guardDemoRequest(
    new Request("https://useomnia.dev/demos/login.html"),
    env,
  ),
  null,
);
assert.equal(
  await guardDemoRequest(
    new Request("https://useomnia.dev/demos/demo.css"),
    env,
  ),
  null,
);

// The app bundle is not public.
const bundle = await guardDemoRequest(
  new Request("https://useomnia.dev/demos/demo.js"),
  env,
);
assert.equal(bundle.status, 302);

// Signed in: the workspace is served.
const token = await signSession(SECRET, 60);
const signedIn = new Request("https://useomnia.dev/demos/", {
  headers: { cookie: `omnia_demo=${token}` },
});
assert.equal(await guardDemoRequest(signedIn, env), null);

// A cookie signed with a different secret does not open it.
const forged = new Request("https://useomnia.dev/demos/", {
  headers: { cookie: `omnia_demo=${await signSession("another-secret-value-32-chars-long", 60)}` },
});
assert.equal((await guardDemoRequest(forged, env)).status, 302);

// Signing in when already signed in bounces back to the workspace.
const loginWhileSignedIn = await guardDemoRequest(
  new Request("https://useomnia.dev/demos/login", {
    headers: { cookie: `omnia_demo=${token}` },
  }),
  env,
);
assert.equal(loginWhileSignedIn.status, 302);
assert.match(loginWhileSignedIn.headers.get("location"), /\/demos$/);

// Logout clears the cookie.
const logout = await guardDemoRequest(
  new Request("https://useomnia.dev/demos/logout", {
    headers: { cookie: `omnia_demo=${token}` },
  }),
  env,
);
assert.equal(logout.status, 302);
assert.match(logout.headers.get("set-cookie"), /omnia_demo=;/);

// A deployment without a signing secret fails closed rather than open.
const unconfigured = await guardDemoRequest(
  new Request("https://useomnia.dev/demos/", {}),
  {},
);
assert.equal(unconfigured.status, 503);

// Paths outside /demos are untouched.
assert.equal(
  await guardDemoRequest(new Request("https://useomnia.dev/", {}), env),
  null,
);
assert.equal(
  await guardDemoRequest(
    new Request("https://useomnia.dev/main.dashboard", {}),
    env,
  ),
  null,
);

// The session endpoint: wrong password 401, right password sets a cookie.
function signIn(password) {
  return sessionRoute.fetch(
    new Request("https://useomnia.dev/api/demos/session", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://useomnia.dev",
        "x-real-ip": "203.0.113.9",
      },
      body: JSON.stringify({ password }),
    }),
  );
}

process.env.ADMIN_SESSION_SECRET = SECRET;
const denied = await signIn("nope");
assert.equal(denied.status, 401);
assert.equal(denied.headers.get("set-cookie"), null);

const granted = await signIn("omnia-demo-2026");
assert.equal(granted.status, 200);
const cookie = granted.headers.get("set-cookie");
assert.match(cookie, /omnia_demo=/);
assert.match(cookie, /HttpOnly/);
assert.match(cookie, /SameSite=Lax/);

const reused = await guardDemoRequest(
  new Request("https://useomnia.dev/demos/", {
    headers: { cookie: cookie.split(";")[0] },
  }),
  env,
);
assert.equal(reused, null);

// Cross-origin posts are refused.
const crossOrigin = await sessionRoute.fetch(
  new Request("https://useomnia.dev/api/demos/session", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://example.com",
    },
    body: JSON.stringify({ password: "omnia-demo-2026" }),
  }),
);
assert.equal(crossOrigin.status, 403);

// Rate limit: ten failures inside the window end with 429.
let last = null;
for (let i = 0; i < 12; i++) last = await signIn(`bad-${i}`);
assert.equal(last.status, 429);

console.log("Demo gate checks passed.");
