/* Omnia client workspace demo.
   Illustrative data only. Nothing here talks to a real service. */

import {
  lineChart,
  columns,
  donut,
  funnel,
  sparkline,
  niceMax,
  fmt,
  C,
} from "./charts.js";
import { PROFILES, TICKET_TEMPLATES as SHARED_TICKET_TEMPLATES } from "./clients.js";

const I = (id) => `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#${id}"></use></svg>`;

/* ------------------------------------------------------------------ data */

/* Which client this workspace belongs to. /demos/<slug> or ?client=<slug>. */
const SLUG =
  (location.pathname.match(/\/demos\/([a-z0-9-]+)\/?$/) || [])[1] ||
  new URLSearchParams(location.search).get("client") ||
  "meridian";

export const CLIENT = PROFILES[SLUG] || PROFILES.meridian;

const {
  days: DAYS,
  hours: HOURS,
  weeks: WEEKS,
  engineer: ENGINEER,
  decisions: DECISIONS,
  requests: REQUESTS,
  agents: AGENTS,
  orders: ORDERS,
  inventory: INVENTORY,
  people: PEOPLE,
  systems: SYSTEMS,
  modules: MODULES,
  activity: ACTIVITY,
} = CLIENT;

const PERIODS = {
  "24h": {
    label: "Today",
    grain: "per hour",
    points: HOURS,
    median: [22, 20, 18, 17, 15, 15, 14],
    hours: Math.max(1, Math.round(CLIENT.savings.hours / 30)),
    replyNote: "down from 22s",
  },
  "7d": {
    label: "Last 7 days",
    grain: "per day",
    points: DAYS,
    median: [44, 39, 33, 28, 22, 20, 18],
    hours: Math.round(CLIENT.savings.hours / 4),
    replyNote: "down from 4m",
  },
  "30d": {
    label: "Last 30 days",
    grain: "per week",
    points: WEEKS,
    median: [60, 44, 32, 21],
    hours: CLIENT.savings.hours,
    replyNote: "down from 3m",
  },
};

const TICKET_TEMPLATES = SHARED_TICKET_TEMPLATES;
const DASH = CLIENT.dashboards;
const firstName = () =>
  CLIENT.people[0].name.replace(/^Dr\.\s*/, "").split(" ")[0];
const greeting = () => {
  const hour = new Date().getHours();
  const part = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return `${part}, ${firstName()}`;
};

const state = {
  tabs: [
    { id: "general", pinned: true },
    { id: "decisions" },
    { id: "orders" },
    { id: "inventory" },
    { id: "savings" },
  ],
  dock: { open: false, view: "requests", thread: null },
  active: "general",
  os: false,
  osView: "overview",
  period: "7d",
  agentId: "coordinator",
  decisionFilter: "All",
  stageFilter: "All",
  orderQuery: "",
  selectedStock: new Set(),
  decisions: DECISIONS.map((d) => ({ ...d })),
  requests: REQUESTS.map((r) => ({ ...r, thread: [...r.thread] })),
  notifications: [
    { id: "n1", title: "Two orders are waiting on your approval", meta: "Coordinator · 4 min ago", kind: "decision", ref: "D-2101", read: false },
    { id: "n2", title: `${ENGINEER.name.split(" ")[0]} replied to REQ-014`, meta: "Your engineer · 12 min ago", kind: "request", ref: "REQ-014", read: false },
    { id: "n3", title: "Stock cover dropped under a week", meta: "Inventory Control · 28 min ago", kind: "decision", ref: "D-2102", read: false },
    { id: "n4", title: "Zoho Inventory is degraded", meta: "Systems · 3 hr ago", kind: "system", read: true },
  ],
  nextRequest: 15,
  toastTimer: null,
};

/* --------------------------------------------------------------- helpers */

const sum = (list, key) => list.reduce((total, item) => total + item[key], 0);
const period = () => PERIODS[state.period];
const pendingDecisions = () => state.decisions.filter((d) => d.status === "pending");
const openRequests = () => state.requests.filter((r) => r.status !== "Closed");
const unread = () => state.notifications.filter((n) => !n.read).length;

function toast(message) {
  const el = document.getElementById("toast");
  el.innerHTML = `<i></i>${message}`;
  el.hidden = false;
  if (window.gsap) gsap.fromTo(el, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.26, ease: "power2.out" });
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => {
    if (!window.gsap) return (el.hidden = true);
    gsap.to(el, { y: 10, opacity: 0, duration: 0.2, onComplete: () => (el.hidden = true) });
  }, 3200);
}

function csv(name, rows) {
  const body = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  toast(`Exported ${name}`);
}

function updateBadge() {
  const badge = document.getElementById("badge");
  const count = unread();
  badge.hidden = count === 0;
  badge.textContent = String(count);
}

let notifySeq = 0;
function notify(entry) {
  state.notifications.unshift({
    read: false,
    id: entry.id || `n${Date.now()}${notifySeq++}`,
    ...entry,
  });
  updateBadge();
}

/* -------------------------------------------------------------- overlays */

function openDrawer(title, subtitle, body) {
  const drawer = document.getElementById("drawer");
  drawer.innerHTML = `
    <div class="drawer-head">
      <div><h2>${title}</h2><p>${subtitle}</p></div>
      <button class="icon-button" data-close-drawer aria-label="Close">${I("i-x")}</button>
    </div>
    <div class="drawer-body">${body}</div>`;
  drawer.hidden = false;
  document.getElementById("drawerBackdrop").hidden = false;
  if (window.gsap) {
    gsap.fromTo(drawer, { x: 44, opacity: 0 }, { x: 0, opacity: 1, duration: 0.32, ease: "power3.out" });
    gsap.fromTo(drawer.querySelectorAll(".drawer-body > *"), { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, stagger: 0.04, delay: 0.05 });
  }
  drawer.querySelector("[data-close-drawer]").addEventListener("click", closeDrawer);
  wireDrawer();
}

function closeDrawer() {
  const drawer = document.getElementById("drawer");
  const done = () => {
    drawer.hidden = true;
    document.getElementById("drawerBackdrop").hidden = true;
    drawer.innerHTML = "";
  };
  if (!window.gsap) return done();
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    done();
  };
  gsap.to(drawer, { x: 28, opacity: 0, duration: 0.18, onComplete: finish });
  setTimeout(finish, 320);
}

function openModal(html) {
  const modal = document.getElementById("modal");
  modal.innerHTML = html;
  document.getElementById("modalBackdrop").hidden = false;
  if (window.gsap) gsap.fromTo(modal, { y: 12, opacity: 0, scale: 0.995 }, { y: 0, opacity: 1, scale: 1, duration: 0.28, ease: "power3.out" });
  modal.querySelector("[data-close-modal]")?.addEventListener("click", closeModal);
  wireDrawer();
}

function closeModal() {
  document.getElementById("modalBackdrop").hidden = true;
  document.getElementById("modal").innerHTML = "";
}

/* ------------------------------------------------------- requests / desk */

function engineerAvatar(size = "") {
  return `<span class="engineer-avatar ${size}">${ENGINEER.initials}<i class="${ENGINEER.available ? "" : "away"}"></i></span>`;
}

function statusChip(status) {
  const map = {
    Answered: "good",
    Open: "uv",
    "With your engineer": "warn",
    Closed: "ghost",
  };
  return `<span class="chip ${map[status] || ""}">${status}</span>`;
}

function requestThread(request) {
  return `<div class="thread">${request.thread
    .map(
      (m) => `<div class="thread-msg ${m.from}">
        ${m.from === "engineer" ? engineerAvatar("sm") : `<span class="mini-avatar">MO</span>`}
        <div>
          <div class="thread-meta"><strong>${m.author}</strong><span>${m.when}</span></div>
          <p>${m.text}</p>
        </div>
      </div>`,
    )
    .join("")}</div>`;
}

function newRequestModal(preset = "") {
  const presetType =
    preset === "integration" ? "Integration" : preset === "module" ? "Workflow change" : "New dashboard";
  const presetTitle =
    preset === "integration"
      ? "Connect a system"
      : preset === "module"
        ? "A capability we do not have yet"
        : "";
  const presetDetails =
    preset === "integration"
      ? "Which system, and what should we read from it?"
      : preset === "module"
        ? "What should it do, and who needs it?"
        : "";
  openModal(`
    <div class="modal-head">
      <div><h2>Request a change</h2><p>Your engineer picks it up and comes back to you — usually inside 30 minutes.</p></div>
      <button class="icon-button" data-close-modal aria-label="Close">${I("i-x")}</button>
    </div>
    <div class="modal-body">
      <form class="request-form" id="requestForm">
        <label>What kind of change?
          <select name="type">
            ${["New dashboard", "Workflow change", "Integration", "Something's wrong"]
              .map((t) => `<option ${t === presetType ? "selected" : ""}>${t}</option>`)
              .join("")}
          </select>
        </label>
        <label>In a sentence
          <input name="title" required placeholder="${presetTitle || "Supplier lead time on Order Operations"}" />
        </label>
        <label>Anything useful to know
          <textarea name="details" rows="3" placeholder="${presetDetails || "Where it should live, who needs it, what it should show…"}"></textarea>
        </label>
        <p class="modal-note">${ENGINEER.name.split(" ")[0]} sees this with the workspace context already attached. You will not be asked to explain it twice.</p>
        <div class="modal-actions">
          <button class="btn primary" type="submit">Send to ${ENGINEER.name.split(" ")[0]}</button>
          <button class="btn" type="button" data-book-call>Book a call instead</button>
        </div>
      </form>
    </div>`);
  document.querySelector("[data-book-call]")?.addEventListener("click", bookACall);
  document.getElementById("requestForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    submitRequest(String(form.get("type")), String(form.get("title")), String(form.get("details")));
  });
}

function submitRequest(type, title, details) {
  const id = `REQ-0${state.nextRequest++}`;
  const request = {
    id,
    title: title.trim() || "New request",
    type,
    status: "Open",
    updated: "just now",
    needing: false,
    thread: [
      {
        from: "client",
        author: "${CLIENT.people[0].name}",
        when: "Just now",
        text: details.trim() || title.trim(),
      },
    ],
  };
  state.requests.unshift(request);
  closeModal();
  if (state.dock.open) renderDock();
  toast(`${id} sent · Ayesha will reply shortly`);

  scheduleReply(id, type);
}

