/* Meridian Outfitters — Omnia client workspace demo.
   Illustrative data only: nothing here talks to a real service. */

import {
  lineChart,
  sparkline,
  donut,
  columnChart,
  funnel,
  fmt,
  NS,
} from "./charts.js";

const ICON = (id) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#${id}"></use></svg>`;

const icon = (id) => ICON(id);

/* ---------------------------------------------------------------- content */

const SOLUTIONS = [
  { id: "agents", label: "Agents", meta: "Four agents running", icon: "i-agent", tone: "", state: "3 active" },
  { id: "orders", label: "Order Operations", meta: "Intake & fulfilment", icon: "i-bag", tone: "mint", state: "Running" },
  { id: "inventory", label: "Inventory Control", meta: "Stock & replenishment", icon: "i-boxes", tone: "lav", state: "2 need review", review: true },
  { id: "savings", label: "Savings Report", meta: "Cost recovered", icon: "i-chart", tone: "ink", state: "Updated today" },
];

const PERIODS = {
  "24h": {
    kpis: [
      { label: "Conversations", value: 186, delta: "+9%", note: "vs previous day", icon: "i-spark", tone: "", drill: "agents", spark: [12, 18, 24, 21, 38, 44, 29] },
      { label: "Orders processed", value: 52, delta: "+4%", note: "vs previous day", icon: "i-bag", tone: "mint", drill: "orders", spark: [4, 6, 9, 11, 8, 9, 5] },
      { label: "Median first reply", value: 14, unit: "s", delta: "", note: "down from 22s", icon: "i-pulse", tone: "lav", drill: "agents", spark: [22, 20, 18, 17, 15, 15, 14] },
      { label: "Hours returned", value: 6, unit: "h", delta: "+2h", note: "today", icon: "i-clock", tone: "ink", drill: "savings", spark: [1, 2, 2, 3, 4, 5, 6] },
    ],
    labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:00"],
    conversations: [3, 5, 22, 48, 41, 36, 31],
    orders: [1, 2, 9, 14, 12, 8, 6],
    range: "Today",
  },
  "7d": {
    kpis: [
      { label: "Conversations", value: 1284, delta: "+18%", note: "vs last week", icon: "i-spark", tone: "", drill: "agents", spark: [128, 141, 133, 176, 162, 198, 214] },
      { label: "Orders processed", value: 392, delta: "+6%", note: "vs last week", icon: "i-bag", tone: "mint", drill: "orders", spark: [42, 51, 44, 58, 61, 63, 72] },
      { label: "Median first reply", value: 18, unit: "s", delta: "", note: "down from 4m", icon: "i-pulse", tone: "lav", drill: "agents", spark: [44, 39, 33, 28, 22, 20, 18] },
      { label: "Hours returned", value: 46, unit: "h", delta: "+11h", note: "this month", icon: "i-clock", tone: "ink", drill: "savings", spark: [22, 25, 29, 33, 38, 42, 46] },
    ],
    labels: ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"],
    conversations: [128, 141, 133, 176, 162, 198, 214],
    orders: [42, 51, 44, 58, 61, 63, 72],
    range: "Last 7 days",
  },
  "30d": {
    kpis: [
      { label: "Conversations", value: 5218, delta: "+24%", note: "vs last month", icon: "i-spark", tone: "", drill: "agents", spark: [980, 1120, 1310, 1808] },
      { label: "Orders processed", value: 1604, delta: "+12%", note: "vs last month", icon: "i-bag", tone: "mint", drill: "orders", spark: [312, 368, 402, 522] },
      { label: "Median first reply", value: 21, unit: "s", delta: "", note: "down from 3m", icon: "i-pulse", tone: "lav", drill: "agents", spark: [60, 44, 32, 21] },
      { label: "Hours returned", value: 187, unit: "h", delta: "+38h", note: "this month", icon: "i-clock", tone: "ink", drill: "savings", spark: [96, 121, 152, 187] },
    ],
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    conversations: [980, 1120, 1310, 1808],
    orders: [312, 368, 402, 522],
    range: "Last 30 days",
  },
};

const CHANNELS = [
  { label: "WhatsApp", value: 46, color: NS.uv },
  { label: "Website", value: 31, color: NS.uvSoft },
  { label: "Email", value: 15, color: NS.mint },
  { label: "Phone", value: 8, color: NS.lav },
];

const AGENTS = [
  {
    id: "coordinator",
    name: "Coordinator",
    scope: "Runs the workspace · 6 tools",
    icon: "i-agent",
    status: "live",
    autonomy: "Approval on money",
    stats: { runs: 214, approval: 3, success: "98.4%" },
    series: [18, 24, 19, 31, 28, 34, 41],
    tools: ["orders.lookup", "warehouse.release", "customer.profile", "stripe.charges"],
    thread: [
      {
        from: "agent",
        text: "Two orders from Riyadh are held at the warehouse. Both shipped late last week and the courier never scanned them.",
        meta: "Coordinator · 09:41",
        tool: "warehouse.lookup",
        toolMeta: "2 records returned",
      },
      {
        from: "user",
        text: "Can you get them moving without charging the customers again?",
        meta: "Maya Ortiz · 09:42",
      },
      {
        from: "agent",
        text: "Yes. Both were paid once, and the hold is on our side, not the courier's. I prepared a re-release with the same tracking pool — it needs your approval because it touches fulfilment.",
        meta: "Coordinator · 09:42",
        approval: true,
      },
    ],
  },
  {
    id: "orders",
    name: "Order Operations",
    scope: "Shopify · Warehouse API",
    icon: "i-bag",
    status: "live",
    autonomy: "Internal updates only",
    stats: { runs: 392, approval: 1, success: "99.1%" },
    series: [42, 51, 44, 58, 61, 63, 72],
    tools: ["orders.validate", "stock.reserve", "warehouse.queue"],
    thread: [
      { from: "agent", text: "Invalidated 11 orders overnight: 3 had stale prices and 8 were missing a phone number for the courier.", meta: "Order Operations · 07:10", tool: "orders.validate", toolMeta: "11 fixes applied" },
      { from: "user", text: "Does the missing phone number block fulfilment?", meta: "Maya Ortiz · 08:02" },
      { from: "agent", text: "It does for Riyadh same-day. I queued those 8 for a WhatsApp nudge at 10:00, which is when that cohort usually replies.", meta: "Order Operations · 08:02" },
    ],
  },
  {
    id: "inventory",
    name: "Inventory Control",
    scope: "Shopify · Stock levels",
    icon: "i-boxes",
    status: "idle",
    autonomy: "Drafts, never purchases",
    stats: { runs: 96, approval: 2, success: "100%" },
    series: [8, 12, 9, 14, 11, 16, 13],
    tools: ["stock.read", "sellthrough.forecast", "reorder.draft"],
    thread: [
      { from: "agent", text: "Linen overshirt · Sand has 4 days of cover left at current sell-through. Canvas tote · Olive has 6.", meta: "Inventory Control · 06:30", tool: "sellthrough.forecast", toolMeta: "30-day window" },
      { from: "user", text: "What would you order?", meta: "Maya Ortiz · 07:15" },
      { from: "agent", text: "24 overshirts and 18 totes covers four weeks without overstocking. I drafted both; purchasing stays with your Omnia team.", meta: "Inventory Control · 07:15", approval: true, approvalKind: "reorder" },
    ],
  },
  {
    id: "replies",
    name: "Customer replies",
    scope: "WhatsApp · Approved knowledge",
    icon: "i-spark",
    status: "live",
    autonomy: "Approved answers only",
    stats: { runs: 186, approval: 0, success: "97.2%" },
    series: [22, 28, 24, 31, 36, 33, 41],
    tools: ["knowledge.search", "orders.lookup", "handoff.create"],
    thread: [
      { from: "agent", text: "Answered 14 conversations from the approved knowledge base. 2 asked about a return outside policy, so I passed them to Jordan.", meta: "Customer replies · 09:05", tool: "knowledge.search", toolMeta: "14 answers, 2 escalations" },
      { from: "user", text: "Show me the escalation reason.", meta: "Maya Ortiz · 09:20" },
      { from: "agent", text: "Both are sale items with a 14-day window that closed last Tuesday. Refunds on sale items need a person, so I did not offer one.", meta: "Customer replies · 09:20" },
    ],
  },
];

