import { PROFILES } from "./clients.js";

const ICONS = {
  retail: "i-bag",
  logistics: "i-boxes",
  healthcare: "i-team",
};

const cards = Object.values(PROFILES)
  .map((client) => {
    const tone = client.slug === "meridian" ? "retail" : client.slug === "northline" ? "logistics" : "healthcare";
    return `<a class="launch-card" href="/demos/${client.slug}">
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