/* A reply that survives a backgrounded tab: due times are checked on a timer
   and again whenever the page becomes visible or is interacted with. */
const pendingReplies = new Map();

function scheduleReply(id, type) {
  pendingReplies.set(id, { due: Date.now() + 8000, type });
  deliverDueReplies();
}

function deliverDueReplies() {
  const now = Date.now();
  for (const [id, entry] of [...pendingReplies.entries()]) {
    if (entry.due > now) continue;
    pendingReplies.delete(id);
    deliverReply(id, entry.type);
  }
}

function deliverReply(id, type) {
  const request = state.requests.find((r) => r.id === id);
  if (!request) return;
  const template = TICKET_TEMPLATES[type] || TICKET_TEMPLATES["Workflow change"];
  request.status = "Answered";
  request.updated = "just now";
  request.deliverables = template.evidence;
  request.thread.push({ from: "engineer", author: ENGINEER.name, when: "Just now", text: template.reply });
  notify({ title: `${ENGINEER.name.split(" ")[0]} replied to ${id}`, meta: "Your engineer · just now", kind: "request", ref: id });
  toast(`${id} · Ayesha replied`);
  if (state.dock.open) renderDock();
}

setInterval(deliverDueReplies, 1000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) deliverDueReplies(); });
window.addEventListener("focus", deliverDueReplies);
document.addEventListener("pointerdown", deliverDueReplies, { passive: true });

function bookACall() {
  closeModal();
  openModal(`
    <div class="modal-head">
      <div><h2>Book a call with ${ENGINEER.name.split(" ")[0]}</h2><p>30 minutes, screen shared, no slides.</p></div>
      <button class="icon-button" data-close-modal aria-label="Close">${I("i-x")}</button>
    </div>
    <div class="modal-body">
      <div class="slots">
        ${["Today · 16:30 GST", "Tomorrow · 10:00 GST", "Tomorrow · 14:30 GST"]
          .map((slot) => `<button class="slot" data-slot="${slot}"><span>${slot}</span>${I("i-arrow")}</button>`)
          .join("")}
      </div>
      <p class="modal-note">For most changes a request is faster — she usually replies inside 30 minutes.</p>
    </div>`);
  document.querySelectorAll("[data-slot]").forEach((button) =>
    button.addEventListener("click", () => {
      closeModal();
      toast(`Requested ${button.dataset.slot}`);
    }),
  );
}

/* ------------------------------------------------------------------- tabs */

function solution(id) {
  return SOLUTIONS.find((s) => s.id === id);
}

const SOLUTIONS = [
  { id: "decisions", label: "Decisions", meta: "Waiting on a person", icon: "i-shield", tone: "", state: "" },
  { id: "orders", label: DASH.orders, meta: "Live operation", icon: "i-bag", tone: "mint", state: "Running" },
  { id: "inventory", label: DASH.inventory, meta: "Capacity & stock", icon: "i-boxes", tone: "lav", state: "3 need review", review: true },
  { id: "savings", label: DASH.savings, meta: "Cost recovered", icon: "i-chart", tone: "ink", state: "Updated today" },
];

const tabLabel = (id) => (id === "general" ? "General" : solution(id)?.label || id);
const tabIcon = (id) => (id === "general" ? "i-grid" : solution(id)?.icon || "i-grid");

function renderTabs() {
  const root = document.getElementById("tabs");
  const pending = pendingDecisions().length;
  root.innerHTML = state.tabs
    .map((tab) => {
      const active = tab.id === state.active && !state.os;
      const count = tab.id === "decisions" && pending ? `<b class="tab-count">${pending}</b>` : "";
      return `<button class="tab${tab.pinned ? " pinned" : ""}" role="tab" aria-selected="${active}"
        data-tab="${tab.id}" tabindex="${active ? 0 : -1}"
        ${tab.pinned ? "" : 'title="Drag to reorder · Alt + arrow keys"'} aria-grabbed="false">
        ${I(tabIcon(tab.id))}<span>${tabLabel(tab.id)}</span>${count}
      </button>`;
    })
    .join("");
  root.querySelectorAll("[data-tab]").forEach((button) =>
    button.addEventListener("click", (event) => {
      if (dragState.justDragged) {
        dragState.justDragged = false;
        return;
      }
      openTab(button.dataset.tab);
    }),
  );
}


/* ------------------------------------------------------- tab rearranging */

const dragState = { justDragged: false, active: null };

function persistTabOrder() {
  try {
    sessionStorage.setItem(
      "omnia-demo-tabs",
      JSON.stringify(state.tabs.map((t) => t.id)),
    );
  } catch {
    /* private mode */
  }
}

function restoreTabOrder() {
  try {
    const saved = JSON.parse(sessionStorage.getItem("omnia-demo-tabs") || "null");
    if (!Array.isArray(saved)) return;
    const known = new Map(state.tabs.map((t) => [t.id, t]));
    const restored = saved
      .map((id) => known.get(id))
      .filter(Boolean)
      .map((t) => ({ ...t }));
    for (const tab of state.tabs) if (!restored.some((t) => t.id === tab.id)) restored.push({ ...tab });
    const pinned = restored.find((t) => t.pinned);
    state.tabs = [pinned, ...restored.filter((t) => !t.pinned)].filter(Boolean);
  } catch {
    /* ignore malformed storage */
  }
}

function moveTab(id, delta) {
  const index = state.tabs.findIndex((t) => t.id === id);
  if (index < 0) return;
  const target = index + delta;
  if (target < 1 || target >= state.tabs.length) return;
  if (state.tabs[index].pinned) return;
  const [tab] = state.tabs.splice(index, 1);
  state.tabs.splice(target, 0, tab);
  renderTabs();
  persistTabOrder();
  document.querySelector(`[data-tab="${id}"]`)?.focus();
}

function syncOrderFromDom(root) {
  const order = [...root.querySelectorAll("[data-tab]")].map((el) => el.dataset.tab);
  const byId = new Map(state.tabs.map((t) => [t.id, t]));
  const next = order.map((id) => byId.get(id)).filter(Boolean);
  for (const tab of state.tabs) if (!order.includes(tab.id)) next.push(tab);
  const pinned = next.find((t) => t.pinned);
  state.tabs = [pinned, ...next.filter((t) => !t.pinned)].filter(Boolean);
}

function setupTabDrag() {
  const strip = document.getElementById("tabs");
  if (!strip) return;

  const clearDrag = () => {
    const { tab } = dragState.active || {};
    if (tab) {
      tab.classList.remove("dragging");
      tab.setAttribute("aria-grabbed", "false");
      if (window.gsap) {
        gsap.to(tab, {
          x: 0,
          duration: 0.22,
          ease: "power2.out",
          onComplete: () => (tab.style.transform = ""),
        });
      } else {
        tab.style.transform = "";
      }
    }
    document.body.classList.remove("tab-dragging");
    dragState.active = null;
  };

  strip.addEventListener("pointerdown", (event) => {
    const tab = event.target.closest("[data-tab]");
    if (!tab || tab.classList.contains("pinned")) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragState.active = {
      tab,
      id: tab.dataset.tab,
      pointerId: event.pointerId,
      grab: event.clientX - strip.scrollLeft - tab.offsetLeft,
      startX: event.clientX,
      moved: false,
    };
    tab.setPointerCapture?.(event.pointerId);
  });

  strip.addEventListener("pointermove", (event) => {
    const drag = dragState.active;
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (!drag.moved) {
      if (Math.abs(event.clientX - drag.startX) < 6) return;
      drag.moved = true;
      drag.tab.classList.add("dragging");
      drag.tab.setAttribute("aria-grabbed", "true");
      document.body.classList.add("tab-dragging");
    }

    const slot = event.clientX - strip.scrollLeft - drag.grab;
    drag.tab.style.transform = `translateX(${slot - drag.tab.offsetLeft}px)`;

    // Which slot is the pointer over?
    const others = [...strip.querySelectorAll("[data-tab]")].filter((el) => el !== drag.tab);
    const pinned = strip.querySelector("[data-tab].pinned");
    let reference = null;
    for (const el of others) {
      const box = el.getBoundingClientRect();
      if (event.clientX < box.left + box.width / 2) {
        reference = el;
        break;
      }
    }
    if (pinned && reference === pinned) return;
    const currentNext = drag.tab.nextElementSibling;
    if (reference === currentNext || (!reference && !currentNext)) return;

    const before = new Map(
      [...strip.querySelectorAll("[data-tab]")].map((el) => [el, el.getBoundingClientRect().left]),
    );
    if (reference) strip.insertBefore(drag.tab, reference);
    else strip.appendChild(drag.tab);

    drag.tab.style.transform = `translateX(${slot - drag.tab.offsetLeft}px)`;

    if (window.gsap) {
      for (const [el, left] of before) {
        if (el === drag.tab) continue;
        const delta = left - el.getBoundingClientRect().left;
        if (!delta) continue;
        gsap.fromTo(el, { x: delta }, { x: 0, duration: 0.22, ease: "power2.out", overwrite: true });
      }
    }
  });

  const finish = (event) => {
    const drag = dragState.active;
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (drag.moved) {
      dragState.justDragged = true;
      setTimeout(() => (dragState.justDragged = false), 60);
      syncOrderFromDom(strip);
      persistTabOrder();
    }
    clearDrag();
  };
  strip.addEventListener("pointerup", finish);
  strip.addEventListener("pointercancel", finish);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dragState.active?.moved) clearDrag();
  });
}

function openTab(id) {
  if (!state.tabs.some((t) => t.id === id)) state.tabs.push({ id });
  state.active = id;
  state.os = false;
  renderTabs();
  renderStage();
}

/* ------------------------------------------------------------------ views */