const ORDERS = [
  { id: "MRD-4483", customer: "Layla Haddad", city: "Dubai", items: 3, value: 612, stage: "Captured", channel: "WhatsApp", age: "4 min" },
  { id: "MRD-4482", customer: "Omar Nassar", city: "Abu Dhabi", items: 1, value: 238, stage: "Validated", channel: "Website", age: "9 min" },
  { id: "MRD-4481", customer: "Sara Maktoum", city: "Dubai", items: 2, value: 410, stage: "In fulfilment", channel: "Website", age: "22 min" },
  { id: "MRD-4480", customer: "Ibrahim Qasim", city: "Sharjah", items: 4, value: 980, stage: "Completed", channel: "WhatsApp", age: "48 min" },
  { id: "MRD-4479", customer: "Khalid Rashed", city: "Riyadh", items: 5, value: 1180, stage: "Completed", channel: "Email", age: "1 hr" },
  { id: "MRD-4478", customer: "Nadia Farouk", city: "Riyadh", items: 2, value: 860, stage: "On hold", channel: "WhatsApp", age: "2 hr" },
  { id: "MRD-4477", customer: "Huda Salim", city: "Dubai", items: 1, value: 420, stage: "Completed", channel: "Website", age: "3 hr" },
  { id: "MRD-4471", customer: "Yousef Amin", city: "Riyadh", items: 1, value: 1000, stage: "On hold", channel: "WhatsApp", age: "5 hr" },
];

const INVENTORY = [
  { item: "Linen overshirt · Sand", sku: "LOS-SND", onHand: 6, cover: 4, suggested: 24, status: "Review", trend: [18, 16, 14, 11, 9, 7, 6] },
  { item: "Canvas tote · Olive", sku: "CTO-OLV", onHand: 9, cover: 6, suggested: 18, status: "Review", trend: [22, 20, 17, 15, 13, 11, 9] },
  { item: "Desert boot · 42", sku: "DBT-42", onHand: 31, cover: 22, suggested: 0, status: "Healthy", trend: [26, 27, 28, 29, 30, 30, 31] },
  { item: "Cotton cap · Navy", sku: "CCP-NVY", onHand: 44, cover: 31, suggested: 0, status: "Healthy", trend: [38, 39, 41, 42, 43, 43, 44] },
  { item: "Merino scarf · Charcoal", sku: "MSC-CHR", onHand: 12, cover: 9, suggested: 0, status: "Healthy", trend: [9, 10, 10, 11, 11, 12, 12] },
  { item: "Trainer · White 41", sku: "TRN-W41", onHand: 2, cover: 2, suggested: 30, status: "Critical", trend: [14, 12, 9, 6, 4, 3, 2] },
];

const PEOPLE = [
  { initials: "MO", name: "Maya Ortiz", role: "Workspace admin", access: "Full", last: "Active now" },
  { initials: "JL", name: "Jordan Lee", role: "Operations", access: "Dashboards · approvals", last: "12 min ago" },
  { initials: "AS", name: "Amira Saleh", role: "Finance", access: "Savings · reports", last: "1 hr ago" },
  { initials: "HR", name: "Hassan Rahimi", role: "Warehouse", access: "Orders · stock", last: "3 hr ago" },
];

const SYSTEMS = [
  { name: "Shopify", meta: "Orders, catalog, stock", sync: "2 min ago", icon: "i-bag", tone: "good", state: "Healthy" },
  { name: "Warehouse API", meta: "Fulfilment & tracking", sync: "6 min ago", icon: "i-boxes", tone: "good", state: "Healthy" },
  { name: "Stripe", meta: "Payments & refunds", sync: "1 min ago", icon: "i-card", tone: "good", state: "Healthy" },
  { name: "WhatsApp Business", meta: "Customer conversations", sync: "12 min ago", icon: "i-spark", tone: "good", state: "Healthy" },
  { name: "Google Workspace", meta: "Team & calendar", sync: "1 hr ago", icon: "i-team", tone: "", state: "Connected" },
  { name: "Zoho Inventory", meta: "Legacy stock system", sync: "3 days ago", icon: "i-layers", tone: "warn", state: "Degraded" },
];

const MODULES = [
  { name: "Order operations", meta: "Intake, validation, fulfilment routing", on: true },
  { name: "Inventory control", meta: "Stock signals and reorder drafts", on: true },
  { name: "Customer replies", meta: "Answers from approved knowledge", on: true },
  { name: "Business reporting", meta: "Weekly summaries for finance", on: false },
  { name: "Supplier follow-up", meta: "Chasing delivery confirmations", on: false },
];

const ACTIVITY = [
  { time: "09:44", agent: "Coordinator", action: "Released 2 held orders", result: "Done" },
  { time: "09:41", agent: "Coordinator", action: "Requested approval for release", result: "Waiting" },
  { time: "09:38", agent: "Order Operations", action: "Validated 11 new orders", result: "Done" },
  { time: "09:20", agent: "Inventory Control", action: "Drafted 2 reorder suggestions", result: "Waiting" },
  { time: "08:55", agent: "Customer replies", action: "Answered 14 conversations", result: "Done" },
  { time: "08:30", agent: "Order Operations", action: "Synced fulfilment status", result: "Done" },
  { time: "07:10", agent: "Order Operations", action: "Repaired 11 incomplete orders", result: "Done" },
];

const NOTIFICATIONS = [
  { title: "Two orders waiting for your approval", meta: "Coordinator · 4 minutes ago", tone: "warn" },
  { title: "Stock covers under one week", meta: "Inventory Control · 28 minutes ago", tone: "warn" },
  { title: "Weekly summary is ready for finance", meta: "Business reporting · 1 hour ago", tone: "" },
  { title: "Zoho Inventory is degraded", meta: "Systems · 3 hours ago", tone: "warn" },
];

const state = {
  tabs: [{ id: "general", pinned: true }, { id: "agents" }, { id: "orders" }],
  active: "general",
  os: false,
  osView: "overview",
  period: "7d",
  agentId: "coordinator",
  stageFilter: "All",
  orderQuery: "",
  selectedStock: new Set(),
  approvals: { release: false, reorder: false },
  reorderSent: false,
  notificationsRead: false,
  drawer: null,
};

/* ---------------------------------------------------------------- helpers */

function solution(id) {
  return SOLUTIONS.find((item) => item.id === id);
}
const tabLabel = (id) => (id === "general" ? "General" : solution(id)?.label || id);
const tabIcon = (id) => (id === "general" ? "i-grid" : solution(id)?.icon || "i-grid");

function toast(message, tone = "") {
  const el = document.getElementById("toast");
  el.className = `toast${tone ? ` ${tone}` : ""}`;
  el.innerHTML = `<i></i>${message}`;
  el.hidden = false;
  if (window.gsap) {
    gsap.fromTo(el, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.28, ease: "power2.out" });
  }
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    if (!window.gsap) return (el.hidden = true);
    gsap.to(el, { y: 12, opacity: 0, duration: 0.2, onComplete: () => (el.hidden = true) });
  }, 2800);
}

function csv(filename, rows) {
  const body = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  toast(`Exported ${filename}`);
}

/* ------------------------------------------------------------ overlay UI */

function openDrawer(title, subtitle, body) {
  const drawer = document.getElementById("drawer");
  drawer.innerHTML = `
    <div class="drawer-head">
      <div><h2>${title}</h2><p>${subtitle}</p></div>
      <button class="icon-button" type="button" data-close-drawer aria-label="Close">${ICON("i-x")}</button>
    </div>
    <div class="drawer-body">${body}</div>`;
  drawer.hidden = false;
  document.getElementById("drawerBackdrop").hidden = false;
  if (window.gsap) {
    gsap.fromTo(drawer, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.34, ease: "power3.out" });
    gsap.fromTo(
      drawer.querySelectorAll(".drawer-body > *"),
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.3, stagger: 0.04, delay: 0.06, ease: "power2.out" },
    );
  }
  drawer.querySelector("[data-close-drawer]").addEventListener("click", closeDrawer);
}

function closeDrawer() {
  const drawer = document.getElementById("drawer");
  const finish = () => {
    drawer.hidden = true;
    document.getElementById("drawerBackdrop").hidden = true;
    drawer.innerHTML = "";
  };
  if (window.gsap) gsap.to(drawer, { x: 30, opacity: 0, duration: 0.2, onComplete: finish });
  else finish();
}

function openModal(title, subtitle, body, { wide = false } = {}) {
  const modal = document.getElementById("modal");
  modal.className = `modal${wide ? " wide" : ""}`;
  modal.innerHTML = `
    <div class="modal-head">
      <div><h2>${title}</h2><p>${subtitle}</p></div>
      <button class="icon-button" type="button" data-close-modal aria-label="Close">${ICON("i-x")}</button>
    </div>
    <div class="modal-body">${body}</div>`;
  document.getElementById("modalBackdrop").hidden = false;
  if (window.gsap) {
    gsap.fromTo(modal, { y: 14, scale: 0.99, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.3, ease: "power3.out" });
  }
  modal.querySelector("[data-close-modal]").addEventListener("click", closeModal);
  wireStage();
}

function closeModal() {
  document.getElementById("modalBackdrop").hidden = true;
  document.getElementById("modal").innerHTML = "";
}

