import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, sep } from "node:path";
import { handleAdminInquiries, handleAdminSession, handleInquiry } from "../server/inquiries.js";
import { guardAdminRequest } from "../server/session.js";
import { guardDemoRequest } from "../server/demos.js";
import { createMemoryStore } from "../server/store.js";
const demoSession = (await import("../api/demos/session.js")).default;
const demoAsk = (await import("../api/demo/ask.js")).default;

const root = new URL("..", import.meta.url).pathname;
const port = Number(process.env.PORT || 8787);
const store = createMemoryStore();
const env = {
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "local-preview-password",
  ADMIN_SESSION_SECRET:
    process.env.ADMIN_SESSION_SECRET || "local-preview-session-secret-32chars",
};
process.env.ADMIN_PASSWORD = env.ADMIN_PASSWORD;
process.env.ADMIN_SESSION_SECRET = env.ADMIN_SESSION_SECRET;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

const config = JSON.parse(
  await readFile(new URL("../vercel.json", import.meta.url), "utf8"),
);

function headersFor(pathname) {
  const headers = {};
  for (const rule of config.headers || []) {
    const pattern = new RegExp(
      `^${rule.source
        .replace(/\/\(\.\*\)$/, "/.*")
        .replace(/:\w+\*/g, ".*")
        .replace(/\(\.\*\)/g, ".*")}$`,
    );
    if (pattern.test(pathname)) {
      for (const header of rule.headers) headers[header.key] = header.value;
    }
  }
  return headers;
}

async function toRequest(req, url) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) headers.set(key, value.join(", "));
    else if (value) headers.set(key, value);
  }
  if (!headers.get("x-real-ip"))
    headers.set("x-real-ip", req.socket.remoteAddress || "127.0.0.1");
  return new Request(url, {
    method: req.method,
    headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
  });
}

async function readStatic(pathname) {
  const relative = pathname.replace(/^\/+/, "");
  const candidates =
    pathname === "/"
      ? ["index.html"]
      : [relative, `${relative}.html`, join(relative, "index.html")];
  for (const candidate of candidates) {
    const full = join(root, candidate);
    if (full !== root && !full.startsWith(root.endsWith(sep) ? root : root + sep))
      return null;
    try {
      const info = await stat(full);
      if (!info.isFile()) continue;
      return { full, body: await readFile(full) };
    } catch {
      /* try the next candidate */
    }
  }
  return null;
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    const request = await toRequest(req, url);
    let response;
    const hidden = [
      "/server",
      "/docs",
      "/tests",
      "/archive",
      "/scripts",
      "/db",
      "/proxy.js",
      "/package.json",
      "/package-lock.json",
      "/vercel.json",
    ];
    if (
      hidden.some(
        (prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`),
      )
    ) {
      const missing = await readStatic("/404.html");
      response = new Response(missing?.body || "Not found", {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8", ...headersFor(url.pathname) },
      });
    } else if (/^\/demos\/[a-z0-9-]+$/.test(url.pathname)) {
      // the deployment rewrite sends /demos/<slug> to the workspace app
      const page = await readStatic("/demos/workspace.html");
      response = new Response(page.body, {
        headers: { "Content-Type": "text/html; charset=utf-8", ...headersFor(url.pathname) },
      });
    } else if (url.pathname === "/api/demo/ask")
      response = await demoAsk.fetch(request);
    else if (url.pathname === "/api/demos/session")
      response = await demoSession.fetch(request);
    else if (url.pathname === "/demos" || url.pathname.startsWith("/demos/")) {
      const denied = await guardDemoRequest(request, env);
      if (denied) response = denied;
    } else if (url.pathname === "/api/inquiries")
      response = await handleInquiry(request, { store });
    else if (url.pathname === "/api/admin/session")
      response = await handleAdminSession(request, { store, env });
    else if (url.pathname === "/api/admin/inquiries") {
      const denied = await guardAdminRequest(request, env);
      response = denied || (await handleAdminInquiries(request, { store, env }));
    } else if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) {
      const denied = await guardAdminRequest(request, env);
      if (denied) response = denied;
    }
    if (!response) {
      const file = await readStatic(url.pathname);
      if (!file) {
        const missing = await readStatic("/404.html");
        response = new Response(missing?.body || "Not found", {
          status: 404,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      } else {
        const type = types[extname(file.full)] || "application/octet-stream";
        response = new Response(file.body, {
          headers: { "Content-Type": type, ...headersFor(url.pathname) },
        });
      }
    }
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Preview error");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Preview at http://127.0.0.1:${port}`);
  console.log("In-memory inbox. Nothing is written to Neon.");
  console.log(`Local admin password: ${env.ADMIN_PASSWORD}`);
});