function kpiTiles() {
  const p = period();
  const conversations = sum(p.points, "conversations");
  const orders = sum(p.points, "orders");
  const reply = p.median[p.median.length - 1];
  return `<div class="tile-grid">
    ${[
      { label: "Conversations", value: conversations, note: p.label, icon: "i-spark", tone: "", series: p.points.map((d) => d.conversations), delta: state.period === "24h" ? "+9%" : state.period === "7d" ? "+18%" : "+24%" },
      { label: "Orders", value: orders, note: p.label, icon: "i-bag", tone: "mint", series: p.points.map((d) => d.orders), delta: state.period === "24h" ? "+4%" : state.period === "7d" ? "+6%" : "+12%" },
      { label: "Median first reply", value: reply, unit: "s", note: p.replyNote, icon: "i-pulse", tone: "lav", series: p.median, delta: "" },
      { label: "Hours returned", value: p.hours, unit: "h", note: p.label, icon: "i-clock", tone: "ink", series: [p.hours * 0.4, p.hours * 0.55, p.hours * 0.7, p.hours * 0.85, p.hours], delta: "" },
    ]
      .map(
        (k) => `<article class="tile">
          <div class="tile-top"><span class="tile-label">${k.label}</span>
            <span class="tile-icon ${k.tone}">${I(k.icon)}</span></div>
          <div class="tile-value" data-count="${k.value}">${fmt.n(k.value)}${k.unit ? `<small>${k.unit}</small>` : ""}</div>
          <div class="tile-foot">
            ${k.delta ? `<span class="delta">${k.delta}</span>` : ""}
            <span>${k.note}</span>
            <span class="tile-spark">${sparkline(k.series, { color: k.tone === "mint" ? C.mint : C.uv })}</span>
          </div>
        </article>`,
      )
      .join("")}
  </div>`;
}

function decisionCard(decision, { compact = false } = {}) {
  const decided = decision.status !== "pending";
  const riskClass = decision.risk === "High" ? "high" : decision.risk === "Medium" ? "medium" : "low";
  return `<article class="decision ${decided ? "decided" : ""} ${compact ? "compact" : ""}" data-decision="${decision.id}">
    <div class="decision-head">
      <span class="chip ghost">${decision.area}</span>
      <span class="risk ${riskClass}"><i></i>${decision.risk} risk</span>
      <span class="decision-id">${decision.id}</span>
    </div>
    <h3>${decision.title}</h3>
    <p>${decision.why}</p>
    <div class="decision-meta">
      <div><span>Impact</span><strong>${decision.impact}</strong><small>${decision.impactNote}</small></div>
      <div><span>Decide by</span><strong>${decision.deadline}</strong><small>${decision.agent}</small></div>
    </div>
    <div class="decision-evidence">${I("i-doc")}${decision.evidence}</div>
    ${
      decided
        ? `<div class="decision-done">${I("i-check")}${decision.status === "approved" ? "Approved" : "Declined"} by you · just now</div>`
        : `<div class="decision-actions">
            <button class="btn primary sm" data-approve="${decision.id}">Approve</button>
            <button class="btn sm" data-decline="${decision.id}">Decline</button>
            <button class="btn quiet sm" data-ask="${decision.id}">Ask ${decision.agent}</button>
          </div>`
    }
  </article>`;
}

function viewGeneral() {
  const p = period();
  const pending = pendingDecisions();
  return `
  <div class="view-head">
    <div>
      <h1>${greeting()}</h1>
      <p>${new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} · ${pending.length} decisions waiting, ${openRequests().length} open requests.</p>
    </div>
  </div>

  ${kpiTiles()}

  <div class="split wide-left">
    <section class="card chart-card">
      <div class="card-head">
        <div><h2>Activity</h2><small>Conversations ${p.grain}, with orders</small></div>
        <div class="seg" role="group" aria-label="Period">
          ${["24h", "7d", "30d"].map((k) => `<button type="button" data-period="${k}" aria-pressed="${state.period === k}">${k}</button>`).join("")}
        </div>
      </div>
      <div class="card-body">
        <div class="chart-wrap" id="mainChart"></div>
      </div>
      <div class="card-foot">
        <div class="chart-legend"><span><i></i>Conversations</span><span><i class="mint"></i>Orders</span></div>
        <span>${p.label} · sample data</span>
      </div>
    </section>

    <aside class="card decisions-card">
      <div class="card-head">
        <div><h2>Critical decisions</h2><small>Things only a person can sign off</small></div>
        <span class="chip uv">${pending.length} waiting</span>
      </div>
      <div class="card-body stack decisions-body">
        ${decisionCard(pending[0], { compact: true })}
        <div class="mini-decisions">
          ${pending
            .slice(1, 4)
            .map(
              (d) => `<button class="mini-decision" data-open="decisions">
                <span class="mini-main"><strong>${d.title}</strong><small>${d.area} · ${d.impact} · by ${d.deadline}</small></span>
                <i class="risk ${d.risk === "High" ? "high" : d.risk === "Medium" ? "medium" : "low"}"><b></b></i>
                ${I("i-arrow")}
              </button>`,
            )
            .join("")}
        </div>
        ${pending.length > 4 ? `<p class="mini-more">${pending.length - 4} more waiting</p>` : ""}
      </div>
      <div class="card-foot">
        <span>Money, customers and access stop here</span>
        <button class="btn quiet sm" data-open="decisions">All decisions${I("i-arrow")}</button>
      </div>
    </aside>
  </div>

  <div class="triple">
    <section class="card">
      <div class="card-head"><div><h2>Your requests</h2><small>Handled by ${ENGINEER.name}, your engineer</small></div>
        <button class="btn quiet sm" data-dock-open="requests">Open${I("i-arrow")}</button></div>
      <div class="card-body rows">
        ${openRequests()
          .slice(0, 3)
          .map(
            (r) => `<button class="row row-button" data-request="${r.id}">
              <span class="row-main"><strong>${r.title}</strong><small>${r.id} · ${r.type} · ${r.updated}</small></span>
              ${statusChip(r.status)}
            </button>`,
          )
          .join("")}
      </div>
      <div class="card-foot"><span>Replies usually arrive within 30 minutes</span>
        <button class="btn quiet sm" data-new-request>New request${I("i-arrow")}</button></div>
    </section>

    <section class="card">
      <div class="card-head"><div><h2>Agent activity</h2><small>Running right now</small></div>
        <button class="btn quiet sm" data-dock-open="agents">Open${I("i-arrow")}</button></div>
      <div class="card-body rows">
        ${AGENTS.slice(0, 3)
          .map(
            (a) => `<button class="row row-button" data-dock-agent-row="${a.id}">
              <span class="row-main"><strong>${a.name}</strong><small>${a.scope}</small></span>
              <span class="row-spark">${sparkline(a.series, { width: 64, height: 20 })}</span>
              <span class="chip ${a.status === "live" ? "good" : ""}">${a.status === "live" ? "Running" : "Idle"}</span>
            </button>`,
          )
          .join("")}
      </div>
    </section>

    <section class="card">
      <div class="card-head"><div><h2>Where work arrives</h2><small>Conversations by channel</small></div></div>
      <div class="card-body donut-body">
        ${donut(
          [
            { label: "WhatsApp", value: 46, color: C.uv },
            { label: "Website", value: 31, color: C.uvSoft },
            { label: "Email", value: 15, color: C.mint },
            { label: "Phone", value: 8, color: C.lav },
          ],
          { size: 132, thickness: 13, centerValue: fmt.n(sum(p.points, "conversations")), centerLabel: p.label },
        )}
        <div class="donut-legend">
          ${[["WhatsApp", 46, C.uv], ["Website", 31, C.uvSoft], ["Email", 15, C.mint], ["Phone", 8, C.lav]]
            .map(([label, value, color]) => `<div class="legend-row"><i style="background:${color}"></i><span>${label}</span><b>${value}%</b></div>`)
            .join("")}
        </div>
      </div>
    </section>
  </div>`;
}

function viewDecisions() {
  const pending = state.decisions.filter((d) => d.status === "pending");
  const shown =
    state.decisionFilter === "Pending"
      ? pending
      : state.decisionFilter === "Decided"
        ? state.decisions.filter((d) => d.status !== "pending")
        : state.decisions;
  return `
  <div class="view-head">
    <div>
      <h1>Decisions</h1>
      <p>Omnia brings the judgement calls here and stops. Money, customers, stock and access.</p>
    </div>
    <div class="head-actions"><span class="chip uv">${pending.length} waiting on you</span></div>
  </div>

  <div class="filter-row">
    ${["All", "Pending", "Decided"].map((f) => `<button class="chip ${state.decisionFilter === f ? "uv" : "ghost"}" data-filter="${f}">${f}</button>`).join("")}
    <span class="filter-note">${shown.length} of ${state.decisions.length}</span>
  </div>

  <div class="decision-grid">
    ${shown.map((d) => decisionCard(d)).join("")}
  </div>

  ${shown.length === 0 ? `<p class="empty">Nothing here. Every decision has been made.</p>` : ""}`;
}

/* ----------------------------------------------------------- the desk
   Requests and agents are not dashboards. They are the relationship and the
   machinery underneath every dashboard, so they live in one panel that opens
   over whatever you are looking at and closes without losing your place. */

function openDock(view = "requests", thread = null) {
  state.dock.open = true;
  state.dock.view = view;
  state.dock.thread = thread;
  renderDock();
  const panel = document.getElementById("dock");
  // A close may still be mid-animation; drop it so it cannot hide the panel again.
  if (window.gsap) gsap.killTweensOf(panel);
  panel.style.transform = "";
  panel.style.opacity = "";
  panel.hidden = false;
  document.getElementById("dockButton")?.setAttribute("aria-expanded", String(view === "requests"));
  document.getElementById("agentsButton")?.setAttribute("aria-expanded", String(view === "agents"));
  const chipCount = document.getElementById("agentsChipCount");
  if (chipCount) chipCount.textContent = String(AGENTS.filter((a) => a.status === "live").length);
  if (window.gsap) {
    gsap.fromTo(
      document.getElementById("dock"),
      { x: 30, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.3, ease: "power3.out" },
    );
  }
}

function closeDock() {
  const dock = document.getElementById("dock");
  if (window.gsap) gsap.killTweensOf(dock);
  const done = () => {
    dock.hidden = true;
    document.getElementById("dockButton")?.setAttribute("aria-expanded", "false");
    document.getElementById("agentsButton")?.setAttribute("aria-expanded", "false");
  };
  state.dock.open = false;
  state.dock.thread = null;
  if (!window.gsap) return done();
  // Fall back to a timer so a stalled ticker (background tab) cannot leave it half-closed.
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    done();
  };
  gsap.to(dock, { x: 24, opacity: 0, duration: 0.18, onComplete: finish });
  setTimeout(finish, 320);
}