function bookACall() {
  const slots = ["Today · 16:30 GST", "Tomorrow · 10:00 GST", "Tomorrow · 14:30 GST"];
  openModal(
    "Book a call with Omnia",
    "30 minutes with the team that built this workspace. Demo scheduling only.",
    `<div class="slots">${slots
      .map(
        (slot, index) => `<button class="slot" data-slot="${slot}" style="--i:${index}">
          <span>${slot}</span>${ICON("i-arrow")}</button>`,
      )
      .join("")}</div>
    <p class="modal-note">Nothing is sent in this demo.</p>`,
  );
  document.querySelectorAll("[data-slot]").forEach((button) =>
    button.addEventListener("click", () => {
      const slot = button.dataset.slot;
      closeModal();
      toast(`Requested ${slot} · your Omnia team will confirm.`);
    }),
  );
}

/* ------------------------------------------------------------------- tabs */

function renderTabs() {
  const root = document.getElementById("tabs");
  root.innerHTML = state.tabs
    .map((tab) => {
      const active = tab.id === state.active && !state.os;
      return `<button class="tab${tab.pinned ? " pinned" : ""}" role="tab" aria-selected="${active}"
        data-tab="${tab.id}" tabindex="${active ? 0 : -1}">
        ${ICON(tabIcon(tab.id))}<span>${tabLabel(tab.id)}</span>
        <span class="tab-close" role="presentation" data-close="${tab.id}" aria-label="Close ${tabLabel(tab.id)}">${ICON("i-x")}</span>
      </button>`;
    })
    .join("");
  root.querySelectorAll("[data-tab]").forEach((button) =>
    button.addEventListener("click", (event) => {
      if (event.target.closest("[data-close]")) return;
      openTab(button.dataset.tab);
    }),
  );
  root.querySelectorAll("[data-close]").forEach((close) =>
    close.addEventListener("click", (event) => {
      event.stopPropagation();
      closeTab(close.dataset.close);
    }),
  );
}

function openTab(id) {
  if (!state.tabs.some((tab) => tab.id === id)) state.tabs.push({ id });
  state.active = id;
  state.os = false;
  renderTabs();
  renderStage("forward");
}

function closeTab(id) {
  const index = state.tabs.findIndex((tab) => tab.id === id);
  if (index < 0 || state.tabs[index].pinned) return;
  state.tabs.splice(index, 1);
  if (state.active === id) state.active = state.tabs[Math.max(0, index - 1)].id;
  renderTabs();
  renderStage();
}

function renderSolutionsMenu() {
  const menu = document.getElementById("solutionsMenu");
  menu.innerHTML = `
    <div class="menu-head"><strong>Open a dashboard</strong><span>Built and maintained by your Omnia team</span></div>
    ${SOLUTIONS.map(
      (item) => `<button class="solution-option" role="menuitem" data-open="${item.id}">
        <span class="tile-icon ${item.tone}">${ICON(item.icon)}</span>
        <span><strong>${item.label}</strong><small>${item.meta}</small></span>
        <span class="state ${item.review ? "review" : ""}"><i></i>${item.state}</span>
      </button>`,
    ).join("")}
    <div class="menu-sep"></div>
    <button class="solution-option" role="menuitem" data-action="call">
      <span class="tile-icon ink">${ICON("i-clock")}</span>
      <span><strong>Book a call with Omnia</strong><small>Bring us a workflow you want handled</small></span>
    </button>`;
  menu.querySelectorAll("[data-open]").forEach((button) =>
    button.addEventListener("click", () => {
      menu.hidden = true;
      document.getElementById("tabAdd").setAttribute("aria-expanded", "false");
      openTab(button.dataset.open);
    }),
  );
  menu.querySelectorAll('[data-action="call"]').forEach((button) =>
    button.addEventListener("click", () => {
      menu.hidden = true;
      bookACall();
    }),
  );
}

/* ------------------------------------------------------------------ views */

function kpiTiles(period) {
  return `<div class="tile-grid">${PERIODS[period].kpis
    .map(
      (kpi) => `<article class="tile tile-link" data-drill="${kpi.drill}" tabindex="0" role="button"
        aria-label="${kpi.label}: ${fmt.n(kpi.value)}${kpi.unit || ""}">
        <div class="tile-top">
          <span class="tile-label">${kpi.label}</span>
          <span class="tile-icon ${kpi.tone}">${ICON(kpi.icon)}</span>
        </div>
        <div class="tile-value" data-count="${kpi.value}">${fmt.n(kpi.value)}${kpi.unit ? `<small>${kpi.unit}</small>` : ""}</div>
        <div class="tile-foot">
          ${kpi.delta ? `<span class="delta">${kpi.delta}</span>` : ""}
          <span>${kpi.note}</span>
          <span class="tile-spark">${sparkline(kpi.spark, { color: kpi.tone === "mint" ? NS.mintDeep : NS.uv })}</span>
        </div>
      </article>`,
    )
    .join("")}</div>`;
}

function viewGeneral() {
  const period = PERIODS[state.period];
  return `
  <div class="view-head">
    <div>
      <h1>Good evening, Maya</h1>
      <p>${new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} · Everything Omnia runs for Meridian today.</p>
    </div>
    <div class="head-actions">
      <button class="btn" data-action="ask">${ICON("i-spark")}Ask the Coordinator</button>
      <button class="btn primary" data-action="call">${ICON("i-clock")}Book a call</button>
    </div>
  </div>

  ${kpiTiles(state.period)}

  <div class="split">
    <section class="card">
      <div class="card-head">
        <div><h2>Activity</h2><small>Conversations handled, with orders per ${state.period === "7d" ? "day" : state.period === "24h" ? "hour" : "week"}</small></div>
        <div class="seg" role="group" aria-label="Period">
          ${["24h", "7d", "30d"].map((p) => `<button type="button" data-period="${p}" aria-pressed="${state.period === p}">${p}</button>`).join("")}
        </div>
      </div>
      <div class="card-body">
        <div class="chart-stats">
          <div><strong data-count="${period.kpis[0].value}">${fmt.n(period.kpis[0].value)}</strong><span>Conversations</span></div>
          <div><strong data-count="${period.kpis[1].value}">${fmt.n(period.kpis[1].value)}</strong><span>Orders</span></div>
          <div><strong>7%</strong><span>Handed to a person</span></div>
        </div>
        <div class="chart-wrap" id="mainChart">
          ${lineChart({
            series: [{ name: "Conversations", values: period.conversations }],
            labels: period.labels,
            bars: { values: period.orders },
            width: 660,
            height: 190,
            valueFormat: (v) => `${fmt.n(v)} conversations`,
          })}
          <div class="chart-tip" id="chartTip" hidden></div>
          <div class="chart-axis">${period.labels.map((l) => `<span>${l}</span>`).join("")}</div>
        </div>
      </div>
      <div class="card-foot">
        <div class="chart-legend"><span><i></i>Conversations</span><span><i class="mint"></i>Orders</span></div>
        <span>${period.range} · sample data</span>
      </div>
    </section>

    <aside class="review">
      <div class="review-top"><h2>Needs your attention</h2>${ICON("i-clock")}</div>
      <div class="review-count"><span data-count="3" data-pad="2">03</span><small>ready for review</small></div>
      <div class="review-list">
        <button class="review-row" data-open="inventory"><i class="dot warn"></i>2 stock recommendations${ICON("i-arrow")}</button>
        <button class="review-row" data-open="orders"><i class="dot"></i>1 order exception${ICON("i-arrow")}</button>
        <button class="review-row" data-open="agents"><i class="dot"></i>1 approval in Agents${ICON("i-arrow")}</button>
      </div>
      <button class="review-all" data-action="attention">View all 6 items${ICON("i-arrow")}</button>
    </aside>
  </div>

  <div class="triple">
    <section class="card">
      <div class="card-head"><div><h2>Channel mix</h2><small>Where conversations arrive</small></div></div>
      <div class="card-body donut-body">
        ${donut(CHANNELS, { size: 152, thickness: 16, centerValue: "1,284", centerLabel: "conversations" })}
        <div class="donut-legend">
          ${CHANNELS.map(
            (channel) => `<div class="legend-row"><i style="background:${channel.color}"></i>
              <span>${channel.label}</span><b>${channel.value}%</b></div>`,
          ).join("")}
        </div>
      </div>
    </section>

    <section class="card">
      <div class="card-head">
        <div><h2>Agent activity</h2><small>Running right now</small></div>
        <button class="btn quiet sm" data-open="agents">All agents${ICON("i-arrow")}</button>
      </div>
      <div class="card-body rows">
        ${AGENTS.slice(0, 3)
          .map(
            (agent) => `<button class="row row-button" data-agent="${agent.id}">
              <span class="row-title"><i class="dot ${agent.status === "live" ? "live-dot" : "idle"}"></i>
                <span><strong>${agent.name}</strong><br><span class="muted">${agent.scope}</span></span></span>
              <span class="row-spark">${sparkline(agent.series, { width: 70, height: 22, color: NS.uv })}</span>
              <span class="chip ${agent.status === "live" ? "good" : ""}">${agent.status === "live" ? "Running" : "Idle"}</span>
            </button>`,
          )
          .join("")}
      </div>
    </section>

    <section class="card">
      <div class="card-head">
        <div><h2>Recent runs</h2><small>Completed by Omnia</small></div>
        <button class="btn quiet sm" data-action="activity">Log${ICON("i-arrow")}</button>
      </div>
      <div class="card-body rows">
        ${[
          ["Order batch fulfilled", "4 min ago", "i-check"],
          ["Customer question answered", "12 min ago", "i-message"],
          ["Stock levels refreshed", "28 min ago", "i-refresh"],
          ["Daily summary prepared", "1 hr ago", "i-doc"],
        ]
          .map(
            ([text, time, iconName]) => `<div class="row row-static">
              <span class="tile-icon ink mini">${ICON(iconName)}</span>
              <span><strong>${text}</strong></span><span class="muted">${time}</span></div>`,
          )
          .join("")}
      </div>
    </section>
  </div>`;
}

