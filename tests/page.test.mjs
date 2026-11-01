import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const config = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");

assert.match(html, /<link rel="canonical" href="https:\/\/useomnia\.dev\/" \/>/);
assert.match(html, /property="og:image" content="https:\/\/useomnia\.dev\/assets\/og\.png"/);
assert.match(html, /property="og:title"/);
assert.match(html, /name="twitter:card" content="summary_large_image"/);
assert.match(html, /rel="apple-touch-icon"/);
assert.match(html, /assets\/manrope\.woff2/);
assert.doesNotMatch(html, /manrope\.ttf/);
assert.match(html, /action="\/api\/inquiries"/);
assert.match(html, /aria-describedby="inquiry-status"/);

assert.equal(existsSync(new URL("../wrangler.toml", import.meta.url)), false);
assert.equal(existsSync(new URL("../functions/api/inquiries.js", import.meta.url)), false);
assert.equal(existsSync(new URL("../api/inquiries.js", import.meta.url)), true);
assert.equal(existsSync(new URL("../archive/cloudflare/wrangler.toml", import.meta.url)), true);
assert.equal(config.regions[0], "fra1");
assert.equal(config.proxy.entrypoint, "proxy.js");
assert.match(config.headers[0].headers.find((header) => header.key === "Content-Security-Policy").value, /script-src 'self'/);
assert.match(schema, /CREATE TABLE IF NOT EXISTS inquiries/);
assert.doesNotMatch(readFileSync(new URL("../README.md", import.meta.url), "utf8"), /wrangler pages deploy/);

console.log("Page and deploy-target checks passed.");