function dockRequests() {
  const waiting = state.requests.filter((r) => r.status === "Open" || r.status === "With your engineer").length;
  return `
    <div class="dock-status">
      <b class="dock-sla"><i></i>${ENGINEER.sla}</b>
      <div class="dock-status-actions">
        <button class="btn sm" data-book-call>${I("i-clock")}Call</button>
        <button class="btn primary sm" data-new-request>${I("i-plus")}New request</button>
      </div>
    </div>
    <div class="dock-section">
      <div class="dock-section-head">
        <span>${waiting ? `${waiting} in progress` : "Nothing waiting"}</span>
        <span class="dock-count">${state.requests.length} total</span>
      </div>
      <div class="dock-list">
        ${state.requests
          .map(
            (r) => `<button class="dock-row ${r.status === "Answered" ? "answered" : ""}" data-request="${r.id}">
              <span class="dock-row-top"><strong>${r.title}</strong>${statusChip(r.status)}</span>
              <span class="dock-row-meta">${r.id} · ${r.type} · ${r.updated}</span>
            </button>`,
          )
          .join("")}
      </div>
    </div>
    <p class="dock-note">Changes go to ${ENGINEER.name}. You get a reply, not another chat window to manage.</p>`;
}

function dockThread() {
  const request = state.requests.find((r) => r.id === state.dock.thread);
  if (!request) return dockRequests();
  return `
    <button class="dock-back" data-dock-back>${I("i-back")}All requests</button>
    <div class="dock-thread-head">
      <h3>${request.title}</h3>
      <span class="dock-row-meta">${request.id} · ${request.type}</span>
      ${statusChip(request.status)}
    </div>
    ${requestThread(request)}
    ${
      request.deliverables
        ? `<div class="deliverable"><h4>Delivered</h4><ul>${request.deliverables.map((d) => `<li>${I("i-check")}${d}</li>`).join("")}</ul></div>`
        : ""
    }
    <form class="reply-form" data-reply="${request.id}">
      <textarea rows="2" placeholder="Reply to Ayesha…"></textarea>
      <button class="btn primary sm" type="submit">Send</button>
    </form>`;
}

function dockAgents() {
  const agent = AGENTS.find((a) => a.id === state.agentId) || AGENTS[0];
  const live = AGENTS.filter((a) => a.status === "live").length;
  return `
    <div class="agent-panel">
      <div class="agent-banner">
        <span class="agent-banner-live"><i></i>${live} running</span>
        <p>Agents do the work. Anything with a cost, a customer or access comes to you as a decision.</p>
      </div>

      <div class="agent-cards">
        ${AGENTS.map(
          (a) => `<button class="agent-card ${a.id === agent.id ? "selected" : ""}" data-dock-agent="${a.id}">
            <span class="agent-card-avatar">${I(a.icon)}</span>
            <span class="agent-card-body">
              <span class="agent-card-top"><strong>${a.name}</strong>
                <i class="status-dot ${a.status === "idle" ? "idle" : "live"}"></i></span>
              <small>${a.scope}</small>
              <span class="agent-card-meta"><b>${fmt.n(a.stats.runs)}</b> runs · <b>${a.stats.approval}</b> raised</span>
            </span>
          </button>`,
        ).join("")}
      </div>

      <section class="agent-detail">
        <header class="agent-detail-head">
          <span class="agent-card-avatar lg">${I(agent.icon)}</span>
          <div>
            <h3>${agent.name}</h3>
            <p>${agent.scope}</p>
          </div>
          <span class="chip ${agent.status === "live" ? "good" : "ghost"}">${agent.status === "live" ? "Running" : "Idle"}</span>
        </header>

        <div class="agent-detail-stats">
          <div><span>Runs today</span><strong>${fmt.n(agent.stats.runs)}</strong></div>
          <div><span>Raised to you</span><strong>${agent.stats.approval}</strong></div>
          <div><span>Success</span><strong>${agent.stats.success}</strong></div>
        </div>

        <h4 class="agent-detail-label">Latest</h4>
        <div class="agent-thread">
          ${agent.thread
            .slice(-2)
            .map(
              (m) => `<div class="agent-msg ${m.from}">
                <span class="agent-msg-who">${m.from === "user" ? firstName() : agent.name}</span>
                <p>${m.text}</p>
                <span class="agent-msg-when">${m.meta}</span>
              </div>`,
            )
            .join("")}
        </div>

        <h4 class="agent-detail-label">Rules it works inside</h4>
        <div class="agent-rules">
          <span class="guard">${I("i-shield")}${agent.autonomy}</span>
          <span class="guard">${I("i-shield")}Cost and customer exceptions go to Decisions</span>
        </div>

        <h4 class="agent-detail-label">Tools</h4>
        <div class="agent-tools-list">
          ${agent.tools.map((t) => `<span class="tool-chip">${t}</span>`).join("")}
        </div>
      </section>
    </div>`;
}

function renderDock() {
  const body = document.getElementById("dockBody");
  if (!body) return;
  const view = state.dock.view;
  const title = document.getElementById("dockTitle");
  if (title) {
    title.innerHTML =
      view === "agents"
        ? `<div class="dock-title-copy"><strong>Agents</strong><span>${AGENTS.filter((a) => a.status === "live").length} running · working inside your rules</span></div>`
        : `<div class="dock-title-copy">${engineerAvatar("sm")}<div><strong>${ENGINEER.name}</strong><span>${ENGINEER.role}</span></div></div>`;
  }
  body.innerHTML = view === "agents" ? dockAgents() : state.dock.thread ? dockThread() : dockRequests();

  const count = state.requests.filter((r) => r.status === "Open").length;
  const badge = document.getElementById("dockBadge");
  if (badge) {
    badge.hidden = count === 0;
    badge.textContent = String(count);
  }

  body.querySelectorAll("[data-request]").forEach((el) =>
    el.addEventListener("click", () => {
      state.dock.thread = el.dataset.request;
      renderDock();
    }),
  );
  body.querySelectorAll("[data-dock-agent]").forEach((el) =>
    el.addEventListener("click", () => {
      state.agentId = el.dataset.dockAgent;
      renderDock();
    }),
  );
  body.querySelector("[data-dock-back]")?.addEventListener("click", () => {
    state.dock.thread = null;
    renderDock();
  });
  body.querySelectorAll("[data-new-request]").forEach((el) => el.addEventListener("click", () => newRequestModal()));
  body.querySelectorAll("[data-book-call]").forEach((el) => el.addEventListener("click", bookACall));
  body.querySelectorAll("[data-reply]").forEach((form) =>
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = form.querySelector("textarea").value.trim();
      if (!text) return;
      const request = state.requests.find((r) => r.id === form.dataset.reply);
      request.thread.push({ from: "client", author: "${CLIENT.people[0].name}", when: "Just now", text });
      request.updated = "just now";
      renderDock();
      toast("Reply sent to Ayesha");
    }),
  );
}

function filteredOrders() {
  return ORDERS.filter((o) => {
    const stageOk = state.stageFilter === "All" || o.stage === state.stageFilter;
    const q = state.orderQuery.toLowerCase();
    const qOk = !q || o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.city.toLowerCase().includes(q);
    return stageOk && qOk;
  });
}

function viewOrders() {
  const rows = filteredOrders();
  return `
  <div class="view-head">
    <div><h1>${DASH.orders}</h1><p>${CLIENT.pitch}</p></div>
  </div>

  <div class="split wide-left">
    <section class="card">
      <div class="card-head"><div><h2>Order flow</h2><small>Where today's orders stand</small></div>
        <span class="chip good">Running</span></div>
      <div class="card-body">${funnel([
        { label: "Received", value: 412 },
        { label: "Validated", value: 386 },
        { label: "Fulfilled", value: 338 },
        { label: "Delivered", value: 296 },
      ])}</div>
      <div class="card-foot"><span>2 orders held for approval</span>
        <button class="btn quiet sm" data-open="decisions">Review decisions${I("i-arrow")}</button></div>
    </section>
    <section class="card">
      <div class="card-head"><div><h2>Daily volume</h2><small>Orders per day</small></div></div>
      <div class="card-body">
        ${columns(
          DAYS.map((d) => ({ label: d.label, value: d.orders })),
          { width: 320, height: 168 },
        )}
      </div>
      <div class="card-foot"><span>${fmt.n(sum(DAYS, "orders"))} this week</span><span>Sample data</span></div>
    </section>
  </div>

  <section class="card">
    <div class="card-head">
      <div><h2>Orders</h2><small>${rows.length} of ${ORDERS.length}</small></div>
      <div class="table-tools">
        <button class="btn quiet sm" data-export-orders>${I("i-doc")}Export</button>
        <div class="filter-chips">
          ${["All", "Captured", "Validated", "In fulfilment", "Completed", "On hold"].map(
            (s) => `<button class="chip ${state.stageFilter === s ? "uv" : "ghost"}" data-stage="${s}">${s}</button>`,
          ).join("")}
        </div>
        <input class="table-search" id="orderSearch" type="search" placeholder="Search order or customer" value="${state.orderQuery}" />
      </div>
    </div>
    <div class="card-body">
      <table class="table">
        <thead><tr><th>Order</th><th>Customer</th><th>City</th><th>Items</th><th>Value</th><th>Age</th><th>Stage</th></tr></thead>
        <tbody>
          ${rows
            .map(
              (o) => `<tr class="row-link" data-order="${o.id}" tabindex="0">
                <td><strong>${o.id}</strong></td><td>${o.customer}</td><td class="muted">${o.city}</td>
                <td class="mono">${o.items}</td><td class="mono">${fmt.money(o.value)}</td><td class="muted">${o.age}</td>
                <td><span class="chip ${o.stage === "On hold" ? "warn" : o.stage === "Completed" ? "good" : o.stage === "Captured" ? "uv" : ""}">${o.stage}</span></td>
              </tr>`,
            )
            .join("")}
        </tbody>
      </table>
      ${rows.length === 0 ? `<p class="empty">No orders match that filter.</p>` : ""}
    </div>
  </section>`;
}