function chatFor(agent) {
  const approved =
    agent.id === "coordinator" ? state.approvals.release : state.approvals.reorder;
  return agent.thread
    .map((message) => {
      if (message.from === "user")
        return `<div class="msg user"><div class="bubble">${message.text}
          <div class="msg-meta">${message.meta}</div></div></div>`;
      const approval = message.approval
        ? approved
          ? `<div class="approval done">
              <div class="approval-head">${ICON("i-shield")}<strong>Approved · just now</strong></div>
              <p>${agent.id === "coordinator" ? "Both orders left the hold with their original tracking. Nobody was charged twice." : "Draft sent to your Omnia team for purchasing."}</p>
            </div>`
          : `<div class="approval">
              <div class="approval-head">${ICON("i-shield")}<strong>Approval needed</strong></div>
              <p>${agent.id === "coordinator"
                ? "Re-release 2 held orders (MRD-4471, MRD-4478) with existing tracking. Total AED 1,860."
                : "Draft a purchase for 24 overshirts and 18 totes. Nothing is bought without your approval."}</p>
              <div class="approval-actions">
                <button class="btn primary sm" data-approve="${agent.id}">${agent.id === "coordinator" ? "Approve release" : "Approve draft"}</button>
                <button class="btn sm" data-action="adjust">Adjust</button>
              </div>
            </div>`
        : "";
      return `<div class="msg agent"><div class="bubble">${message.text}
        ${message.tool ? `<div class="tool">${ICON("i-check")}<span><strong>${message.tool}</strong> · ${message.toolMeta}</span><span class="tool-state">Done</span></div>` : ""}
        ${approval}
        <div class="msg-meta">${message.meta}<i></i>Omnia agent</div></div></div>`;
    })
    .join("");
}

function viewAgents() {
  const agent = AGENTS.find((a) => a.id === state.agentId) || AGENTS[0];
  return `
  <div class="view-head">
    <div><h1>Agents</h1><p>Configured by Omnia around Meridian's work. Anything consequential waits for a person.</p></div>
    <div class="head-actions">
      <button class="btn" data-os-open="agents">${ICON("i-gear")}Configure</button>
      <button class="btn primary" data-action="call">${ICON("i-clock")}Book a call</button>
    </div>
  </div>

  <div class="agents">
    <section class="card agent-list">
      ${AGENTS.map(
        (item) => `<button class="agent-item" data-agent="${item.id}" ${item.id === agent.id ? 'aria-current="true"' : ""}>
          <span class="agent-avatar">${ICON(item.icon)}</span>
          <span><strong>${item.name}</strong><small>${item.scope}</small></span>
          <i class="status-dot ${item.status === "idle" ? "idle" : "live-dot"}"></i>
        </button>`,
      ).join("")}
      <div class="agent-list-foot">
        <span>4 agents · 1 waiting on you</span>
      </div>
    </section>

    <section class="card chat">
      <div class="chat-head">
        <span class="agent-avatar">${ICON(agent.icon)}</span>
        <div><strong>${agent.name}</strong><small>${agent.scope}</small></div>
        <span class="chip uv">${agent.autonomy}</span>
        <span class="chip good">Active</span>
      </div>
      <div class="chat-log" id="chatLog">${chatFor(agent)}</div>
      <div class="chat-foot">
        <form class="composer" id="composer">
          <input id="composerInput" type="text" placeholder="Ask ${agent.name} anything…" autocomplete="off" />
          <button class="send" type="submit" aria-label="Send">${ICON("i-send")}</button>
        </form>
        <p class="chat-hint"><i></i>Sample conversation · actions stay inside the demo</p>
      </div>
    </section>

    <aside class="agent-rail">
      <section class="card">
        <div class="card-head"><div><h2>Today</h2><small>${agent.name}</small></div></div>
        <div class="card-body rows">
          <div class="row row-static"><span class="muted">Runs</span><strong>${fmt.n(agent.stats.runs)}</strong></div>
          <div class="row row-static"><span class="muted">Approvals waiting</span><strong>${agent.stats.approval}</strong></div>
          <div class="row row-static"><span class="muted">Success</span><strong>${agent.stats.success}</strong></div>
          <div class="row row-static"><span class="muted">Escalated</span><strong>${agent.id === "coordinator" ? 3 : 1}</strong></div>
        </div>
        <div class="card-body rail-chart">
          ${columnChart(agent.series.map((v, i) => ({ label: ["F", "S", "S", "M", "T", "W", "T"][i], value: v })), { width: 240, height: 104 })}
        </div>
      </section>
      <section class="card">
        <div class="card-head"><div><h2>Tools</h2><small>What it may call</small></div></div>
        <div class="card-body tool-list">
          ${agent.tools.map((tool) => `<span class="tool-chip">${tool}</span>`).join("")}
        </div>
      </section>
    </aside>
  </div>`;
}

function filteredOrders() {
  return ORDERS.filter((order) => {
    const stageOk = state.stageFilter === "All" || order.stage === state.stageFilter;
    const q = state.orderQuery.toLowerCase();
    const queryOk =
      !q ||
      order.id.toLowerCase().includes(q) ||
      order.customer.toLowerCase().includes(q) ||
      order.city.toLowerCase().includes(q);
    return stageOk && queryOk;
  });
}

