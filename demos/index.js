import { PROFILES } from "./clients.js";

const ICONS = {
  retail: "i-bag",
  logistics: "i-boxes",
  healthcare: "i-team",
};

const cards = Object.values(PROFILES)
  .map((client) => {
    const tone = client.slug === "meridian" ? "retail" : client.slug === "northline" ? "logistics" : "healthcare";
    return `<a class="launch-card" href="/demos/workspace?client=${client.slug}">
      <span class="launch-card-top">
        <span class="launch-mark">${client.name.slice(0, 1)}</span>
        <span class="launch-meta">
          <strong>${client.name}</strong>
          <small>${client.industry} · ${client.region}</small>
        </span>
        <span class="launch-status"><i></i>Live</span>
      </span>
      <span class="launch-pitch">${client.pitch}</span>
      <span class="launch-chips">
        ${client.highlights.map((h) => `<span class="launch-chip">${h}</span>`).join("")}
      </span>
      <span class="launch-foot">
        <span>${client.agents.length} agents · ${client.decisions.length} decisions waiting</span>
        <span class="launch-open">Open demo <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></span>
      </span>
    </a>`;
  })
  .join("");

document.getElementById("launchGrid").innerHTML = cards;

/* ------------------------------------------------------------------ ask */

const thread = document.getElementById("launchAskThread");
const form = document.getElementById("launchAskForm");
const input = document.getElementById("launchAskInput");
const history = [];
let pending = false;

function bubble(role, text) {
  return `<div class="ask-msg ${role}">${text}</div>`;
}

function paint() {
  if (!thread) return;
  thread.innerHTML =
    history.map((m) => bubble(m.role === "user" ? "user" : "assistant", m.content)).join("") +
    (pending ? '<div class="ask-msg assistant typing"><span class="dots"><i></i><i></i><i></i></span></div>' : "");
  thread.scrollTop = thread.scrollHeight;
}

async function ask(text) {
  if (pending || !text.trim()) return;
  pending = true;
  history.push({ role: "user", content: text.trim() });
  paint();
  let reply;
  try {
    const response = await fetch("/api/demo/ask", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: history.slice(-8), session: "omnia-demo-launcher" }),
      signal: AbortSignal.timeout(40000),
    });
    const data = await response.json();
    reply = response.ok
      ? data.reply
      : data.code === "unfunded" || data.code === "not_configured"
        ? "The live assistant is not switched on for this deployment yet."
        : data.error || "The assistant did not answer.";
  } catch {
    reply = "Could not reach the assistant. Try again in a moment.";
  }
  pending = false;
  history.push({ role: "assistant", content: reply });
  paint();
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value;
  input.value = "";
  ask(text);
});

document.querySelectorAll("[data-ask]").forEach((chip) =>
  chip.addEventListener("click", () => ask(chip.dataset.ask)),
);
