/* Meridian Outfitters — Omnia client workspace demo.
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

const I = (id) => `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#${id}"></use></svg>`;

/* ------------------------------------------------------------------ data */

const DAYS = [
  { label: "Fri", conversations: 128, orders: 41 },
  { label: "Sat", conversations: 141, orders: 44 },
  { label: "Sun", conversations: 133, orders: 41 },
  { label: "Mon", conversations: 176, orders: 58 },
  { label: "Tue", conversations: 162, orders: 55 },
  { label: "Wed", conversations: 198, orders: 63 },
  { label: "Thu", conversations: 214, orders: 71 },
];

const HOURS = [
  { label: "00", conversations: 4, orders: 1 },
  { label: "03", conversations: 6, orders: 2 },
  { label: "06", conversations: 18, orders: 6 },
  { label: "09", conversations: 42, orders: 11 },
  { label: "12", conversations: 48, orders: 13 },
  { label: "15", conversations: 34, orders: 10 },
  { label: "18", conversations: 22, orders: 6 },
  { label: "21", conversations: 12, orders: 3 },
];

const WEEKS = [
  { label: "W1", conversations: 1184, orders: 372 },
  { label: "W2", conversations: 1290, orders: 398 },
  { label: "W3", conversations: 1315, orders: 410 },
  { label: "W4", conversations: 1429, orders: 424 },
];

const PERIODS = {
  "24h": {
    label: "Today",
    grain: "per hour",
    points: HOURS,
    median: [22, 20, 18, 17, 15, 15, 14],
    hours: 6,
    replyNote: "down from 22s",
  },
  "7d": {
    label: "Last 7 days",
    grain: "per day",
    points: DAYS,
    median: [44, 39, 33, 28, 22, 20, 18],
    hours: 46,
    replyNote: "down from 4m",
  },
  "30d": {
    label: "Last 30 days",
    grain: "per week",
    points: WEEKS,
    median: [60, 44, 32, 21],
    hours: 187,
    replyNote: "down from 3m",
  },
};

const ENGINEER = {
  name: "Ayesha Karim",
  initials: "AK",
  role: "Solutions engineer · your Omnia team",
  sla: "Usually replies within 30 minutes",
  available: true,
};

const DECISIONS = [
  {
    id: "D-2101",
    area: "Orders",
    title: "Release 2 held orders",
    why: "Both shipped last week and were never scanned by the courier. The hold is on our side, so releasing them costs nothing.",
    impact: "AED 1,860",
    impactNote: "revenue released",
    risk: "Low",
    deadline: "Today",
    agent: "Coordinator",
    evidence: "2 orders · same tracking pool",
    status: "pending",
  },
  {
    id: "D-2102",
    area: "Inventory",
    title: "Approve reorder: 24 overshirts, 18 totes",
    why: "Cover drops under a week on both. Lead time is 11 days, so ordering now keeps the shelf stocked through the month.",
    impact: "AED 6,120",
    impactNote: "purchase order",
    risk: "Medium",
    deadline: "2 days",
    agent: "Inventory Control",
    evidence: "Sell-through 30d · 2 SKUs",
    status: "pending",
  },
  {
    id: "D-2103",
    area: "Customer",
    title: "Refund a sale item outside policy",
    why: "The customer received a damaged item, but the 14-day window closed two days ago. A person has to decide this one.",
    impact: "AED 420",
    impactNote: "refund",
    risk: "Medium",
    deadline: "Today",
    agent: "Customer replies",
    evidence: "Photos attached · 1 order",
    status: "pending",
  },
  {
    id: "D-2104",
    area: "Access",
    title: "Let Customer replies send without review",
    why: "Would cut first replies from 18s to under 5s. It also removes the human check on refund and return wording.",
    impact: "2 min faster",
    impactNote: "per conversation",
    risk: "High",
    deadline: "No rush",
    agent: "Customer replies",
    evidence: "97.2% accuracy · 30 days",
    status: "pending",
  },
];