function viewOrders() {
  const rows = filteredOrders();
  const stages = ["All", "Captured", "Validated", "In fulfilment", "Completed", "On hold"];
  return `
  <div class="view-head">
    <div><h1>Order Operations</h1><p>Intake, validation and fulfilment across Shopify and the warehouse.</p></div>
    <div class="head-actions">
      <span class="chip good">Running</span>
      <button class="btn" data-action="export-orders">${ICON("i-doc")}Export</button>
      <button class="btn primary" data-action="call">${ICON("i-clock")}Book a call</button>
    </div>
  </div>

  <div class="tile-grid">
    ${[
      { label: "Orders today", value: 52, delta: "+4%", note: "vs yesterday", icon: "i-bag", tone: "mint", spark: [4, 6, 9, 11, 8, 9, 5] },
      { label: "In fulfilment", value: 12, delta: "", note: "2 need a decision", icon: "i-boxes", tone: "lav", spark: [9, 10, 12, 11, 13, 12, 12] },
      { label: "On-time rate", value: 96, unit: "%", delta: "+1.4", note: "last 7 days", icon: "i-check", tone: "", spark: [92, 93, 94, 93, 95, 95, 96] },
      { label: "Exceptions", value: 1, delta: "", note: "waiting on you", icon: "i-clock", tone: "ink", spark: [3, 2, 2, 4, 3, 2, 1] },
    ]
      .map(
        (kpi) => `<article class="tile">
          <div class="tile-top"><span class="tile-label">${kpi.label}</span>
            <span class="tile-icon ${kpi.tone}">${ICON(kpi.icon)}</span></div>
          <div class="tile-value" data-count="${kpi.value}">${fmt.n(kpi.value)}${kpi.unit ? `<small>${kpi.unit}</small>` : ""}</div>
          <div class="tile-foot">${kpi.delta ? `<span class="delta">${kpi.delta}</span>` : ""}<span>${kpi.note}</span>
            <span class="tile-spark">${sparkline(kpi.spark, { color: kpi.tone === "mint" ? NS.mintDeep : NS.uv })}</span></div>
        </article>`,
      )
      .join("")}
  </div>

  <div class="split">
    <section class="card">
      <div class="card-head"><div><h2>Order flow</h2><small>Where today's orders stand</small></div>
        <div class="seg"><button type="button" aria-pressed="true">Today</button><button type="button" aria-pressed="false">Week</button></div></div>
      <div class="card-body">
        ${funnel([
          { label: "Received", value: 412 },
          { label: "Validated", value: 386 },
          { label: "Fulfilled", value: 338 },
          { label: "Delivered", value: 296 },
        ])}
      </div>
      <div class="card-foot"><span>2 orders held · 1 exception</span><button class="btn quiet sm" data-open="agents">Review in Agents${ICON("i-arrow")}</button></div>
    </section>

    <section class="card">
      <div class="card-head"><div><h2>Daily volume</h2><small>Orders per day</small></div></div>
      <div class="card-body rail-chart">
        ${columnChart(
          [42, 51, 44, 58, 61, 63, 72].map((value, index) => ({
            label: ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"][index],
            value,
          })),
          { width: 320, height: 160, showValues: true },
        )}
      </div>
    </section>
  </div>

  <section class="card">
    <div class="card-head">
      <div><h2>Orders</h2><small>${rows.length} of ${ORDERS.length} shown</small></div>
      <div class="table-tools">
        <div class="filter-chips">
          ${stages.map((stage) => `<button class="chip ${state.stageFilter === stage ? "uv" : "ghost"}" data-stage="${stage}">${stage}</button>`).join("")}
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
              (order) => `<tr class="row-link" data-order="${order.id}" tabindex="0">
                <td><strong>${order.id}</strong></td>
                <td>${order.customer}</td>
                <td class="muted">${order.city}</td>
                <td class="mono">${order.items}</td>
                <td class="mono">${fmt.money(order.value)}</td>
                <td class="muted">${order.age}</td>
                <td><span class="chip ${order.stage === "On hold" ? "warn" : order.stage === "Completed" ? "good" : order.stage === "Captured" ? "uv" : ""}">${order.stage}</span></td>
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
  const critical = INVENTORY.filter((i) => i.status !== "Healthy").length;
  return `
  <div class="view-head">
    <div><h1>Inventory Control</h1><p>Stock signals from Shopify, reconciled against the warehouse.</p></div>
    <div class="head-actions">
      <span class="chip warn">${critical} need review</span>
      <button class="btn primary" data-action="call">${ICON("i-clock")}Book a call</button>
    </div>
  </div>

  <div class="tile-grid three">
    <article class="tile"><div class="tile-top"><span class="tile-label">Tracked items</span><span class="tile-icon lav">${ICON("i-boxes")}</span></div>
      <div class="tile-value" data-count="1842">1,842</div>
      <div class="tile-foot"><span>across 5 collections</span></div></article>
    <article class="tile"><div class="tile-top"><span class="tile-label">Below one week of cover</span><span class="tile-icon">${ICON("i-pulse")}</span></div>
      <div class="tile-value" data-count="${critical}">${critical}</div>
      <div class="tile-foot"><span class="delta down">2 critical</span><span>needs a decision</span></div></article>
    <article class="tile"><div class="tile-top"><span class="tile-label">Awaiting approval</span><span class="tile-icon mint">${ICON("i-clock")}</span></div>
      <div class="tile-value" data-count="1">1</div>
      <div class="tile-foot"><span>draft purchase order</span></div></article>
  </div>

  <section class="card">
    <div class="card-head">
      <div><h2>Stock</h2><small>Cover is days of stock at current sell-through</small></div>
      <button class="btn sm" data-action="send-reorder" ${state.selectedStock.size ? "" : "disabled"}>
        Send ${state.selectedStock.size || ""} to Omnia
      </button>
    </div>
    <div class="card-body">
      <table class="table">
        <thead><tr><th></th><th>Item</th><th>SKU</th><th>On hand</th><th>Cover</th><th>7-day trend</th><th>Suggested</th><th>Status</th></tr></thead>
        <tbody>
          ${INVENTORY.map(
            (row) => `<tr>
              <td><input type="checkbox" class="check" data-stock="${row.sku}" ${state.selectedStock.has(row.sku) ? "checked" : ""} aria-label="Select ${row.item}" /></td>
              <td><strong>${row.item}</strong></td>
              <td class="muted mono">${row.sku}</td>
              <td class="mono">${row.onHand}</td>
              <td><span class="cover ${row.cover <= 4 ? "low" : ""}"><i style="width:${Math.min(100, (row.cover / 30) * 100)}%"></i></span><span class="cover-label">${row.cover}d</span></td>
              <td>${sparkline(row.trend, { width: 78, height: 22, color: row.cover <= 4 ? "#c0713a" : NS.uv })}</td>
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
  const months = [
    { label: "Aug", value: 11900 },
    { label: "Sep", value: 13400 },
    { label: "Oct", value: 15900 },
  ];
  return `
  <div class="view-head">
    <div><h1>Savings Report</h1><p>What Omnia recovered for Meridian this quarter.</p></div>
    <div class="head-actions">
      <button class="btn" data-action="export-savings">${ICON("i-doc")}Export CSV</button>
    </div>
  </div>

  <section class="savings-hero">
    <div>
      <span class="kicker">Quarter to date</span>
      <strong>AED <span class="hero-count" data-count="41200">41,200</span></strong>
      <p>Duplicate tools retired, manual hours returned and fewer fulfilment errors — measured against the three months before Omnia.</p>
      <div class="hero-pills">
        <span class="hero-pill">${ICON("i-chart")}AED 13,733 / month</span>
        <span class="hero-pill">${ICON("i-clock")}187 hours</span>
        <span class="hero-pill">${ICON("i-shield")}34 errors avoided</span>
      </div>
    </div>
    <div class="savings-badge">${ICON("i-chart")}</div>
  </section>

  <div class="split">
    <section class="card">
      <div class="card-head"><div><h2>Monthly saving</h2><small>AED, quarter to date</small></div></div>
      <div class="card-body">
        ${columnChart(months, { width: 420, height: 170, showValues: true })}
      </div>
      <div class="card-foot"><span>Reported to finance monthly</span><span>Prepared by Omnia</span></div>
    </section>

    <section class="card">
      <div class="card-head"><div><h2>Where it comes from</h2><small>Quarter to date</small></div></div>
      <div class="card-body bars">
        ${[
          ["Duplicate tools retired", 16400, 100],
          ["Manual hours returned", 14800, 90],
          ["Fulfilment errors avoided", 6100, 37],
          ["Support response time", 3900, 24],
        ]
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
    <div class="card-head"><div><h2>Month by month</h2><small>Savings and hours returned</small></div>
      <button class="btn quiet sm" data-action="export-savings">Export${ICON("i-arrow")}</button></div>
    <div class="card-body">
      <table class="table">
        <thead><tr><th>Month</th><th>Saved</th><th>Hours returned</th><th>Errors avoided</th><th>Trend</th></tr></thead>
        <tbody>
          ${[
            ["August", 11900, 52, 9],
            ["September", 13400, 60, 11],
            ["October", 15900, 75, 14],
          ]
            .map(
              ([month, value, hours, errors]) => `<tr>
                <td><strong>${month}</strong></td>
                <td class="mono">${fmt.money(value)}</td>
                <td class="mono">${hours}</td>
                <td class="mono">${errors}</td>
                <td>${sparkline([value * 0.78, value * 0.86, value * 0.92, value], { width: 78, height: 22 })}</td>
              </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  </section>`;
}

/* ------------------------------------------------------------ manage OS */

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
      <div class="card-head"><div><h2>People & access</h2><small>Who can see and approve work</small></div>
        <button class="btn sm" data-action="invite">${ICON("i-plus")}Invite person</button></div>
      <div class="card-body">
        <table class="table">
          <thead><tr><th>Person</th><th>Role</th><th>Access</th><th>Last active</th><th></th></tr></thead>
          <tbody>
            ${PEOPLE.map(
              (person) => `<tr><td><span class="person"><span class="mini-avatar">${person.initials}</span>${person.name}</span></td>
                <td>${person.role}</td><td class="muted">${person.access}</td><td class="muted">${person.last}</td>
                <td><button class="btn quiet sm" data-action="edit-person">Manage</button></td></tr>`,
            ).join("")}
          </tbody>
        </table>
      </div>
      <div class="card-foot"><span>Access changes are applied by your Omnia team</span><span>4 of 12 seats used</span></div>
    </section>`;

  if (view === "systems")
    return `<section class="card">
      <div class="card-head"><div><h2>Connected systems</h2><small>Maintained and monitored by Omnia</small></div>
        <span class="chip good">5 healthy · 1 degraded</span></div>
      <div class="card-body system-grid">
        ${SYSTEMS.map(
          (system) => `<div class="system-card">
            <span class="tile-icon">${ICON(system.icon)}</span>
            <span class="system-copy"><strong>${system.name}</strong><small>${system.meta} · ${system.sync}</small></span>
            <span class="chip ${system.tone}">${system.state}</span>
            <button class="btn quiet sm" data-test="${system.name}">Test</button>
          </div>`,
        ).join("")}
      </div>
      <div class="card-foot"><span>Adding or removing a connection goes through your Omnia team</span></div>
    </section>`;

  if (view === "modules")
    return `<section class="card">
      <div class="card-head"><div><h2>Modules</h2><small>What your workspace can do</small></div></div>
      <div class="card-body rows">
        ${MODULES.map(
          (module, index) => `<div class="row row-static">
            <span class="tile-icon ${index === 1 ? "mint" : index === 2 ? "lav" : ""}">${ICON(["i-bag", "i-boxes", "i-spark", "i-chart", "i-layers"][index])}</span>
            <span><strong>${module.name}</strong><br><span class="muted">${module.meta}</span></span>
            <button class="toggle" aria-pressed="${module.on}" aria-label="Toggle ${module.name}" data-module="${module.name}"></button>
          </div>`,
        ).join("")}
      </div>
      <div class="card-foot"><span>Off-modules are configured by Omnia when you ask for them</span></div>
    </section>`;

  if (view === "agents")
    return `<section class="card">
      <div class="card-head"><div><h2>Agents</h2><small>What each agent may do on its own</small></div>
        <button class="btn sm" data-action="call">Adjust with Omnia</button></div>
      <div class="card-body rows">
        ${AGENTS.map(
          (agent) => `<div class="row row-static">
            <span class="agent-avatar">${ICON(agent.icon)}</span>
            <span><strong>${agent.name}</strong><br><span class="muted">${agent.scope}</span></span>
            <span class="muted">${agent.autonomy}</span>
            <button class="toggle" aria-pressed="${agent.status === "live"}" aria-label="Toggle ${agent.name}" data-module="${agent.name}"></button>
          </div>`,
        ).join("")}
      </div>
      <div class="card-foot"><span>Every escalation still lands with a person</span></div>
    </section>`;

  if (view === "activity")
    return `<section class="card">
      <div class="card-head"><div><h2>Activity log</h2><small>Everything Omnia did, newest first</small></div>
        <div class="filter-chips">
          <button class="chip uv">All</button><button class="chip ghost">Done</button><button class="chip ghost">Waiting</button>
        </div></div>
      <div class="card-body">
        <table class="table">
          <thead><tr><th>Time</th><th>Agent</th><th>Action</th><th>Result</th></tr></thead>
          <tbody>
            ${ACTIVITY.map(
              (entry) => `<tr><td class="mono">${entry.time}</td><td>${entry.agent}</td><td>${entry.action}</td>
                <td><span class="chip ${entry.result === "Done" ? "good" : "warn"}">${entry.result}</span></td></tr>`,
            ).join("")}
          </tbody>
        </table>
      </div>
      <div class="card-foot"><span>Full history is available to workspace admins</span></div>
    </section>`;

  if (view === "plan")
    return `<section class="card">
      <div class="card-head"><div><h2>Plan & usage</h2><small>Managed for Meridian Outfitters</small></div>
        <span class="chip uv">Omnia managed</span></div>
      <div class="card-body usage">
        <div class="usage-row"><span>Workspace activity <b>62%</b></span><div class="track"><i data-usage="62"></i></div></div>
        <div class="usage-row"><span>Agent runs <b>41%</b></span><div class="track mint"><i data-usage="41"></i></div></div>
        <div class="usage-row"><span>Connected systems <b>6 of 8</b></span><div class="track"><i data-usage="75"></i></div></div>
      </div>
      <div class="card-body facts">
        <div class="fact"><span>Plan</span><strong>Omnia Workspace</strong></div>
        <div class="fact"><span>Seats</span><strong>4 of 12</strong></div>
        <div class="fact"><span>Billing</span><strong>Monthly · AED</strong></div>
        <div class="fact"><span>Support</span><strong>Named Omnia team</strong></div>
      </div>
      <div class="card-foot"><span>Plan changes are handled by your Omnia team</span></div>
    </section>
    <section class="card">
      <div class="card-head"><div><h2>Invoices</h2><small>Last three months</small></div></div>
      <div class="card-body">
        <table class="table">
          <thead><tr><th>Invoice</th><th>Period</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            ${[
              ["INV-2026-010", "October", "AED 9,800"],
              ["INV-2026-009", "September", "AED 9,800"],
              ["INV-2026-008", "August", "AED 9,800"],
            ]
              .map(
                ([id, period, amount]) => `<tr><td><strong>${id}</strong></td><td>${period}</td>
                  <td class="mono">${amount}</td><td><span class="chip good">Paid</span></td></tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>`;

  return `<section class="card">
    <div class="card-head"><div><h2>Workspace overview</h2><small>Configured and maintained by Omnia</small></div>
      <span class="chip good">Healthy</span></div>
    <div class="card-body facts">
      <div class="fact"><span>Workspace</span><strong>Meridian Outfitters</strong></div>
      <div class="fact"><span>Region</span><strong>United Arab Emirates</strong></div>
      <div class="fact"><span>People</span><strong>4 of 12 seats</strong></div>
      <div class="fact"><span>Connected systems</span><strong>6</strong></div>
      <div class="fact"><span>Active Solutions</span><strong>4</strong></div>
      <div class="fact"><span>Omnia team</span><strong>Client success</strong></div>
    </div>
    <div class="card-body tri-facts">
      ${[
        ["Uptime", "99.98%", "Last 30 days"],
        ["Runs today", "684", "Across 4 agents"],
        ["Approvals", "3", "Waiting on you"],
      ]
        .map(
          ([label, value, note]) => `<div class="stat-block"><span>${label}</span><strong>${value}</strong><small>${note}</small></div>`,
        )
        .join("")}
    </div>
    <div class="card-foot"><span>Need something changed? Book a call with your Omnia team</span>
      <button class="btn quiet sm" data-action="call">Book a call${ICON("i-arrow")}</button></div>
  </section>
  <section class="card">
    <div class="card-head"><div><h2>What Omnia maintains</h2><small>No configuration is left to you alone</small></div></div>
    <div class="card-body rows">
      ${[
        ["Connections", "Monitoring, retries and credential rotation", "Handled"],
        ["Agent behaviour", "Instructions, tools and approval rules", "Handled"],
        ["Changes", "New dashboards and workflows scoped with you", "On request"],
      ]
        .map(
          ([name, meta, status]) => `<div class="row row-static">
            <span><strong>${name}</strong><br><span class="muted">${meta}</span></span>
            <span class="chip ${status === "Handled" ? "good" : "ghost"}">${status}</span></div>`,
        )
        .join("")}
    </div>
  </section>`;
}

function viewOs() {
  return `
  <div class="view-head">
    <div><h1>Manage Omnia OS</h1><p>Meridian's workspace: people, systems, modules and the agents that run them.</p></div>
    <div class="head-actions"><button class="btn" data-action="back">${ICON("i-arrow")}Back to workspace</button></div>
  </div>
  <div class="os">
    <nav class="os-rail" aria-label="Omnia OS sections">
      <div class="os-rail-label">Omnia OS</div>
      <div class="os-nav">
        ${OS_NAV.map(
          ([id, label, iconName]) => `<button data-os="${id}" ${state.osView === id ? 'aria-current="true"' : ""}>${ICON(iconName)}${label}</button>`,
        ).join("")}
      </div>
      <div class="os-rail-foot">Maintained by your Omnia team. Changes are applied with you, not to you.</div>
    </nav>
    <div class="os-body">${osBody()}</div>
  </div>`;
}

/* ---------------------------------------------------------------- render */

function renderStage(direction = "") {
  const stage = document.getElementById("stage");
  stage.innerHTML = state.os ? viewOs() : state.active === "general" ? viewGeneral() : state.active === "agents" ? viewAgents() : state.active === "orders" ? viewOrders() : state.active === "inventory" ? viewInventory() : state.active === "savings" ? viewSavings() : viewGeneral();
  document.querySelector(".tabstrip").classList.toggle("os-mode", Boolean(state.os));
  wireStage();
  animateStage(direction);
}

function wireStage() {
  const stage = document.getElementById("stage");
  stage.querySelectorAll("[data-drill]").forEach((tile) => {
    const go = () => openTab(tile.dataset.drill);
    tile.addEventListener("click", go);
    tile.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        go();
      }
    });
  });
  stage.querySelectorAll("[data-open]").forEach((el) =>
    el.addEventListener("click", () => openTab(el.dataset.open)),
  );
  stage.querySelectorAll("[data-agent]").forEach((el) =>
    el.addEventListener("click", () => {
      state.agentId = el.dataset.agent;
      openTab("agents");
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
  stage.querySelectorAll('[data-action="call"]').forEach((el) =>
    el.addEventListener("click", bookACall),
  );
  stage.querySelectorAll('[data-action="ask"]').forEach((el) =>
    el.addEventListener("click", () => openTab("agents")),
  );
  stage.querySelectorAll('[data-action="attention"]').forEach((el) =>
    el.addEventListener("click", () => {
      openDrawer(
        "Needs your attention",
        "6 items · 3 waiting on you",
        `<div class="drawer-list">${NOTIFICATIONS.concat([
          { title: "1 order exception on MRD-4478", meta: "Order Operations · 2 hours ago", tone: "warn" },
          { title: "1 approval in Agents", meta: "Coordinator · 4 minutes ago", tone: "warn" },
        ])
          .map(
            (item) => `<div class="drawer-item"><i class="${item.tone || ""}"></i>
              <div><strong>${item.title}</strong><span>${item.meta}</span></div>
              ${ICON("i-arrow")}</div>`,
          )
          .join("")}</div>`,
      );
    }),
  );
  stage.querySelectorAll('[data-action="activity"]').forEach((el) =>
    el.addEventListener("click", () => {
      state.os = true;
      state.osView = "activity";
      renderStage();
    }),
  );
  stage.querySelectorAll("[data-action=export-orders]").forEach((el) =>
    el.addEventListener("click", () =>
      csv(
        "meridian-orders.csv",
        [["Order", "Customer", "City", "Items", "Value", "Stage"], ...ORDERS.map((o) => [o.id, o.customer, o.city, o.items, o.value, o.stage])],
      ),
    ),
  );
  stage.querySelectorAll("[data-action=export-savings]").forEach((el) =>
    el.addEventListener("click", () =>
      csv("meridian-savings.csv", [["Month", "Saved", "Hours", "Errors"], ["August", 11900, 52, 9], ["September", 13400, 60, 11], ["October", 15900, 75, 14]]),
    ),
  );
  stage.querySelectorAll("[data-approve]").forEach((el) =>
    el.addEventListener("click", () => {
      const id = el.dataset.approve;
      if (id === "coordinator") state.approvals.release = true;
      else state.approvals.reorder = true;
      renderStage();
      toast(id === "coordinator" ? "Released · 2 orders back in fulfilment" : "Draft sent to your Omnia team");
    }),
  );
  stage.querySelectorAll('[data-action="adjust"]').forEach((el) =>
    el.addEventListener("click", () => toast("Tell the agent what to change — nothing is released yet.")),
  );
  stage.querySelectorAll("[data-action=send-reorder]").forEach((el) =>
    el.addEventListener("click", () => {
      state.reorderSent = true;
      state.selectedStock.clear();
      renderStage();
      toast("Sent to your Omnia team for purchasing.");
    }),
  );
  stage.querySelectorAll("[data-stock]").forEach((box) =>
    box.addEventListener("change", () => {
      if (box.checked) state.selectedStock.add(box.dataset.stock);
      else state.selectedStock.delete(box.dataset.stock);
      const button = stage.querySelector("[data-action=send-reorder]");
      if (button) {
        button.disabled = state.selectedStock.size === 0;
        button.textContent = state.selectedStock.size ? `Send ${state.selectedStock.size} to Omnia` : "Send to Omnia";
      }
    }),
  );
  stage.querySelectorAll("[data-stage]").forEach((chip) =>
    chip.addEventListener("click", () => {
      state.stageFilter = chip.dataset.stage;
      renderStage();
    }),
  );
  const search = document.getElementById("orderSearch");
  if (search) {
    search.addEventListener("input", () => {
      state.orderQuery = search.value;
      const rows = filteredOrders();
      const body = search.closest(".card").querySelector("tbody");
      body.innerHTML = rows
        .map(
          (order) => `<tr class="row-link" data-order="${order.id}" tabindex="0">
            <td><strong>${order.id}</strong></td><td>${order.customer}</td><td class="muted">${order.city}</td>
            <td class="mono">${order.items}</td><td class="mono">${fmt.money(order.value)}</td><td class="muted">${order.age}</td>
            <td><span class="chip ${order.stage === "On hold" ? "warn" : order.stage === "Completed" ? "good" : order.stage === "Captured" ? "uv" : ""}">${order.stage}</span></td></tr>`,
        )
        .join("");
      wireRows();
    });
  }
  stage.querySelectorAll("[data-order]").forEach((row) => {
    const open = () => {
      const order = ORDERS.find((o) => o.id === row.dataset.order);
      if (order) orderDetail(order);
    };
    row.addEventListener("click", open);
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter") open();
    });
  });
  stage.querySelectorAll("[data-test]").forEach((button) =>
    button.addEventListener("click", () => {
      const name = button.dataset.test;
      button.disabled = true;
      button.textContent = "Testing…";
      setTimeout(() => {
        button.disabled = false;
        button.textContent = "Test";
        toast(`${name} responded in 240ms · healthy`);
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
  stage.querySelectorAll('[data-action="invite"]').forEach((el) =>
    el.addEventListener("click", () => {
      openModal(
        "Invite a person",
        "Access is applied by your Omnia team.",
        `<div class="modal-form">
          <label>Email<input type="email" placeholder="name@meridian.ae" /></label>
          <label>Role<select><option>Operations</option><option>Finance</option><option>Warehouse</option></select></label>
        </div>
        <p class="modal-note">Nothing is sent in this demo.</p>`,
      );
    }),
  );
  stage.querySelectorAll('[data-action="edit-person"]').forEach((el) =>
    el.addEventListener("click", () => toast("Access changes are applied by your Omnia team.")),
  );
  stage.querySelectorAll("[data-os]").forEach((el) =>
    el.addEventListener("click", () => {
      state.osView = el.dataset.os;
      renderStage();
    }),
  );
  stage.querySelectorAll('[data-action="back"]').forEach((el) =>
    el.addEventListener("click", () => {
      state.os = false;
      renderTabs();
      renderStage();
    }),
  );
  stage.querySelectorAll(".seg [data-period], .seg button:not([data-period])").forEach((el) =>
    el.addEventListener("click", () => {
      if (el.dataset.period) return;
      el.parentElement.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === el)));
      toast("Showing sample data for the selected period.");
    }),
  );

  const composer = document.getElementById("composer");
  if (composer) {
    composer.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = document.getElementById("composerInput");
      const text = input.value.trim();
      if (!text) return;
      const log = document.getElementById("chatLog");
      const agent = AGENTS.find((a) => a.id === state.agentId);
      log.insertAdjacentHTML(
        "beforeend",
        `<div class="msg user"><div class="bubble">${text}<div class="msg-meta">Maya Ortiz · now</div></div></div>`,
      );
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
          `<div class="msg agent"><div class="bubble">Noted. In the real workspace I would work this through ${agent.tools.length} connected tools and bring anything consequential back to you first.<div class="msg-meta">${agent.name} · now<i></i>Omnia agent</div></div></div>`,
        );
        log.scrollTop = log.scrollHeight;
      }, 950);
    });
  }

  wireChart();
}

function orderDetail(order) {
  openDrawer(
    order.id,
    `${order.customer} · ${order.city} · ${order.channel}`,
    `<div class="drawer-facts">
      <div><span>Value</span><strong>AED ${fmt.money(order.value)}</strong></div>
      <div><span>Items</span><strong>${order.items}</strong></div>
      <div><span>Age</span><strong>${order.age}</strong></div>
      <div><span>Stage</span><strong>${order.stage}</strong></div>
    </div>
    <h3 class="drawer-title">Timeline</h3>
    <ol class="timeline">
      ${[
        ["Order captured", `${order.channel} · ${order.age} ago`],
        ["Payment authorised", "Stripe · 1 charge"],
        ["Stock reserved", order.stage === "On hold" ? "Held at warehouse" : "Warehouse API"],
        ["Fulfilment", order.stage === "Completed" ? "Delivered" : order.stage === "On hold" ? "Paused — approval needed" : "Queued"],
      ]
        .map(
          ([label, meta], index) => `<li class="${index === 3 && order.stage === "On hold" ? "warn" : ""}">
            <i></i><div><strong>${label}</strong><span>${meta}</span></div></li>`,
        )
        .join("")}
    </ol>
    <div class="drawer-actions">
      <button class="btn primary sm" data-order-action="release">Release order</button>
      <button class="btn sm" data-order-action="contact">Message customer</button>
    </div>`,
  );
  document.querySelectorAll("[data-order-action]").forEach((button) =>
    button.addEventListener("click", () => {
      closeDrawer();
      toast(button.dataset.orderAction === "release" ? "Order released · fulfilment notified" : "Message queued for Jordan to review");
    }),
  );
}

function wireRows() {
  const stage = document.getElementById("stage");
  stage.querySelectorAll("[data-order]").forEach((row) =>
    row.addEventListener("click", () => {
      const order = ORDERS.find((o) => o.id === row.dataset.order);
      if (order) orderDetail(order);
    }),
  );
}

function wireChart() {
  const wrap = document.getElementById("mainChart");
  if (!wrap) return;
  const tip = document.getElementById("chartTip");
  wrap.querySelectorAll("[data-label]").forEach((hit) => {
    hit.addEventListener("mouseenter", () => {
      const rect = hit.getBoundingClientRect();
      const wrapRect = wrap.getBoundingClientRect();
      tip.hidden = false;
      tip.innerHTML = `<strong>${hit.dataset.value}</strong><span>${hit.dataset.label}</span>`;
      tip.style.left = `${rect.left - wrapRect.left + rect.width / 2}px`;
      tip.style.top = `${rect.top - wrapRect.top + 8}px`;
    });
    hit.addEventListener("mouseleave", () => (tip.hidden = true));
  });
}

/* ------------------------------------------------------------- animation */

function animateStage(direction = "") {
  const stage = document.getElementById("stage");
  const blocks = [
    ...stage.querySelectorAll(
      ".view-head, .tile, .card, .review, .stage-tile, .savings-hero, .agents > *",
    ),
  ];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!window.gsap || reduced) {
    stage.querySelectorAll("[data-bar]").forEach((bar) => {
      bar.setAttribute("y", Number(bar.dataset.base) - Number(bar.dataset.height));
      bar.setAttribute("height", bar.dataset.height);
    });
    stage.querySelectorAll("[data-base]").forEach((bar) => {
      bar.setAttribute("y", Number(bar.dataset.base) - Number(bar.dataset.height));
      bar.setAttribute("height", bar.dataset.height);
    });
    return;
  }

  gsap.fromTo(
    blocks,
    { opacity: 0, y: direction === "forward" ? 16 : 10 },
    { opacity: 1, y: 0, duration: 0.46, stagger: 0.035, ease: "power3.out", overwrite: true },
  );

  const line = stage.querySelector(".chart-line");
  if (line && line.getTotalLength) {
    const length = line.getTotalLength();
    gsap.fromTo(
      line,
      { strokeDasharray: length, strokeDashoffset: length },
      { strokeDashoffset: 0, duration: 1.15, ease: "power2.inOut" },
    );
  }
  stage.querySelectorAll("[data-base]").forEach((bar, index) => {
    const height = Number(bar.dataset.height);
    const base = Number(bar.dataset.base);
    gsap.fromTo(
      bar,
      { attr: { y: base, height: 0 } },
      { attr: { y: base - height, height }, duration: 0.52, delay: 0.16 + index * 0.04, ease: "power2.out" },
    );
  });
  stage.querySelectorAll("[data-funnel]").forEach((bar, index) => {
    gsap.fromTo(bar, { width: "0%" }, { width: `${bar.dataset.funnel}%`, duration: 0.7, delay: 0.12 + index * 0.08, ease: "power2.out" });
  });
  stage.querySelectorAll("[data-usage]").forEach((bar, index) => {
    gsap.fromTo(bar, { width: "0%" }, { width: `${bar.dataset.usage}%`, duration: 0.7, delay: 0.15 + index * 0.08, ease: "power2.out" });
  });
  stage.querySelectorAll(".donut-seg").forEach((segment) => {
    gsap.fromTo(segment, { opacity: 0, scale: 0.94, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.5, stagger: 0.06, ease: "power2.out" });
  });
  stage.querySelectorAll(".bar-row .track i").forEach((bar, index) => {
    const width = bar.style.width;
    gsap.fromTo(bar, { width: "0%" }, { width, duration: 0.7, delay: 0.1 + index * 0.06, ease: "power2.out" });
  });
  stage.querySelectorAll("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count);
    const pad = Number(el.dataset.pad || 0);
    const suffix = el.querySelector("small")?.outerHTML || "";
    const obj = { value: 0 };
    gsap.to(obj, {
      value: target,
      duration: 0.9,
      ease: "power2.out",
      onUpdate: () => {
        const text = fmt.n(Math.round(obj.value));
        el.innerHTML = `${pad ? text.padStart(pad, "0") : text}${suffix}`;
      },
    });
  });
}

/* ---------------------------------------------------------------- chrome */

function renderNotifications() {
  openDrawer(
    "Notifications",
    state.notificationsRead ? "All read" : "4 new",
    `<div class="drawer-list">${NOTIFICATIONS.map(
      (item) => `<div class="drawer-item ${state.notificationsRead ? "read" : ""}"><i class="${item.tone || ""}"></i>
        <div><strong>${item.title}</strong><span>${item.meta}</span></div>${ICON("i-arrow")}</div>`,
    ).join("")}</div>
    <button class="btn sm" data-mark-read>Mark all read</button>`,
  );
  state.notificationsRead = true;
  document.querySelector("[data-mark-read]")?.addEventListener("click", () => {
    closeDrawer();
    toast("Notifications marked as read");
  });
}

function init() {
  renderTabs();
  renderSolutionsMenu();
  renderStage();

  document.getElementById("tabAdd").addEventListener("click", (event) => {
    const menu = document.getElementById("solutionsMenu");
    const open = menu.hidden;
    menu.hidden = !open;
    event.currentTarget.setAttribute("aria-expanded", String(!open));
  });

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
    if (action === "call") bookACall();
    if (action === "notify") renderNotifications();
  });

  document.querySelector('[data-action="workspace"]').addEventListener("click", () => {
    openModal(
      "Meridian Outfitters",
      "This demo shows one delivered workspace.",
      `<div class="drawer-facts">
        <div><span>Region</span><strong>United Arab Emirates</strong></div>
        <div><span>Systems</span><strong>6 connected</strong></div>
        <div><span>Agents</span><strong>4 running</strong></div>
        <div><span>Since</span><strong>August 2026</strong></div>
      </div>`,
    );
  });
  document.querySelector('[data-action="notify"]').addEventListener("click", renderNotifications);

  // palette
  const backdrop = document.getElementById("paletteBackdrop");
  const input = document.getElementById("paletteInput");
  const results = document.getElementById("paletteResults");
  const items = [
    ["General", "Workspace overview", "i-grid", () => openTab("general")],
    ["Agents", "Agent conversations", "i-agent", () => openTab("agents")],
    ["Order Operations", "Orders and fulfilment", "i-bag", () => openTab("orders")],
    ["Inventory Control", "Stock and reorders", "i-boxes", () => openTab("inventory")],
    ["Savings Report", "Cost recovered", "i-chart", () => openTab("savings")],
    ["Manage Omnia OS", "People, systems, modules", "i-gear", () => { state.os = true; state.osView = "overview"; renderStage(); }],
    ["Book a call", "30 minutes with your team", "i-clock", bookACall],
    ["Export savings CSV", "Download the report", "i-doc", () => csv("meridian-savings.csv", [["Month", "Saved"], ["August", 11900], ["September", 13400], ["October", 15900]])],
  ];
  let activeIndex = 0;

  function renderResults(query = "") {
    const q = query.toLowerCase();
    const matches = items.filter((item) => item[0].toLowerCase().includes(q) || item[1].toLowerCase().includes(q));
    activeIndex = 0;
    results.innerHTML = matches
      .map(
        ([label, meta, iconName], index) => `<button class="palette-item ${index === 0 ? "active" : ""}" data-index="${items.indexOf(matches[index])}">
          ${ICON(iconName)}<span>${label}</span><small>${meta}</small></button>`,
      )
      .join("");
    results.querySelectorAll(".palette-item").forEach((button) =>
      button.addEventListener("click", () => {
        const item = items[Number(button.dataset.index)];
        closePalette();
        item[3]();
      }),
    );
  }

  function openPalette() {
    backdrop.hidden = false;
    input.value = "";
    renderResults("");
    setTimeout(() => input.focus(), 20);
    if (window.gsap) gsap.fromTo(results, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.25 });
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
      closeModal();
      closeDrawer();
      accountMenu.hidden = true;
      accountButton.setAttribute("aria-expanded", "false");
      document.getElementById("solutionsMenu").hidden = true;
      document.getElementById("tabAdd").setAttribute("aria-expanded", "false");
    }
    if (!backdrop.hidden && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      const all = [...results.querySelectorAll(".palette-item")];
      if (!all.length) return;
      event.preventDefault();
      activeIndex = (activeIndex + (event.key === "ArrowDown" ? 1 : -1) + all.length) % all.length;
      all.forEach((item, index) => item.classList.toggle("active", index === activeIndex));
    }
    if (!backdrop.hidden && event.key === "Enter") {
      results.querySelectorAll(".palette-item")[activeIndex]?.click();
    }
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".account-wrap")) {
      accountMenu.hidden = true;
      accountButton.setAttribute("aria-expanded", "false");
    }
    if (!event.target.closest(".tab-add") && !event.target.closest(".solutions-menu")) {
      document.getElementById("solutionsMenu").hidden = true;
      document.getElementById("tabAdd").setAttribute("aria-expanded", "false");
    }
  });

  document.getElementById("tabs").addEventListener("keydown", (event) => {
    if (!["ArrowRight", "ArrowLeft"].includes(event.key)) return;
    const index = state.tabs.findIndex((tab) => tab.id === state.active);
    const next = (index + (event.key === "ArrowRight" ? 1 : -1) + state.tabs.length) % state.tabs.length;
    event.preventDefault();
    openTab(state.tabs[next].id);
    document.querySelector(`[data-tab="${state.tabs[next].id}"]`)?.focus();
  });
}

document.addEventListener("DOMContentLoaded", init);
