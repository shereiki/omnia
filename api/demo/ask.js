import { clientIp, json, readJson, sameOrigin } from "../../server/http.js";

/*
 * The demo's live assistant. Answers questions about Omnia from a model, not a
 * script. The key is read from the environment (OPENCODE_API_KEY) and never
 * leaves the server; if it is missing or the account cannot pay for a request,
 * the UI is told plainly so it can fall back to the written answers.
 */

const ENDPOINT = "https://opencode.ai/inference/go/openai/v1/chat/completions";
const MODEL = process.env.OPENCODE_MODEL || "glm-5.3-flash";
const MAX_TURNS = 8;
const MAX_CHARS = 1200;

const hits = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 25;

function limited(key) {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now - entry.start > WINDOW_MS) {
    hits.set(key, { start: now, count: 1 });
    if (hits.size > 4000) hits.clear();
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_REQUESTS;
}

const SYSTEM = `You are Omnia's assistant, inside a client workspace demo.

What Omnia is: a managed, modular AI platform for businesses. Omnia designs and implements AI workflows around a company's operation, then gives them a workspace to run and see it. Four surfaces: dashboards (the operation), decisions (money, customers, stock, access — always a person's call), agents (the machinery, working inside rules), and the desk (your engineer, who builds changes).

How it works for a client:
- Omnia builds the dashboards and connectors; the client does not configure plumbing.
- Agents raise anything consequential as a decision; nothing with a cost, a customer or access happens on its own.
- A named engineer (a person) handles change requests and replies inside about 30 minutes. Requests are not an AI chat.
- Connectors: hundreds of systems, with the long tail added on request.

How to answer:
- Be concrete and short: 2 to 4 sentences unless asked to go deeper.
- Talk about the business outcome first (cost, hours, errors), not the technology.
- Never invent client-specific numbers beyond the demo's own data; if asked about something you cannot know, say what you would check or who would.
- If someone asks for a change (a new dashboard, a connector, a different workflow), say it goes to their engineer as a request, and that it is built for them rather than configured by them.
- No buzzwords, no "I am an AI" framing. You are Omnia's assistant, speaking plainly.
- Never write a link, a URL, a file path or markdown of any kind. No "click here", no "[Open X](...)". To show someone something, use the actions block and the workspace opens it for you.
- If they ask to see, open or go to something, that is a navigation: answer in one short sentence and emit the navigate action.
- Never claim you have already done something you cannot do in a sentence. The workspace performs the actions you propose, so for anything other than a navigation, say what you can do ("I can pause Dispatch") and emit the action; do not say it is done.

You can act inside the demo. When an action helps, end your reply with one JSON
block on its own line, and nothing after it:
{"actions":[{"type":"navigate","target":"orders","label":"Open Order Operations"}]}
Allowed actions only:
- {"type":"navigate","target":"<general|agents|decisions|orders|inventory|skus|savings|dispatch|fleet|lanes|schedule|rooms|waitlist|claims>","label":"…"}
- {"type":"open_decision","target":"<decision id>","label":"…"}
- {"type":"pause_agent","target":"<agent id>","label":"…"}
- {"type":"request_change","target":"<short title>","label":"…"}
Use at most two, and only when the person is asking to see or do something.`;