const REQUESTS = [
  {
    id: "REQ-014",
    title: "Supplier lead time on Order Operations",
    type: "New dashboard",
    status: "Answered",
    updated: "12 min ago",
    needing: false,
    thread: [
      {
        from: "client",
        author: "Maya Ortiz",
        when: "Yesterday · 14:02",
        text: "I keep chasing suppliers for delivery dates in a spreadsheet. Can we see promised vs actual on each order instead?",
      },
      {
        from: "engineer",
        author: ENGINEER.name,
        when: "Yesterday · 14:41",
        text: "Hi Maya — done. There's a new Supplier lead time view inside Order Operations. Columns are vendor, promised date, actual date and slip in days, and it flags anything running past five days late. Have a look tomorrow once a full sync has run; tell me if you'd rather see it as a weekly chart.",
      },
    ],
  },
  {
    id: "REQ-013",
    title: "Move the reorder check before the standup",
    type: "Workflow change",
    status: "With your engineer",
    updated: "1 hr ago",
    needing: false,
    thread: [
      {
        from: "client",
        author: "Maya Ortiz",
        when: "Today · 08:12",
        text: "The reorder suggestions land after our 8am warehouse standup, so they get missed. Can they be ready before it?",
      },
      {
        from: "engineer",
        author: ENGINEER.name,
        when: "Today · 08:20",
        text: "Morning — I'll move it to 07:15 so it's there before you meet. Nothing else changes; I'll confirm once it has run.",
      },
    ],
  },
  {
    id: "REQ-012",
    title: "Connect Zoho Inventory",
    type: "Integration",
    status: "Closed",
    updated: "Yesterday",
    needing: false,
    thread: [
      {
        from: "client",
        author: "Maya Ortiz",
        when: "Tuesday · 11:05",
        text: "We still run one warehouse on Zoho. Is it worth connecting or should we move it to Shopify?",
      },
      {
        from: "engineer",
        author: ENGINEER.name,
        when: "Tuesday · 11:38",
        text: "Connected it in staging so you can compare for a week before anything changes. One word of caution: its stock counts lag by about an hour, so I'd keep ordering decisions on Shopify for now.",
      },
    ],
  },
];

const TICKET_TEMPLATES = {
  "New dashboard": {
    reply:
      "Hi Maya — put this together this afternoon. It's attached to Order Operations as a new view, and the default filter is the last 30 days. If the columns aren't quite what you pictured, reply here and I'll rework it — no need to explain it twice, I have the context.",
    evidence: ["New view added: Supplier lead time", "Filters set to last 30 days", "Visible to Operations and Finance"],
  },
  "Workflow change": {
    reply:
      "Morning Maya — changed it and left a note in the activity log so you can see exactly what moved. I watched the first run and it behaved as expected; nothing else in the workflow was touched.",
    evidence: ["Schedule moved to 07:15", "First run verified", "No other changes"],
  },
  Integration: {
    reply:
      "Connected it in staging first so nothing customer-facing changed. I want to watch one full sync cycle before I promote it — that's usually about four hours. I'll confirm when it's live.",
    evidence: ["Connection added (staging)", "Sync watching", "No production change yet"],
  },
  "Something's wrong": {
    reply:
      "Found it. A webhook was rotated on the Shopify side and orders stopped arriving. I re-pointed it and replayed the missed ones — all 11 are accounted for and nothing was lost. I'll keep an eye on it for the rest of the day.",
    evidence: ["Webhook re-pointed", "11 orders replayed", "Monitoring for 24h"],
  },
};