function viewInventory() {
  return `
  <div class="view-head">
    <div><h1>${DASH.inventory}</h1><p>Capacity, cover and the things that need restocking.</p></div>
    <div class="head-actions"><span class="chip warn">3 need review</span></div>
  </div>

  <div class="tile-grid three">
    <article class="tile"><div class="tile-top"><span class="tile-label">Tracked items</span><span class="tile-icon lav">${I("i-boxes")}</span></div>
      <div class="tile-value" data-count="${INVENTORY.length * 47}">${fmt.n(INVENTORY.length * 47)}</div>
      <div class="tile-foot"><span>across 5 collections</span></div></article>
    <article class="tile"><div class="tile-top"><span class="tile-label">Under a week of cover</span><span class="tile-icon">${I("i-pulse")}</span></div>
      <div class="tile-value" data-count="3">3</div>
      <div class="tile-foot"><span class="delta down">2 critical</span><span>needs a decision</span></div></article>
    <article class="tile"><div class="tile-top"><span class="tile-label">Awaiting approval</span><span class="tile-icon mint">${I("i-clock")}</span></div>
      <div class="tile-value" data-count="1">1</div>
      <div class="tile-foot"><span>purchase draft</span></div></article>
  </div>

  <section class="card">
    <div class="card-head">
      <div><h2>Stock</h2><small>Cover is days of stock at current sell-through</small></div>
      <button class="btn sm" data-send-reorder ${state.selectedStock.size ? "" : "disabled"}>Send ${state.selectedStock.size || ""} to Ayesha</button>
    </div>
    <div class="card-body">
      <table class="table">
        <thead><tr><th></th><th>Item</th><th>SKU</th><th>On hand</th><th>Cover</th><th>7-day trend</th><th>Suggested</th><th>Status</th></tr></thead>
        <tbody>
          ${INVENTORY.map(
            (row) => `<tr>
              <td><input type="checkbox" class="check" data-stock="${row.sku}" ${state.selectedStock.has(row.sku) ? "checked" : ""} aria-label="Select ${row.item}" /></td>
              <td><strong>${row.item}</strong></td><td class="muted mono">${row.sku}</td>
              <td class="mono">${row.onHand}</td>
              <td><span class="cover ${row.cover <= 4 ? "low" : ""}"><i style="width:${Math.min(100, (row.cover / 30) * 100)}%"></i></span><span class="cover-label">${row.cover}d</span></td>
              <td>${sparkline(row.trend, { width: 76, height: 22, color: row.cover <= 4 ? "#c0713a" : C.uv })}</td>
              <td class="mono">${row.suggested ? `${row.suggested} units` : "—"}</td>
              <td><span class="chip ${row.status === "Critical" ? "warn" : row.status === "Review" ? "uv" : "good"}">${row.status}</span></td>
            </tr>`,
          ).join("")}
        </tbody>
      </table>
    </div>
    <div class="card-foot"><span>Nothing is purchased automatically</span><span>Last refresh 6 minutes ago</span></div>
  </section>`;
}