export default {
  async fetch(request) {
    if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
    if (!sameOrigin(request)) return json({ error: "Request not allowed." }, 403);

    const key = clientIp(request) || "unknown";
    if (limited(key)) return json({ error: "Too many questions just now. Try again in a few minutes." }, 429);

    let body;
    try {
      body = await readJson(request, 12000);
    } catch {
      return json({ error: "Invalid input." }, 400);
    }

    const incoming = Array.isArray(body.messages) ? body.messages : [];
    const messages = incoming
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-MAX_TURNS)
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

    if (!messages.length || messages[messages.length - 1].role !== "user")
      return json({ error: "Ask a question first." }, 400);

    const token = process.env.OPENCODE_API_KEY;
    if (!token)
      return json(
        {
          error: "The live assistant is not switched on for this deployment.",
          code: "not_configured",
        },
        503,
      );

    const views = Array.isArray(body.views)
      ? body.views.filter((v) => typeof v === "string" && v.length < 40).slice(0, 12)
      : [];
    const workspace =
      views.length && typeof body.workspace === "string"
        ? `\n\nThis workspace is ${body.workspace.slice(0, 60)}. Its dashboards are: General, Agents, Decisions and ${views.join(", ")}. Nothing else exists here. If someone asks for a dashboard that is not in that list, say this workspace does not have it and name the closest one that does — never say you are showing something you are not.`
        : "";

    const persona =
      typeof body.agent === "string" && body.agent.trim()
        ? `You are speaking as ${body.agent.trim()}, one of this workspace's agents. Stay inside what that agent knows and does.`
        : "";

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          // Go inference routes by session; a stable id per conversation is enough.
          "x-opencode-session": String(body.session || "omnia-demo"),
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "system", content: `${SYSTEM}${workspace}${persona ? `\n\n${persona}` : ""}` }, ...messages],
          max_tokens: 400,
          temperature: 0.4,
        }),
        signal: AbortSignal.timeout(25000),
      });

      if (response.status === 402 || response.status === 403)
        return json(
          {
            error: "The live assistant has no credit on this deployment.",
            code: "unfunded",
          },
          503,
        );

      if (!response.ok)
        return json({ error: "The assistant did not answer. Try again.", code: "upstream" }, 502);

      const data = await response.json();
      const raw =
        data?.choices?.[0]?.message?.content?.trim() ||
        data?.choices?.[0]?.message?.reasoning_content?.trim() ||
        "";
      if (!raw) return json({ error: "The assistant returned nothing.", code: "empty" }, 502);

      // the model may end with an actions block; validate before anything runs
      const NAV = new Set(["general","agents","decisions","orders","inventory","skus","savings","dispatch","fleet","lanes","schedule","rooms","waitlist","claims"]);
      const NAV_HINTS = [
        ["\\b(stock matrix|stock|sku)\\b", "skus", "Stock matrix"],
        ["\\b(inventory)\\b", "inventory", "Inventory Control"],
        ["\\b(live map|map|tracker|where.*truck|on the road)\\b", "tracker", "Live map"],
        ["\\b(dispatch)\\b", "dispatch", "Dispatch board"],
        ["\\b(fleet|drivers?)\\b", "fleet", "Fleet & drivers"],
        ["\\b(lane|lane margin|corridor|rate)\\b", "lanes", "Lane margin"],
        ["\\b(order operations|orders?)\\b", "orders", "Order Operations"],
        ["\\b(savings|saved|roi|cost saving)\\b", "savings", "Savings Report"],
        ["\\b(agents?|what.*working on)\\b", "agents", "Agents"],
        ["\\b(decisions?|approvals?)\\b", "decisions", "Decisions"],
        ["\\b(schedule|today'?s list|appointments?)\\b", "schedule", "Today's list"],
        ["\\b(rooms?|slots?|booking)\\b", "rooms", "Rooms"],
        ["\\b(waitlist|waiting list)\\b", "waitlist", "Waitlist"],
        ["\\b(claims?|insurance)\\b", "claims", "Claims"],
      ];
      let reply = raw;
      let actions = [];
      const match = raw.match(/\{[\s\S]*"actions"[\s\S]*\}\s*$/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          reply = raw.slice(0, match.index).trim();
          actions = (parsed.actions || [])
            .filter((a) => a && typeof a.type === "string" && typeof a.label === "string")
            .map((a) => ({ type: a.type, target: String(a.target || ""), label: a.label.slice(0, 40) }))
            .filter((a) => {
              if (a.type === "navigate") return NAV.has(a.target);
              if (a.type === "open_decision") return /^D-\d+$/.test(a.target);
              if (a.type === "pause_agent") return /^[a-z]{3,20}$/.test(a.target);
              if (a.type === "request_change") return a.target.length > 2;
              return false;
            })
            .slice(0, 2);
        } catch {
          reply = raw;
        }
      }
      // no link ever reaches a client, even if the model writes one
      const stripLinks = (text) =>
        String(text)
          .replace(/\[([^\]]{1,80})\]\([^)]*\)/g, "$1")
          .replace(/https?:\/\/[^\s)]+/g, "")
          .replace(/\*\*([^*]+)\*\*/g, "$1")
          .replace(/\s{2,}/g, " ")
          .trim();
      reply = stripLinks(reply);

      // if they asked to see something and no action came back, open it anyway
      const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content || "";
      if (!actions.length && /\b(show|open|take me|go to|see|where)\b/i.test(lastUser)) {
        for (const [pattern, target, label] of NAV_HINTS) {
          if (new RegExp(pattern, "i").test(lastUser)) {
            actions = [{ type: "navigate", target, label: "Open " + label }];
            break;
          }
        }
      }

      // a model that answers with only an action block still needs a sentence
      if (!reply && actions.length) {
        const first = actions[0];
        const shown = first.label.replace(/^Open\s+/i, "");
        reply =
          first.type === "navigate"
            ? `Opening ${shown}.`
            : first.type === "open_decision"
              ? `Opening decision ${first.target}.`
              : first.type === "pause_agent"
                ? `I can pause that agent — say the word and it stops.`
                : "That one goes to your engineer as a request.";
      }

      return json({ reply, actions });
    } catch {
      return json({ error: "The assistant timed out. Try again.", code: "timeout" }, 504);
    }
  },
};