const AGENTS = [
  { id: "coordinator", name: "Coordinator", scope: "Runs the workspace · 6 tools", icon: "i-agent", status: "live", autonomy: "Approval on money", stats: { runs: 214, approval: 3, success: "98.4%" }, series: [18, 24, 19, 31, 28, 34, 41], tools: ["orders.lookup", "warehouse.release", "stripe.charges"], thread: [
    { from: "agent", text: "Two Riyadh orders are held at the warehouse. Both shipped last week and the courier never scanned them.", meta: "Coordinator · 09:41", tool: "warehouse.lookup", toolMeta: "2 records" },
    { from: "user", text: "What would releasing them cost us?", meta: "Maya Ortiz · 09:42" },
    { from: "agent", text: "Nothing. Both were paid once and the hold is on our side. It is in your decisions queue — approve it there and I will release them with the original tracking.", meta: "Coordinator · 09:42" },
  ] },
  { id: "orders", name: "Order Operations", scope: "Shopify · Warehouse API", icon: "i-bag", status: "live", autonomy: "Internal updates only", stats: { runs: 392, approval: 1, success: "99.1%" }, series: [41, 44, 41, 58, 55, 63, 71], tools: ["orders.validate", "stock.reserve", "warehouse.queue"], thread: [
    { from: "agent", text: "Validated 11 orders overnight: 3 had stale prices, 8 were missing a phone number for the courier.", meta: "Order Operations · 07:10", tool: "orders.validate", toolMeta: "11 fixes" },
    { from: "user", text: "Does the missing number block fulfilment?", meta: "Maya Ortiz · 08:02" },
    { from: "agent", text: "It does for Riyadh same-day. I queued those 8 for a WhatsApp nudge at 10:00, which is when that group usually replies.", meta: "Order Operations · 08:02" },
  ] },
  { id: "inventory", name: "Inventory Control", scope: "Shopify · Stock levels", icon: "i-boxes", status: "idle", autonomy: "Drafts, never purchases", stats: { runs: 96, approval: 2, success: "100%" }, series: [8, 12, 9, 14, 11, 16, 13], tools: ["stock.read", "forecast.sellthrough", "reorder.draft"], thread: [
    { from: "agent", text: "Linen overshirt · Sand has 4 days of cover left. Canvas tote · Olive has 6.", meta: "Inventory Control · 06:30", tool: "forecast.sellthrough", toolMeta: "30-day window" },
    { from: "user", text: "What would you order?", meta: "Maya Ortiz · 07:15" },
    { from: "agent", text: "24 overshirts and 18 totes covers four weeks without overstocking. It is waiting in your decisions queue.", meta: "Inventory Control · 07:15" },
  ] },
  { id: "replies", name: "Customer replies", scope: "WhatsApp · Approved knowledge", icon: "i-spark", status: "live", autonomy: "Approved answers only", stats: { runs: 186, approval: 0, success: "97.2%" }, series: [22, 28, 24, 31, 36, 33, 41], tools: ["knowledge.search", "orders.lookup", "handoff.create"], thread: [
    { from: "agent", text: "Answered 14 conversations from approved knowledge. 2 asked for a refund outside policy, so I passed them to a person.", meta: "Customer replies · 09:05", tool: "knowledge.search", toolMeta: "14 answers" },
    { from: "user", text: "Why did those two need a person?", meta: "Maya Ortiz · 09:20" },
    { from: "agent", text: "Sale items with a 14-day window that closed on Tuesday. Refunds are a person's call, not mine.", meta: "Customer replies · 09:20" },
  ] },
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
  { item: "Trainer · White 41", sku: "TRN-W41", onHand: 2, cover: 2, suggested: 30, status: "Critical", trend: [14, 12, 9, 6, 4, 3, 2] },
  { item: "Desert boot · 42", sku: "DBT-42", onHand: 31, cover: 22, suggested: 0, status: "Healthy", trend: [26, 27, 28, 29, 30, 30, 31] },
  { item: "Cotton cap · Navy", sku: "CCP-NVY", onHand: 44, cover: 31, suggested: 0, status: "Healthy", trend: [38, 39, 41, 42, 43, 43, 44] },
  { item: "Merino scarf · Charcoal", sku: "MSC-CHR", onHand: 12, cover: 9, suggested: 0, status: "Healthy", trend: [9, 10, 10, 11, 11, 12, 12] },
];

const PEOPLE = [
  { initials: "MO", name: "Maya Ortiz", role: "Workspace admin", access: "Everything", last: "Active now" },
  { initials: "JL", name: "Jordan Lee", role: "Operations", access: "Orders · decisions", last: "12 min ago" },
  { initials: "AS", name: "Amira Saleh", role: "Finance", access: "Savings · invoices", last: "1 hr ago" },
  { initials: "HR", name: "Hassan Rahimi", role: "Warehouse", access: "Orders · stock", last: "3 hr ago" },
];

const SYSTEMS = [
  { name: "Shopify", meta: "Orders, catalog, stock", sync: "2 min ago", icon: "i-bag", state: "Healthy" },
  { name: "Warehouse API", meta: "Fulfilment & tracking", sync: "6 min ago", icon: "i-boxes", state: "Healthy" },
  { name: "Stripe", meta: "Payments & refunds", sync: "1 min ago", icon: "i-card", state: "Healthy" },
  { name: "WhatsApp Business", meta: "Customer conversations", sync: "12 min ago", icon: "i-spark", state: "Healthy" },
  { name: "Google Workspace", meta: "Team & calendar", sync: "1 hr ago", icon: "i-team", state: "Connected" },
  { name: "Zoho Inventory", meta: "Legacy stock system", sync: "3 days ago", icon: "i-layers", state: "Degraded" },
];