function viewSavings() {
  const months = CLIENT.savings.months.map(([name, value]) => ({
    label: name.slice(0, 3),
    value,
  }));
  return `
  <div class="view-head">
    <div><h1>Savings Report</h1><p>What Omnia recovered for Meridian this quarter.</p></div>
    <div class="head-actions"><button class="btn" data-export-savings>${I("i-doc")}Export CSV</button></div>
  </div>

  <section class="savings-hero">
    <div>
      <span class="kicker">Quarter to date</span>
      <strong>${CLIENT.currency} <span class="hero-count" data-count="${CLIENT.savings.total}">${fmt.money(CLIENT.savings.total)}</span></strong>
      <p>Duplicate tools retired, manual hours returned and fewer fulfilment errors — measured against the three months before Omnia.</p>
      <div class="hero-pills">
        <span class="hero-pill">${I("i-chart")}${CLIENT.currency} ${fmt.money(CLIENT.savings.monthly)} / month</span>
        <span class="hero-pill">${I("i-clock")}${CLIENT.savings.hours} hours</span>
        <span class="hero-pill">${I("i-shield")}${CLIENT.savings.errors} errors avoided</span>
      </div>
    </div>
    <div class="savings-badge">${I("i-chart")}</div>
  </section>

  <div class="split">
    <section class="card">
      <div class="card-head"><div><h2>Monthly saving</h2><small>${CLIENT.currency}, quarter to date</small></div></div>
      <div class="card-body">${columns(months, { width: 420, height: 176 })}</div>
      <div class="card-foot"><span>Reported to finance monthly</span><span>Prepared by Ayesha</span></div>
    </section>
    <section class="card">
      <div class="card-head"><div><h2>Where it comes from</h2><small>Quarter to date</small></div></div>
      <div class="card-body bars">
        ${CLIENT.savings.breakdown
          .map(
            ([label, value, width]) => `<div class="bar-row">
              <span class="label">${label}</span>
              <span class="track"><i style="width:${width}%"></i></span>
              <span class="amount">${fmt.money(value)}</span>
            </div>`,
          )
          .join("")}
      </div>
    </section>
  </div>

  <section class="card">
    <div class="card-head"><div><h2>Month by month</h2><small>Savings, hours and errors</small></div></div>
    <div class="card-body">
      <table class="table">
        <thead><tr><th>Month</th><th>Saved</th><th>Hours returned</th><th>Errors avoided</th><th>Trend</th></tr></thead>
        <tbody>
          ${CLIENT.savings.months
            .map(
              ([month, value, hours, errors]) => `<tr>
                <td><strong>${month}</strong></td><td class="mono">${fmt.money(value)}</td>
                <td class="mono">${hours}</td><td class="mono">${errors}</td>
                <td>${sparkline([value * 0.78, value * 0.86, value * 0.92, value], { width: 76, height: 22 })}</td>
              </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  </section>`;
}

/* --------------------------------------------------------------- manage OS */

const OS_NAV = [
  ["overview", "Overview", "i-grid"],
  ["people", "People & access", "i-team"],
  ["systems", "Connected systems", "i-link"],
  ["modules", "Modules", "i-layers"],
  ["agents", "Agents", "i-agent"],
  ["activity", "Activity log", "i-doc"],
  ["plan", "Plan & usage", "i-card"],
];

function osBody() {
  const view = state.osView;

  if (view === "people")
    return `<section class="card">
      <div class="card-head"><div><h2>People & access</h2><small>4 of 12 seats · changes go through Ayesha</small></div>
        <button class="btn sm" data-invite>${I("i-plus")}Invite</button></div>
      <div class="card-body people-grid">
        ${PEOPLE.map(
          (p) => `<article class="person-card">
            <span class="mini-avatar lg">${p.initials}</span>
            <div><strong>${p.name}</strong><small>${p.role}</small></div>
            <span class="chip ghost">${p.access}</span>
            <span class="person-last">${p.last}</span>
          </article>`,
        ).join("")}
      </div>
    </section>`;

  if (view === "systems")
    return `<section class="card">
      <div class="card-head"><div><h2>Connected systems</h2><small>Monitored and maintained by Omnia</small></div>
        <button class="btn sm" data-request="integration">${I("i-plus")}Request a connection</button></div>
      <div class="card-body system-grid">
        ${SYSTEMS.map(
          (s) => `<article class="system-card ${s.state === "Degraded" ? "warn" : ""}">
            <span class="tile-icon">${I(s.icon)}</span>
            <div class="system-copy"><strong>${s.name}</strong><small>${s.meta} · ${s.sync}</small></div>
            <span class="chip ${s.state === "Degraded" ? "warn" : s.state === "Connected" ? "ghost" : "good"}">${s.state}</span>
            <button class="btn quiet sm" data-test="${s.name}">Test</button>
          </article>`,
        ).join("")}
      </div>
      <div class="card-foot"><span>We add and maintain connections. Ask and it goes on the list.</span></div>
    </section>`;

  if (view === "modules")
    return `<section class="card">
      <div class="card-head"><div><h2>Modules</h2><small>What your workspace can do today</small></div>
        <button class="btn sm" data-request="module">${I("i-plus")}Request a module</button></div>
      <div class="card-body module-grid">
        ${MODULES.map(
          (m) => `<article class="module-card ${m.on ? "" : "off"}">
            <span class="tile-icon ${m.on ? "" : "ink"}">${I(m.icon)}</span>
            <div><strong>${m.name}</strong><p>${m.meta}</p></div>
            <button class="toggle" aria-pressed="${m.on}" aria-label="Toggle ${m.name}" data-module="${m.name}"></button>
          </article>`,
        ).join("")}
      </div>
      <div class="card-foot"><span>We build these with you. Turning one on is our job, not yours.</span></div>
    </section>`;

  if (view === "agents")
    return `<section class="card">
      <div class="card-head"><div><h2>Agents</h2><small>What each one may decide alone</small></div>
        </div>
      <div class="card-body agent-settings">
        ${AGENTS.map(
          (a) => `<article class="agent-setting">
            <span class="agent-avatar">${I(a.icon)}</span>
            <div><strong>${a.name}</strong><p>${a.scope}</p>
              <div class="guardrails">${["Approval on money", a.autonomy].map((g) => `<span class="guard">${I("i-shield")}${g}</span>`).join("")}</div>
            </div>
            <button class="toggle" aria-pressed="${a.status === "live"}" aria-label="Toggle ${a.name}" data-module="${a.name}"></button>
          </article>`,
        ).join("")}
      </div>
      <div class="card-foot"><span>Every consequential action still lands in Decisions</span></div>
    </section>`;

  if (view === "activity")
    return `<section class="card">
      <div class="card-head"><div><h2>Activity log</h2><small>Everything Omnia did, newest first</small></div>
        <div class="filter-chips"><button class="chip uv">All</button><button class="chip ghost">Done</button><button class="chip ghost">Waiting</button></div></div>
      <div class="card-body">
        <ol class="log">
          ${ACTIVITY.map(
            (a) => `<li><span class="log-time">${a.time}</span><i class="${a.result === "Waiting" ? "warn" : ""}"></i>
              <div><strong>${a.text}</strong><span>${a.who}</span></div>
              <span class="chip ${a.result === "Done" ? "good" : "warn"}">${a.result}</span></li>`,
          ).join("")}
        </ol>
      </div>
    </section>`;

  if (view === "plan")
    return `<section class="card">
      <div class="card-head"><div><h2>Plan & usage</h2><small>Managed for ${CLIENT.name}</small></div>
        <span class="chip uv">Omnia managed</span></div>
      <div class="card-body usage">
        ${[["Workspace activity", 62, ""], ["Agent runs", 41, "mint"], ["Connected systems", 75, ""]]
          .map(
            ([label, pct, tone]) => `<div class="usage-row">
              <span>${label}<b>${pct}%</b></span>
              <div class="track ${tone}"><i data-usage="${pct}"></i></div>
            </div>`,
          )
          .join("")}
      </div>
      <div class="card-body facts">
        <div class="fact"><span>Plan</span><strong>Omnia Workspace</strong></div>
        <div class="fact"><span>Seats</span><strong>4 of 12</strong></div>
        <div class="fact"><span>Billing</span><strong>Monthly · ${CLIENT.currency} 9,800</strong></div>
        <div class="fact"><span>Support</span><strong>Named engineer</strong></div>
      </div>
      <div class="card-foot"><span>Plan changes go through Ayesha</span></div>
    </section>
    <section class="card">
      <div class="card-head"><div><h2>Invoices</h2><small>Last three months</small></div></div>
      <div class="card-body rows">
        ${[["INV-2026-010", "October", `${CLIENT.currency} 9,800`], ["INV-2026-009", "September", `${CLIENT.currency} 9,800`], ["INV-2026-008", "August", `${CLIENT.currency} 9,800`]]
          .map(
            ([id, month, amount]) => `<div class="row row-static">
              <span class="row-main"><strong>${id}</strong><small>${month}</small></span>
              <span class="mono">${amount}</span><span class="chip good">Paid</span>
            </div>`,
          )
          .join("")}
      </div>
    </section>`;

  return `<section class="card">
    <div class="card-head"><div><h2>Workspace overview</h2><small>Configured and maintained by Omnia</small></div>
      <span class="chip good">Healthy</span></div>
    <div class="card-body stat-row">
      ${[["Uptime", "99.98%", "last 30 days"], ["Runs today", "684", "4 agents"], ["Decisions", String(pendingDecisions().length), "waiting on you"]]
        .map(
          ([label, value, note]) => `<div class="stat-block"><span>${label}</span><strong>${value}</strong><small>${note}</small></div>`,
        )
        .join("")}
    </div>
    <div class="card-body facts">
      <div class="fact"><span>Workspace</span><strong>${CLIENT.name}</strong></div>
      <div class="fact"><span>Region</span><strong>United Arab Emirates</strong></div>
      <div class="fact"><span>People</span><strong>4 of 12 seats</strong></div>
      <div class="fact"><span>Connected systems</span><strong>6</strong></div>
      <div class="fact"><span>Active solutions</span><strong>4</strong></div>
      <div class="fact"><span>Your engineer</span><strong>${ENGINEER.name}</strong></div>
    </div>
    <div class="card-foot"><span>Anything you need changed, ask Ayesha</span>
      <button class="btn quiet sm" data-new-request>Request a change${I("i-arrow")}</button></div>
  </section>
  <section class="card">
    <div class="card-head"><div><h2>What Omnia maintains</h2><small>No configuration is left to you alone</small></div></div>
    <div class="card-body rows">
      ${[["Connections", "Monitoring, retries and credential rotation", "Handled"], ["Agent behaviour", "Instructions, tools and approval rules", "Handled"], ["Changes", "New dashboards and workflows, scoped with you", "On request"]]
        .map(
          ([name, meta, status]) => `<div class="row row-static">
            <span class="row-main"><strong>${name}</strong><small>${meta}</small></span>
            <span class="chip ${status === "Handled" ? "good" : "ghost"}">${status}</span>
          </div>`,
        )
        .join("")}
    </div>
  </section>`;
}

function viewOs() {
  return `
  <div class="view-head">
    <div><h1>Manage Omnia OS</h1><p>People, systems, modules and the agents that run them.</p></div>
    <div class="head-actions"><button class="btn" data-back>${I("i-arrow")}Back to workspace</button></div>
  </div>
  <div class="os">
    <nav class="os-rail" aria-label="Omnia OS sections">
      <div class="os-rail-label">Omnia OS</div>
      <div class="os-nav">
        ${OS_NAV.map(
          ([id, label, icon]) => `<button data-os="${id}" ${state.osView === id ? 'aria-current="true"' : ""}>${I(icon)}${label}</button>`,
        ).join("")}
      </div>
      <div class="os-rail-foot">Maintained by your Omnia team. Changes are applied with you, not to you.</div>
    </nav>
    <div class="os-body">${osBody()}</div>
  </div>`;
}

/* ----------------------------------------------------------------- render */

function renderStage() {
  const stage = document.getElementById("stage");
  stage.innerHTML = state.os
    ? viewOs()
    : state.active === "general"
      ? viewGeneral()
      : state.active === "decisions"
        ? viewDecisions()
        : state.active === "orders"
              ? viewOrders()
              : state.active === "inventory"
                ? viewInventory()
                : state.active === "savings"
                  ? viewSavings()
                  : viewGeneral();
  document.getElementById("topbar").classList.toggle("os-mode", Boolean(state.os));
  wireStage();
  renderMainChart();
  animateStage();
}

function decide(id, status) {
  const decision = state.decisions.find((d) => d.id === id);
  if (!decision || decision.status !== "pending") return;
  decision.status = status;
  decision.decidedAt = Date.now();
  ACTIVITY.unshift({
    time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    who: "You",
    text: `${status === "approved" ? "Approved" : "Declined"}: ${decision.title}`,
    result: "Done",
  });
  state.notifications = state.notifications.map((n) => (n.ref === id ? { ...n, read: true } : n));
  updateBadge();
  renderTabs();
  renderStage();
  toast(
    status === "approved"
      ? `${decision.id} approved · ${decision.agent} is carrying it out`
      : `${decision.id} declined · ${decision.agent} will stop work`,
  );
}

function wireStage() {
  const stage = document.getElementById("stage");

  stage.querySelectorAll("[data-tab]").forEach((el) => el.addEventListener("click", () => openTab(el.dataset.tab)));
  stage.querySelectorAll("[data-open]").forEach((el) => el.addEventListener("click", () => openTab(el.dataset.open)));
  stage.querySelectorAll("[data-new-request]").forEach((el) => el.addEventListener("click", () => newRequestModal()));
  stage.querySelectorAll("[data-request]").forEach((el) =>
    el.addEventListener("click", () => newRequestModal(el.dataset.request)),
  );
  stage.querySelectorAll("[data-book-call]").forEach((el) => el.addEventListener("click", bookACall));
  stage.querySelectorAll("[data-agent]").forEach((el) =>
    el.addEventListener("click", () => {
      state.agentId = el.dataset.agent;
      openDock("agents", null);
    }),
  );
  stage.querySelectorAll("[data-dock-open]").forEach((el) =>
    el.addEventListener("click", () => openDock(el.dataset.dockOpen)),
  );
  stage.querySelectorAll("[data-dock-agent-row]").forEach((el) =>
    el.addEventListener("click", () => {
      state.agentId = el.dataset.dockAgentRow;
      openDock("agents");
    }),
  );
  stage.querySelectorAll("[data-os-open]").forEach((el) =>
    el.addEventListener("click", () => {
      state.os = true;
      state.osView = el.dataset.osOpen;
      renderStage();
    }),
  );
  stage.querySelectorAll("[data-period]").forEach((el) =>
    el.addEventListener("click", () => {
      state.period = el.dataset.period;
      renderStage();
    }),
  );
  stage.querySelectorAll("[data-filter]").forEach((el) =>
    el.addEventListener("click", () => {
      state.decisionFilter = el.dataset.filter;
      renderStage();
    }),
  );
  stage.querySelectorAll("[data-approve]").forEach((el) => el.addEventListener("click", () => decide(el.dataset.approve, "approved")));
  stage.querySelectorAll("[data-decline]").forEach((el) => el.addEventListener("click", () => decide(el.dataset.decline, "declined")));
  stage.querySelectorAll("[data-ask]").forEach((el) =>
    el.addEventListener("click", () => {
      const decision = state.decisions.find((d) => d.id === el.dataset.ask);
      const agent = AGENTS.find((a) => a.name === decision.agent);
      if (agent) state.agentId = agent.id;
      openDock("agents");
    }),
  );

  stage.querySelectorAll("[data-request]").forEach((el) =>
    el.addEventListener("click", () => openDock("requests", el.dataset.request)),
  );
  stage.querySelectorAll("[data-export-orders]").forEach((el) =>
    el.addEventListener("click", () =>
      csv("meridian-orders.csv", [["Order", "Customer", "City", "Items", "Value", "Stage"], ...ORDERS.map((o) => [o.id, o.customer, o.city, o.items, o.value, o.stage])]),
    ),
  );
  stage.querySelectorAll("[data-export-savings]").forEach((el) =>
    el.addEventListener("click", () =>
      csv("meridian-savings.csv", [["Month", "Saved", "Hours", "Errors"], ["August", 11900, 52, 9], ["September", 13400, 60, 11], ["October", 15900, 75, 14]]),
    ),
  );
  stage.querySelectorAll("[data-send-reorder]").forEach((el) =>
    el.addEventListener("click", () => {
      state.selectedStock.clear();
      renderStage();
      toast("Sent to Ayesha as a request");
    }),
  );
  stage.querySelectorAll("[data-stock]").forEach((box) =>
    box.addEventListener("change", () => {
      if (box.checked) state.selectedStock.add(box.dataset.stock);
      else state.selectedStock.delete(box.dataset.stock);
      const button = stage.querySelector("[data-send-reorder]");
      if (button) {
        button.disabled = state.selectedStock.size === 0;
        button.textContent = state.selectedStock.size ? `Send ${state.selectedStock.size} to Ayesha` : "Send to Ayesha";
      }
    }),
  );
  stage.querySelectorAll("[data-stage]").forEach((el) =>
    el.addEventListener("click", () => {
      state.stageFilter = el.dataset.stage;
      renderStage();
    }),
  );
  const search = document.getElementById("orderSearch");
  if (search)
    search.addEventListener("input", () => {
      state.orderQuery = search.value;
      const body = search.closest(".card").querySelector("tbody");
      body.innerHTML = filteredOrders()
        .map(
          (o) => `<tr class="row-link" data-order="${o.id}" tabindex="0">
            <td><strong>${o.id}</strong></td><td>${o.customer}</td><td class="muted">${o.city}</td>
            <td class="mono">${o.items}</td><td class="mono">${fmt.money(o.value)}</td><td class="muted">${o.age}</td>
            <td><span class="chip ${o.stage === "On hold" ? "warn" : o.stage === "Completed" ? "good" : o.stage === "Captured" ? "uv" : ""}">${o.stage}</span></td></tr>`,
        )
        .join("");
      body.querySelectorAll("[data-order]").forEach((row) => row.addEventListener("click", () => openOrder(row.dataset.order)));
    });
  stage.querySelectorAll("[data-order]").forEach((row) => {
    const open = () => openOrder(row.dataset.order);
    row.addEventListener("click", open);
    row.addEventListener("keydown", (e) => e.key === "Enter" && open());
  });
  stage.querySelectorAll("[data-test]").forEach((button) =>
    button.addEventListener("click", () => {
      const name = button.dataset.test;
      button.disabled = true;
      button.textContent = "Testing…";
      setTimeout(() => {
        button.disabled = false;
        button.textContent = "Test";
        toast(`${name} responded in 240ms`);
      }, 900);
    }),
  );
  stage.querySelectorAll("[data-module]").forEach((toggle) =>
    toggle.addEventListener("click", () => {
      const next = toggle.getAttribute("aria-pressed") !== "true";
      toggle.setAttribute("aria-pressed", String(next));
      toast(`${toggle.dataset.module} ${next ? "enabled" : "paused"} for the demo`);
    }),
  );
  stage.querySelectorAll("[data-invite]").forEach((el) =>
    el.addEventListener("click", () => {
      openModal(`
        <div class="modal-head"><div><h2>Invite someone</h2><p>Access is applied by your Omnia team.</p></div>
          <button class="icon-button" data-close-modal aria-label="Close">${I("i-x")}</button></div>
        <div class="modal-body"><form class="request-form" id="inviteForm">
          <label>Email<input type="email" required placeholder="name@meridian.ae" /></label>
          <label>Role<select><option>Operations</option><option>Finance</option><option>Warehouse</option></select></label>
          <div class="modal-actions"><button class="btn primary" type="submit">Send invite</button></div>
        </form></div>`);
      document.getElementById("inviteForm").addEventListener("submit", (event) => {
        event.preventDefault();
        closeModal();
        toast("Invite queued — Ayesha will confirm access");
      });
    }),
  );
  stage.querySelectorAll("[data-os]").forEach((el) =>
    el.addEventListener("click", () => {
      state.osView = el.dataset.os;
      renderStage();
    }),
  );
  stage.querySelectorAll("[data-back]").forEach((el) =>
    el.addEventListener("click", () => {
      state.os = false;
      renderTabs();
      renderStage();
    }),
  );

  stage.querySelectorAll(".seg button:not([data-period])").forEach((el) =>
    el.addEventListener("click", () => {
      el.parentElement.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === el)));
      toast("Showing sample data for that period.");
    }),
  );

  wireChart();

  const composer = document.getElementById("composer");
  if (composer)
    composer.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = document.getElementById("composerInput");
      const text = input.value.trim();
      if (!text) return;
      const log = document.getElementById("chatLog");
      const agent = AGENTS.find((a) => a.id === state.agentId);
      log.insertAdjacentHTML("beforeend", `<div class="msg user"><div class="bubble">${text}<div class="msg-meta">${CLIENT.people[0].name} · now</div></div></div>`);
      input.value = "";
      const typing = document.createElement("div");
      typing.className = "msg agent typing";
      typing.innerHTML = `<div class="bubble"><span class="dots"><i></i><i></i><i></i></span></div>`;
      log.appendChild(typing);
      log.scrollTop = log.scrollHeight;
      setTimeout(() => {
        typing.remove();
        log.insertAdjacentHTML(
          "beforeend",
          `<div class="msg agent"><div class="bubble">For changes I'd raise it with Ayesha — she owns anything that alters the workspace. Ask me about the work itself and I'll show you what I have.</div><div class="msg-meta">${agent.name} · now</div></div>`,
        );
        log.scrollTop = log.scrollHeight;
      }, 900);
    });
}

function openOrder(id) {
  const order = ORDERS.find((o) => o.id === id);
  if (!order) return;
  openDrawer(
    order.id,
    `${order.customer} · ${order.city} · ${order.channel}`,
    `<div class="drawer-facts">
      <div><span>Value</span><strong>${CLIENT.currency} ${fmt.money(order.value)}</strong></div>
      <div><span>Items</span><strong>${order.items}</strong></div>
      <div><span>Age</span><strong>${order.age}</strong></div>
      <div><span>Stage</span><strong>${order.stage}</strong></div>
    </div>
    <h4 class="drawer-title">Timeline</h4>
    <ol class="timeline">
      ${[
        ["Order captured", `${order.channel} · ${order.age} ago`],
        ["Payment authorised", "Stripe · 1 charge"],
        ["Stock reserved", order.stage === "On hold" ? "Held at warehouse" : "Warehouse API"],
        ["Fulfilment", order.stage === "Completed" ? "Delivered" : order.stage === "On hold" ? "Paused — waiting on a decision" : "Queued"],
      ]
        .map(
          ([label, meta], i) => `<li class="${i === 3 && order.stage === "On hold" ? "warn" : ""}"><i></i><div><strong>${label}</strong><span>${meta}</span></div></li>`,
        )
        .join("")}
    </ol>
    <div class="drawer-actions">
      <button class="btn primary sm" data-order-release>Release order</button>
      <button class="btn sm" data-order-message>Message customer</button>
    </div>`,
  );
  document.querySelector("[data-order-release]")?.addEventListener("click", () => {
    closeDrawer();
    toast("Order released · fulfilment notified");
  });
  document.querySelector("[data-order-message]")?.addEventListener("click", () => {
    closeDrawer();
    toast("Draft message queued for Jordan to review");
  });
}

function wireDrawer() {
  const drawer = document.getElementById("drawer");
  drawer.querySelectorAll("[data-reply]").forEach((form) =>
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = form.querySelector("textarea").value.trim();
      if (!text) return;
      closeDrawer();
      toast("Reply sent to Ayesha");
    }),
  );
  document.querySelectorAll("[data-slot]").forEach((button) =>
    button.addEventListener("click", () => {
      closeModal();
      toast(`Requested ${button.dataset.slot}`);
    }),
  );
  document.querySelectorAll("[data-book-call]").forEach((button) => button.addEventListener("click", bookACall));
}

function renderMainChart() {
  const host = document.getElementById("mainChart");
  if (!host) return;
  const p = period();
  const height = Math.max(200, Math.min(420, Math.round(host.clientHeight || 260)));
  host.innerHTML = `${lineChart({
    data: p.points.map((d) => ({ label: d.label, value: d.conversations, bar: d.orders })),
    height,
    unit: "",
  })}<div class="chart-tip" id="chartTip" hidden></div>`;
  wireChart();
}

function wireChart() {
  const wrap = document.getElementById("mainChart");
  if (!wrap) return;
  const tip = document.getElementById("chartTip");
  const line = wrap.querySelector(".line");
  const cursor = wrap.querySelector(".cursor");
  wrap.querySelectorAll("[data-hit]").forEach((hit) => {
    const show = () => {
      const box = hit.getBoundingClientRect();
      const host = wrap.getBoundingClientRect();
      tip.hidden = false;
      tip.innerHTML = `<strong>${hit.dataset.value}</strong><span>${hit.dataset.label}${hit.dataset.barlabel ? ` · ${hit.dataset.barlabel}` : ""}</span>`;
      tip.style.left = `${box.left - host.left + box.width / 2}px`;
      tip.style.top = `${box.top - host.top + 6}px`;
      if (line && window.gsap && line.getPointAtLength) {
        const len = (Number(hit.getAttribute("x")) - 46) / Math.max(1, wrap.clientWidth - 58) * line.getTotalLength();
        const pt = line.getPointAtLength(Math.max(0, Math.min(line.getTotalLength(), len)));
        if (cursor) {
          cursor.setAttribute("opacity", "1");
          cursor.querySelector("line").setAttribute("x1", 46 + pt.x);
          cursor.querySelector("line").setAttribute("x2", 46 + pt.x);
        }
      }
    };
    const hide = () => {
      tip.hidden = true;
      cursor?.setAttribute("opacity", "0");
    };
    hit.addEventListener("mouseenter", show);
    hit.addEventListener("mouseleave", hide);
  });
}

/* ------------------------------------------------------------- animation */

function animateStage() {
  const stage = document.getElementById("stage");
  const blocks = [...stage.querySelectorAll(".view-head, .tile, .card, .decision, .engineer-card, .savings-hero, .agents > *, .os > *")];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const grow = (el) => {
    const h = Number(el.dataset.h);
    const base = Number(el.dataset.base);
    el.setAttribute("y", base + h);
    el.setAttribute("height", h);
  };
  stage.querySelectorAll("[data-bar][data-h]").forEach(grow);

  if (!window.gsap || reduced) return;

  gsap.fromTo(blocks, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.44, stagger: 0.03, ease: "power3.out", overwrite: true });

  const line = stage.querySelector(".chart .line");
  if (line && line.getTotalLength) {
    const len = line.getTotalLength();
    gsap.fromTo(line, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" });
  }
  stage.querySelectorAll("[data-bar][data-h]").forEach((bar, i) => {
    const h = Number(bar.dataset.h);
    const base = Number(bar.dataset.base);
    gsap.fromTo(bar, { attr: { y: base, height: 0 } }, { attr: { y: base - h, height: h }, duration: 0.5, delay: 0.15 + i * 0.035, ease: "power2.out" });
  });
  stage.querySelectorAll("[data-funnel]").forEach((bar, i) => {
    gsap.fromTo(bar, { width: "0%" }, { width: `${bar.dataset.funnel}%`, duration: 0.65, delay: 0.1 + i * 0.07, ease: "power2.out" });
  });
  stage.querySelectorAll("[data-usage]").forEach((bar, i) => {
    gsap.fromTo(bar, { width: "0%" }, { width: `${bar.dataset.usage}%`, duration: 0.65, delay: 0.12 + i * 0.07, ease: "power2.out" });
  });
  stage.querySelectorAll(".donut .seg").forEach((seg) => {
    gsap.fromTo(seg, { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.05, ease: "power2.out" });
  });
  stage.querySelectorAll(".bar-row .track i").forEach((bar, i) => {
    const width = bar.style.width;
    gsap.fromTo(bar, { width: "0%" }, { width, duration: 0.65, delay: 0.1 + i * 0.05, ease: "power2.out" });
  });
  stage.querySelectorAll("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count);
    const suffix = el.querySelector("small")?.outerHTML || "";
    const obj = { v: 0 };
    gsap.to(obj, {
      v: target,
      duration: 0.85,
      ease: "power2.out",
      onUpdate: () => {
        el.innerHTML = `${fmt.n(Math.round(obj.v))}${suffix}`;
      },
    });
  });
}

/* ---------------------------------------------------------------- chrome */

function renderNotifications() {
  openDrawer(
    "Notifications",
    unread() ? `${unread()} unread` : "All caught up",
    `<div class="notify-list">${state.notifications
      .map(
        (n) => `<button class="notify-item ${n.read ? "read" : ""}" data-notify="${n.id}">
          <i class="${n.kind === "decision" ? "warn" : n.kind === "request" ? "uv" : ""}"></i>
          <span><strong>${n.title}</strong><small>${n.meta}</small></span>
          ${n.read ? "" : `<b class="dot-unread"></b>`}
        </button>`,
      )
      .join("")}</div>
    <button class="btn sm" data-mark-read ${unread() ? "" : "disabled"}>Mark all read</button>`,
  );
  document.querySelectorAll("[data-notify]").forEach((el) =>
    el.addEventListener("click", () => {
      const n = state.notifications.find((x) => x.id === el.dataset.notify);
      if (!n) return;
      n.read = true;
      updateBadge();
      closeDrawer();
      if (n.kind === "decision") {
        const decision = state.decisions.find((d) => d.id === n.ref);
        state.decisionFilter = decision && decision.status === "pending" ? "Pending" : "All";
        openTab("decisions");
      } else if (n.kind === "request") {
        openDock("requests", n.ref);
      } else {
        state.os = true;
        state.osView = "systems";
        renderStage();
      }
    }),
  );
  document.querySelector("[data-mark-read]")?.addEventListener("click", () => {
    state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
    updateBadge();
    closeDrawer();
    toast("Marked all as read");
  });
}

function init() {
  document.title = `${CLIENT.name} — Omnia workspace`;
  const engineerName = document.querySelector(".pill-person-copy strong");
  if (engineerName) engineerName.textContent = CLIENT.engineer.name;
  const admin = CLIENT.people[0];
  const accountName = document.querySelector("#accountMenu .menu-head strong");
  if (accountName) accountName.textContent = admin.name;
  const avatar = document.querySelector(".pill-account .avatar");
  if (avatar) avatar.textContent = admin.initials;
  const pillAccount = document.getElementById("accountButton");
  if (pillAccount) pillAccount.setAttribute("aria-label", admin.name);
  const wsName = document.querySelector('#accountMenu [data-action="workspace"] span:nth-child(2)');
  if (wsName) wsName.textContent = CLIENT.name;
  const menuHead = document.querySelector("#accountMenu .menu-head span");
  if (menuHead) menuHead.textContent = `Workspace admin · ${CLIENT.name}`;
  document.getElementById("dockButton")?.setAttribute("aria-label", `Your engineer, ${CLIENT.engineer.name}`);
  restoreTabOrder();
  renderTabs();
  setupTabDrag();
  renderStage();
  updateBadge();

  const accountButton = document.getElementById("accountButton");
  const accountMenu = document.getElementById("accountMenu");
  accountButton.addEventListener("click", () => {
    const open = accountMenu.hidden;
    accountMenu.hidden = !open;
    accountButton.setAttribute("aria-expanded", String(!open));
  });
  accountMenu.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (!action) return;
    accountMenu.hidden = true;
    accountButton.setAttribute("aria-expanded", "false");
    if (action === "manage-os" || action === "people") {
      state.os = true;
      state.osView = action === "people" ? "people" : "overview";
      renderStage();
    }
    if (action === "requests") openDock("requests");
  });

  document.querySelector('[data-action="workspace"]').addEventListener("click", () =>
    openModal(`
      <div class="modal-head"><div><h2>${CLIENT.name}</h2><p>${CLIENT.industry} · ${CLIENT.region} · live since ${CLIENT.since}</p></div>
        <button class="icon-button" data-close-modal aria-label="Close">${I("i-x")}</button></div>
      <div class="modal-body"><div class="drawer-facts">
        <div><span>Region</span><strong>United Arab Emirates</strong></div>
        <div><span>Systems</span><strong>${SYSTEMS.length} connected</strong></div>
        <div><span>Agents</span><strong>${AGENTS.length} configured</strong></div>
        <div><span>Engineer</span><strong>${ENGINEER.name}</strong></div>
      </div></div>`),
  );
  document.querySelector('[data-action="notify"]').addEventListener("click", renderNotifications);

  const agentsButton = document.getElementById("agentsButton");
  agentsButton.addEventListener("click", () => {
    if (state.dock.open && state.dock.view === "agents") return closeDock();
    state.dock.thread = null;
    openDock("agents");
  });

  const dockButton = document.getElementById("dockButton");
  dockButton.addEventListener("click", () => {
    if (state.dock.open && state.dock.view === "requests") return closeDock();
    state.dock.thread = null;
    openDock("requests");
  });
  document.querySelector("[data-dock-close]").addEventListener("click", closeDock);

  // compact bar hides on scroll down, returns on scroll up
  let lastY = window.scrollY;
  const bar = document.getElementById("topbar");
  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      const down = y > lastY + 6;
      const up = y < lastY - 6;
      if (down && y > 80) {
        bar.classList.add("tucked");
        document.body.classList.add("bar-hidden");
      } else if (up || y < 40) {
        bar.classList.remove("tucked");
        document.body.classList.remove("bar-hidden");
      }
      lastY = y;
    },
    { passive: true },
  );

  // palette
  const backdrop = document.getElementById("paletteBackdrop");
  const input = document.getElementById("paletteInput");
  const results = document.getElementById("paletteResults");
  const items = [
    ["General", "Overview", "i-grid", () => openTab("general")],
    ["Decisions", "Waiting on you", "i-shield", () => openTab("decisions")],
    ["Ayesha", "Your engineer · requests", "i-ticket", () => openDock("requests")],
    ["New request", "Ask Ayesha for a change", "i-plus", newRequestModal],
    ["Agents", "What is running", "i-agent", () => openDock("agents")],
    ["Order Operations", "Orders", "i-bag", () => openTab("orders")],
    ["Inventory Control", "Stock", "i-boxes", () => openTab("inventory")],
    ["Savings Report", "Cost recovered", "i-chart", () => openTab("savings")],
    ["Manage Omnia OS", "Settings", "i-gear", () => { state.os = true; state.osView = "overview"; renderStage(); }],
  ];
  let activeIndex = 0;

  function renderResults(query = "") {
    const q = query.toLowerCase();
    const matches = items.filter(([label, meta]) => label.toLowerCase().includes(q) || meta.toLowerCase().includes(q));
    activeIndex = 0;
    results.innerHTML = matches
      .map(
        ([label, meta, icon], index) =>
          `<button class="palette-item ${index === 0 ? "active" : ""}" data-index="${items.indexOf(matches[index])}">
            ${I(icon)}<span>${label}</span><small>${meta}</small></button>`,
      )
      .join("");
    results.querySelectorAll(".palette-item").forEach((button) =>
      button.addEventListener("click", () => {
        closePalette();
        items[Number(button.dataset.index)][3]();
      }),
    );
  }
  function openPalette() {
    backdrop.hidden = false;
    input.value = "";
    renderResults("");
    setTimeout(() => input.focus(), 20);
  }
  function closePalette() {
    backdrop.hidden = true;
  }

  document.querySelector('[data-action="search"]').addEventListener("click", openPalette);
  input.addEventListener("input", () => renderResults(input.value));
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) closePalette();
  });
  document.getElementById("drawerBackdrop").addEventListener("click", closeDrawer);
  document.getElementById("modalBackdrop").addEventListener("click", (event) => {
    if (event.target.id === "modalBackdrop") closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openPalette();
    }
    if (event.key === "Escape") {
      closePalette();
      if (state.dock.open) closeDock();
      closeModal();
      closeDrawer();
      accountMenu.hidden = true;
      accountButton.setAttribute("aria-expanded", "false");
    }
    if (!backdrop.hidden && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      const all = [...results.querySelectorAll(".palette-item")];
      if (!all.length) return;
      event.preventDefault();
      activeIndex = (activeIndex + (event.key === "ArrowDown" ? 1 : -1) + all.length) % all.length;
      all.forEach((el, i) => el.classList.toggle("active", i === activeIndex));
    }
    if (!backdrop.hidden && event.key === "Enter") results.querySelectorAll(".palette-item")[activeIndex]?.click();
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".account-wrap")) {
      accountMenu.hidden = true;
      accountButton.setAttribute("aria-expanded", "false");
    }
  });

  document.getElementById("tabs").addEventListener("keydown", (event) => {
    if (!["ArrowRight", "ArrowLeft"].includes(event.key)) return;
    if (event.altKey) {
      const focused = event.target.closest("[data-tab]");
      if (focused) {
        event.preventDefault();
        moveTab(focused.dataset.tab, event.key === "ArrowRight" ? 1 : -1);
        return;
      }
    }
    const index = state.tabs.findIndex((t) => t.id === state.active);
    const next = (index + (event.key === "ArrowRight" ? 1 : -1) + state.tabs.length) % state.tabs.length;
    event.preventDefault();
    openTab(state.tabs[next].id);
    document.querySelector(`[data-tab="${state.tabs[next].id}"]`)?.focus();
  });
}

document.addEventListener("DOMContentLoaded", init);
