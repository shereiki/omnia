import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const config = JSON.parse(
  readFileSync(new URL("../vercel.json", import.meta.url), "utf8"),
);
const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");
const scripts = ["native-intelligence.js", "omnia-story.js", "script.js", "animations.js"]
  .map((file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8"))
  .join("\n");

assert.match(html, /<link rel="canonical" href="https:\/\/useomnia\.dev\/" \/>/);
assert.match(
  html,
  /property="og:image" content="https:\/\/useomnia\.dev\/assets\/og\.png"/,
);
assert.match(html, /property="og:title"/);
assert.match(html, /name="twitter:card" content="summary_large_image"/);
assert.match(html, /rel="apple-touch-icon"/);
assert.match(html, /assets\/manrope\.woff2/);
assert.doesNotMatch(html, /manrope\.ttf/);

assert.doesNotMatch(html, /id="welcome"/);
assert.doesNotMatch(html, /class="welcome"/);
assert.doesNotMatch(html, /id="enter"/);
assert.doesNotMatch(html, /Explore Omnia/);
assert.doesNotMatch(html, /Start a conversation/);
assert.doesNotMatch(html, /Make it your own/);
assert.doesNotMatch(html, /Launch updates/);
assert.doesNotMatch(html, /Discover Omnia/);
assert.doesNotMatch(html, /Native intelligence/);
assert.doesNotMatch(html, /Operations Intelligence/);
assert.doesNotMatch(html, /AI-native/i);
assert.doesNotMatch(scripts, /Native intelligence|Operations Intelligence|AI-native/i);

assert.match(html, /href="#automations"/);
assert.match(html, /id="automations"/);
assert.match(html, /href="#how-it-works"/);
assert.match(html, /id="how-it-works"/);
assert.match(html, /href="#questions"/);
assert.match(html, /id="questions"/);
assert.match(html, /Get early access/);
assert.match(html, /id="early-access-form"/);
assert.match(html, /method="post"/);
assert.match(html, /action="\/api\/early-access"/);
assert.match(html, /aria-describedby="early-access-status"/);
assert.match(html, /id="early-access-details"/);
assert.match(html, /data-details-submit/);
assert.match(html, /data-details-skip/);
assert.match(html, /v=launch-3/);
assert.doesNotMatch(html, /v=launch-2/);
assert.match(html, /href="styles\.min\.css\?v=/);
assert.doesNotMatch(html, /(launch|mobile)\.css/);
assert.equal(existsSync(new URL("../styles.min.css", import.meta.url)), true);
const versions = new Set(
  [...html.matchAll(/\.(?:css|js)\?v=([\w-]+)/g)].map((match) => match[1]),
);
assert.equal(versions.size, 1, "every CSS/JS reference shares one version");

assert.equal(existsSync(new URL("../wrangler.toml", import.meta.url)), false);
assert.equal(
  existsSync(new URL("../functions/api/inquiries.js", import.meta.url)),
  false,
);
assert.equal(existsSync(new URL("../api/inquiries.js", import.meta.url)), false);
assert.equal(
  existsSync(new URL("../server/inquiries.js", import.meta.url)),
  false,
);
assert.equal(
  existsSync(new URL("../api/early-access.js", import.meta.url)),
  true,
);
assert.equal(
  existsSync(new URL("../api/early-access/details.js", import.meta.url)),
  true,
);
assert.equal(
  existsSync(new URL("../archive/cloudflare/wrangler.toml", import.meta.url)),
  true,
);
assert.equal(config.regions[0], "fra1");
assert.equal(config.proxy.entrypoint, "proxy.js");
const csp = config.headers[0].headers.find(
  (header) => header.key === "Content-Security-Policy",
).value;
assert.match(csp, /script-src 'self'/);
const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
const jsonLdHash = createHash("sha256").update(jsonLd).digest("base64");
assert.match(csp, new RegExp(`sha256-${jsonLdHash.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
assert.match(schema, /CREATE TABLE IF NOT EXISTS early_access/);
assert.match(schema, /email_normalized TEXT NOT NULL UNIQUE/);
assert.doesNotMatch(schema, /CREATE TABLE IF NOT EXISTS inquiries/);
assert.match(schema, /CREATE TABLE IF NOT EXISTS submission_limits/);
assert.doesNotMatch(
  readFileSync(new URL("../README.md", import.meta.url), "utf8"),
  /wrangler pages deploy/,
);

console.log("Page and deploy-target checks passed.");