const MODULES = [
  { name: "Order operations", meta: "Intake, validation, fulfilment routing", on: true, icon: "i-bag" },
  { name: "Inventory control", meta: "Stock signals and reorder drafts", on: true, icon: "i-boxes" },
  { name: "Customer replies", meta: "Answers from approved knowledge", on: true, icon: "i-spark" },
  { name: "Business reporting", meta: "Weekly summaries for finance", on: false, icon: "i-chart" },
  { name: "Supplier follow-up", meta: "Chasing delivery confirmations", on: false, icon: "i-layers" },
];

const ACTIVITY = [
  { time: "09:44", who: "Coordinator", text: "Released 2 held orders", result: "Done" },
  { time: "09:41", who: "Coordinator", text: "Raised a decision: release held orders", result: "Waiting" },
  { time: "09:38", who: "Order Operations", text: "Validated 11 new orders", result: "Done" },
  { time: "09:20", who: "Inventory Control", text: "Drafted a reorder for 2 SKUs", result: "Waiting" },
  { time: "08:55", who: "Customer replies", text: "Answered 14 conversations", result: "Done" },
  { time: "07:15", who: "Order Operations", text: "Synced fulfilment status", result: "Done" },
];

const state = {
  tabs: [{ id: "general", pinned: true }, { id: "decisions" }, { id: "requests" }, { id: "agents" }],
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
    { id: "n2", title: "Ayesha replied to REQ-014", meta: "Your engineer · 12 min ago", kind: "request", ref: "REQ-014", read: false },
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

function notify(entry) {
  state.notifications.unshift({ read: false, ...entry });
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
  if (window.gsap) gsap.to(drawer, { x: 28, opacity: 0, duration: 0.18, onComplete: done });
  else done();
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

function openRequest(requestId) {
  const request = state.requests.find((r) => r.id === requestId);
  if (!request) return;
  openDrawer(
    request.title,
    `${request.id} · ${request.type}`,
    `<div class="drawer-row"><span class="muted">Status</span>${statusChip(request.status)}</div>
     <div class="drawer-row"><span class="muted">Your engineer</span><span class="inline-engineer">${engineerAvatar("sm")}${ENGINEER.name}</span></div>
     ${requestThread(request)}
     ${
       request.deliverables
         ? `<div class="deliverable"><h4>Delivered</h4><ul>${request.deliverables.map((d) => `<li>${I("i-check")}${d}</li>`).join("")}</ul></div>`
         : ""
     }
     <form class="reply-form" data-reply="${request.id}">
       <textarea rows="2" placeholder="Reply to Ayesha…"></textarea>
       <button class="btn primary sm" type="submit">Send</button>
     </form>`,
  );
}

function newRequestModal() {
  openModal(`
    <div class="modal-head">
      <div><h2>Request a change</h2><p>Your engineer picks it up and comes back to you — usually inside 30 minutes.</p></div>
      <button class="icon-button" data-close-modal aria-label="Close">${I("i-x")}</button>
    </div>
    <div class="modal-body">
      <form class="request-form" id="requestForm">
        <label>What kind of change?
          <select name="type">
            <option>New dashboard</option>
            <option>Workflow change</option>
            <option>Integration</option>
            <option>Something's wrong</option>
          </select>
        </label>
        <label>In a sentence
          <input name="title" required placeholder="Supplier lead time on Order Operations" />
        </label>
        <label>Anything useful to know
          <textarea name="details" rows="3" placeholder="Where it should live, who needs it, what it should show…"></textarea>
        </label>
        <p class="modal-note">Ayesha sees this with the workspace context already attached. You will not be asked to explain it twice.</p>
        <div class="modal-actions">
          <button class="btn primary" type="submit">Send to Ayesha</button>
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
        author: "Maya Ortiz",
        when: "Just now",
        text: details.trim() || title.trim(),
      },
    ],
  };
  state.requests.unshift(request);
  closeModal();
  if (state.active === "requests" && !state.os) renderStage();
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
  notify({ title: `Ayesha replied to ${id}`, meta: "Your engineer · just now", kind: "request", ref: id });
  toast(`${id} · Ayesha replied`);
  if (state.active === "requests" && !state.os) renderStage();
}

setInterval(deliverDueReplies, 1000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) deliverDueReplies(); });
window.addEventListener("focus", deliverDueReplies);
document.addEventListener("pointerdown", deliverDueReplies, { passive: true });

function bookACall() {
  closeModal();
  openModal(`
    <div class="modal-head">
      <div><h2>Book a call with Ayesha</h2><p>30 minutes, screen shared, no slides.</p></div>
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
  { id: "requests", label: "Requests", meta: "Your Omnia engineer", icon: "i-ticket", tone: "lav", state: "" },
  { id: "agents", label: "Agents", meta: "What is running", icon: "i-agent", tone: "", state: "" },
  { id: "orders", label: "Order Operations", meta: "Intake & fulfilment", icon: "i-bag", tone: "mint", state: "Running" },
  { id: "inventory", label: "Inventory Control", meta: "Stock & replenishment", icon: "i-boxes", tone: "lav", state: "3 need review", review: true },
  { id: "savings", label: "Savings Report", meta: "Cost recovered", icon: "i-chart", tone: "ink", state: "Updated today" },
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
        <span class="tab-close" role="presentation" data-close="${tab.id}" aria-label="Close ${tabLabel(tab.id)}">${I("i-x")}</span>
      </button>`;
    })
    .join("");
  root.querySelectorAll("[data-tab]").forEach((button) =>
    button.addEventListener("click", (event) => {
      if (event.target.closest("[data-close]")) return;
      if (dragState.justDragged) {
        dragState.justDragged = false;
        return;
      }
      openTab(button.dataset.tab);
    }),
  );
  root.querySelectorAll("[data-close]").forEach((el) =>
    el.addEventListener("click", (event) => {
      event.stopPropagation();
      closeTab(el.dataset.close);
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
    if (event.target.closest("[data-close]")) return;
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

function closeTab(id) {
  const index = state.tabs.findIndex((t) => t.id === id);
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
      (s) => `<button class="solution-option" role="menuitem" data-open="${s.id}">
        <span class="tile-icon ${s.tone}">${I(s.icon)}</span>
        <span><strong>${s.label}</strong><small>${s.meta}</small></span>
        ${s.state ? `<span class="state ${s.review ? "review" : ""}"><i></i>${s.state}</span>` : ""}
      </button>`,
    ).join("")}
    <div class="menu-sep"></div>
    <button class="solution-option" role="menuitem" data-new-request>
      <span class="tile-icon ink">${I("i-ticket")}</span>
      <span><strong>Request a change</strong><small>Your engineer replies in ~30 min</small></span>
    </button>`;
  menu.querySelectorAll("[data-open]").forEach((b) =>
    b.addEventListener("click", () => {
      menu.hidden = true;
      document.getElementById("tabAdd").setAttribute("aria-expanded", "false");
      openTab(b.dataset.open);
    }),
  );
  menu.querySelector("[data-new-request]").addEventListener("click", () => {
    menu.hidden = true;
    newRequestModal();
  });
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
            <button class="btn quiet sm" data-ask="${decision.id}">Ask Ayesha</button>
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
      <h1>Good evening, Maya</h1>
      <p>${new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} · ${pending.length} decisions waiting, ${openRequests().length} open requests.</p>
    </div>
    <div class="head-actions">
      <button class="btn primary" data-new-request>${I("i-ticket")}Request a change</button>
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
        <div class="chart-wrap" id="mainChart">
          ${lineChart({
            data: p.points.map((d) => ({ label: d.label, value: d.conversations, bar: d.orders })),
            height: 236,
            unit: "",
          })}
          <div class="chart-tip" id="chartTip" hidden></div>
        </div>
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
      <div class="card-body stack">
        ${pending.slice(0, 2).map((d) => decisionCard(d, { compact: true })).join("")}
      </div>
      <div class="card-foot">
        <span>Money, customers and access stop here</span>
        <button class="btn quiet sm" data-open="decisions">All decisions${I("i-arrow")}</button>
      </div>
    </aside>
  </div>

  <div class="triple">
    <section class="card">
      <div class="card-head"><div><h2>Your requests</h2><small>Handled by Ayesha, your engineer</small></div>
        <button class="btn quiet sm" data-open="requests">All${I("i-arrow")}</button></div>
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
        <button class="btn quiet sm" data-open="agents">All${I("i-arrow")}</button></div>
      <div class="card-body rows">
        ${AGENTS.slice(0, 3)
          .map(
            (a) => `<button class="row row-button" data-agent="${a.id}">
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

function viewRequests() {
  return `
  <div class="view-head">
    <div><h1>Requests</h1><p>Changes go to your engineer, not to a form. She replies inside 30 minutes.</p></div>
    <div class="head-actions"><button class="btn primary" data-new-request>${I("i-plus")}New request</button></div>
  </div>

  <section class="engineer-card">
    ${engineerAvatar("lg")}
    <div class="engineer-copy">
      <h2>${ENGINEER.name}</h2>
      <p>${ENGINEER.role}</p>
      <span class="engineer-sla"><i></i>${ENGINEER.sla}</span>
    </div>
    <div class="engineer-actions">
      <button class="btn" data-book-call>${I("i-clock")}Book a call</button>
    </div>
  </section>

  <section class="card">
    <div class="card-head"><div><h2>Your requests</h2><small>Newest first</small></div>
      <span class="chip ghost">${openRequests().length} open</span></div>
    <div class="card-body rows">
      ${state.requests
        .map(
          (r) => `<button class="row row-button request-row" data-request="${r.id}">
            <span class="row-main"><strong>${r.title}</strong><small>${r.id} · ${r.type} · updated ${r.updated}</small></span>
            <span class="request-last">${r.thread[r.thread.length - 1].from === "engineer" ? `${I("i-mail")}Ayesha` : "You"}</span>
            ${statusChip(r.status)}
          </button>`,
        )
        .join("")}
    </div>
    <div class="card-foot"><span>Requests keep their full history — no repeating yourself</span></div>
  </section>`;
}

function viewAgents() {
  const agent = AGENTS.find((a) => a.id === state.agentId) || AGENTS[0];
  return `
  <div class="view-head">
    <div><h1>Agents</h1><p>What your agents are doing, and what they are allowed to do on their own.</p></div>
    <div class="head-actions">
      <button class="btn" data-os-open="agents">${I("i-gear")}Configure</button>
      <button class="btn primary" data-new-request>${I("i-ticket")}Request a change</button>
    </div>
  </div>

  <div class="agents">
    <section class="card agent-list">
      ${AGENTS.map(
        (a) => `<button class="agent-item" data-agent="${a.id}" ${a.id === agent.id ? 'aria-current="true"' : ""}>
          <span class="agent-avatar">${I(a.icon)}</span>
          <span class="agent-main"><strong>${a.name}</strong><small>${a.scope}</small></span>
          <i class="status-dot ${a.status === "idle" ? "idle" : "live"}"></i>
        </button>`,
      ).join("")}
    </section>

    <section class="card chat">
      <div class="chat-head">
        <span class="agent-avatar">${I(agent.icon)}</span>
        <div><strong>${agent.name}</strong><small>${agent.scope}</small></div>
        <span class="chip uv">${agent.autonomy}</span>
      </div>
      <div class="chat-log" id="chatLog">
        ${agent.thread
          .map(
            (m) =>
              `<div class="msg ${m.from}"><div class="bubble">${m.text}
                ${m.tool ? `<div class="tool">${I("i-check")}<strong>${m.tool}</strong><span>${m.toolMeta}</span></div>` : ""}
                <div class="msg-meta">${m.meta}</div></div></div>`,
          )
          .join("")}
      </div>
      <div class="chat-foot">
        <form class="composer" id="composer">
          <input id="composerInput" type="text" placeholder="Ask ${agent.name} about its work…" autocomplete="off" />
          <button class="send" type="submit" aria-label="Send">${I("i-send")}</button>
        </form>
        <p class="chat-hint"><i></i>Agents answer questions here. Changes go to Ayesha through Requests.</p>
      </div>
    </section>

    <aside class="agent-rail">
      <section class="card">
        <div class="card-head"><div><h2>Today</h2><small>${agent.name}</small></div></div>
        <div class="card-body rows">
          <div class="row row-static"><span class="muted">Runs</span><strong>${fmt.n(agent.stats.runs)}</strong></div>
          <div class="row row-static"><span class="muted">Decisions raised</span><strong>${agent.stats.approval}</strong></div>
          <div class="row row-static"><span class="muted">Success</span><strong>${agent.stats.success}</strong></div>
        </div>
        <div class="card-body rail-chart">
          ${columns(
            agent.series.map((v, i) => ({ label: ["F", "S", "S", "M", "T", "W", "T"][i], value: v })),
            { width: 236, height: 104 },
          )}
        </div>
      </section>
      <section class="card">
        <div class="card-head"><div><h2>Tools</h2><small>What it may call</small></div></div>
        <div class="card-body tool-list">${agent.tools.map((t) => `<span class="tool-chip">${t}</span>`).join("")}</div>
      </section>
    </aside>
  </div>`;
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
    <div><h1>Order Operations</h1><p>Intake, validation and fulfilment across Shopify and the warehouse.</p></div>
    <div class="head-actions">
      <button class="btn" data-export-orders>${I("i-doc")}Export</button>
      <button class="btn primary" data-new-request>${I("i-ticket")}Request a change</button>
    </div>
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
    <div><h1>Inventory Control</h1><p>Stock signals from Shopify, reconciled against the warehouse.</p></div>
    <div class="head-actions"><span class="chip warn">3 need review</span></div>
  </div>

  <div class="tile-grid three">
    <article class="tile"><div class="tile-top"><span class="tile-label">Tracked items</span><span class="tile-icon lav">${I("i-boxes")}</span></div>
      <div class="tile-value" data-count="1842">1,842</div>
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
  const months = [
    { label: "Aug", value: 11900 },
    { label: "Sep", value: 13400 },
    { label: "Oct", value: 15900 },
  ];
  return `
  <div class="view-head">
    <div><h1>Savings Report</h1><p>What Omnia recovered for Meridian this quarter.</p></div>
    <div class="head-actions"><button class="btn" data-export-savings>${I("i-doc")}Export CSV</button></div>
  </div>

  <section class="savings-hero">
    <div>
      <span class="kicker">Quarter to date</span>
      <strong>AED <span class="hero-count" data-count="41200">41,200</span></strong>
      <p>Duplicate tools retired, manual hours returned and fewer fulfilment errors — measured against the three months before Omnia.</p>
      <div class="hero-pills">
        <span class="hero-pill">${I("i-chart")}AED 13,733 / month</span>
        <span class="hero-pill">${I("i-clock")}187 hours</span>
        <span class="hero-pill">${I("i-shield")}34 errors avoided</span>
      </div>
    </div>
    <div class="savings-badge">${I("i-chart")}</div>
  </section>

  <div class="split">
    <section class="card">
      <div class="card-head"><div><h2>Monthly saving</h2><small>AED, quarter to date</small></div></div>
      <div class="card-body">${columns(months, { width: 420, height: 176 })}</div>
      <div class="card-foot"><span>Reported to finance monthly</span><span>Prepared by Ayesha</span></div>
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
    <div class="card-head"><div><h2>Month by month</h2><small>Savings, hours and errors</small></div></div>
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
      <div class="card-head"><div><h2>Connected systems</h2><small>Monitored by Omnia · 5 healthy, 1 degraded</small></div></div>
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
      <div class="card-foot"><span>Adding or removing a connection is a request to Ayesha</span></div>
    </section>`;

  if (view === "modules")
    return `<section class="card">
      <div class="card-head"><div><h2>Modules</h2><small>What your workspace can do today</small></div></div>
      <div class="card-body module-grid">
        ${MODULES.map(
          (m) => `<article class="module-card ${m.on ? "" : "off"}">
            <span class="tile-icon ${m.on ? "" : "ink"}">${I(m.icon)}</span>
            <div><strong>${m.name}</strong><p>${m.meta}</p></div>
            <button class="toggle" aria-pressed="${m.on}" aria-label="Toggle ${m.name}" data-module="${m.name}"></button>
          </article>`,
        ).join("")}
      </div>
      <div class="card-foot"><span>Turning a module on is applied by your Omnia team</span></div>
    </section>`;

  if (view === "agents")
    return `<section class="card">
      <div class="card-head"><div><h2>Agents</h2><small>What each one may decide alone</small></div>
        <button class="btn sm" data-new-request>Request a change</button></div>
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
      <div class="card-head"><div><h2>Plan & usage</h2><small>Managed for Meridian Outfitters</small></div>
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
        <div class="fact"><span>Billing</span><strong>Monthly · AED 9,800</strong></div>
        <div class="fact"><span>Support</span><strong>Named engineer</strong></div>
      </div>
      <div class="card-foot"><span>Plan changes go through Ayesha</span></div>
    </section>
    <section class="card">
      <div class="card-head"><div><h2>Invoices</h2><small>Last three months</small></div></div>
      <div class="card-body rows">
        ${[["INV-2026-010", "October", "AED 9,800"], ["INV-2026-009", "September", "AED 9,800"], ["INV-2026-008", "August", "AED 9,800"]]
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
      <div class="fact"><span>Workspace</span><strong>Meridian Outfitters</strong></div>
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
        : state.active === "requests"
          ? viewRequests()
          : state.active === "agents"
            ? viewAgents()
            : state.active === "orders"
              ? viewOrders()
              : state.active === "inventory"
                ? viewInventory()
                : state.active === "savings"
                  ? viewSavings()
                  : viewGeneral();
  document.querySelector(".tabstrip").classList.toggle("os-mode", Boolean(state.os));
  wireStage();
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
  stage.querySelectorAll("[data-new-request]").forEach((el) => el.addEventListener("click", newRequestModal));
  stage.querySelectorAll("[data-book-call]").forEach((el) => el.addEventListener("click", bookACall));
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
      openModal(`
        <div class="modal-head"><div><h2>Ask Ayesha about ${decision.id}</h2><p>She has the context already — no need to explain it.</p></div>
          <button class="icon-button" data-close-modal aria-label="Close">${I("i-x")}</button></div>
        <div class="modal-body">
          <form class="request-form" id="askForm">
            <label>Your question<textarea name="details" rows="3" placeholder="What happens to the customer if we decline?"></textarea></label>
            <div class="modal-actions"><button class="btn primary" type="submit">Send</button></div>
          </form>
        </div>`);
      document.getElementById("askForm").addEventListener("submit", (event) => {
        event.preventDefault();
        closeModal();
        toast(`${decision.id} question sent to Ayesha`);
        setTimeout(() => {
          notify({ title: `Ayesha answered your question on ${decision.id}`, meta: "Your engineer · just now", kind: "decision", ref: decision.id });
          toast("Ayesha replied — open Requests");
        }, 8000);
      });
    }),
  );
  stage.querySelectorAll("[data-request]").forEach((el) => el.addEventListener("click", () => openRequest(el.dataset.request)));
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
      log.insertAdjacentHTML("beforeend", `<div class="msg user"><div class="bubble">${text}<div class="msg-meta">Maya Ortiz · now</div></div></div>`);
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
      <div><span>Value</span><strong>AED ${fmt.money(order.value)}</strong></div>
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
      n.read = true;
      updateBadge();
      closeDrawer();
      if (n.kind === "decision") {
        const decision = state.decisions.find((d) => d.id === n.ref);
        state.decisionFilter = decision && decision.status === "pending" ? "Pending" : "All";
        openTab("decisions");
      } else if (n.kind === "request") {
        openTab("requests");
        setTimeout(() => openRequest(n.ref), 350);
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
  restoreTabOrder();
  renderTabs();
  setupTabDrag();
  renderSolutionsMenu();
  renderStage();
  updateBadge();

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
    if (action === "requests") openTab("requests");
  });

  document.querySelector('[data-action="workspace"]').addEventListener("click", () =>
    openModal(`
      <div class="modal-head"><div><h2>Meridian Outfitters</h2><p>This demo shows one delivered workspace.</p></div>
        <button class="icon-button" data-close-modal aria-label="Close">${I("i-x")}</button></div>
      <div class="modal-body"><div class="drawer-facts">
        <div><span>Region</span><strong>United Arab Emirates</strong></div>
        <div><span>Systems</span><strong>6 connected</strong></div>
        <div><span>Agents</span><strong>4 running</strong></div>
        <div><span>Engineer</span><strong>${ENGINEER.name}</strong></div>
      </div></div>`),
  );
  document.querySelector('[data-action="notify"]').addEventListener("click", renderNotifications);

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
    ["Requests", "Your engineer", "i-ticket", () => openTab("requests")],
    ["New request", "Ask Ayesha for a change", "i-plus", newRequestModal],
    ["Agents", "What is running", "i-agent", () => openTab("agents")],
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
      all.forEach((el, i) => el.classList.toggle("active", i === activeIndex));
    }
    if (!backdrop.hidden && event.key === "Enter") results.querySelectorAll(".palette-item")[activeIndex]?.click();
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
