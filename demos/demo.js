/* Meridian Outfitters — Omnia client workspace demo.
   Illustrative data only: nothing here talks to a real service. */

const ICON = (id) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#${id}"></use></svg>`;

const SOLUTIONS = [
  {
    id: "agents",
    label: "Agents",
    meta: "Your Omnia agents",
    icon: "i-agent",
    tone: "",
    state: "3 active",
  },
  {
    id: "orders",
    label: "Order Operations",
    meta: "Intake & fulfilment",
    icon: "i-bag",
    tone: "mint",
    state: "Running",
  },
  {
    id: "inventory",
    label: "Inventory Control",
    meta: "Stock & replenishment",
    icon: "i-boxes",
    tone: "lav",
    state: "2 need review",
    review: true,
  },
  {
    id: "savings",
    label: "Savings Report",
    meta: "Cost recovered",
    icon: "i-chart",
    tone: "ink",
    state: "Updated today",
  },
];

const state = {
  tabs: [
    { id: "general", pinned: true },
    { id: "agents" },
    { id: "orders" },
  ],
  active: "general",
  os: null,
  osView: "overview",
  approved: false,
  chat: [
    {
      from: "agent",
      text: "Two orders from Riyadh are held at the warehouse. Both shipped late last week and the courier never scanned them.",
      meta: "Coordinator · 09:41",
      tool: "warehouse.lookup · 2 records",
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
};

/* ---------------------------------------------------------------- helpers */

const money = (value) =>
  new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(value);

const today = new Date();
const dateLabel = today.toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function solution(id) {
  return SOLUTIONS.find((item) => item.id === id);
}

function tabLabel(id) {
  return id === "general" ? "General" : solution(id)?.label || id;
}

function tabIcon(id) {
  return id === "general" ? "i-grid" : solution(id)?.icon || "i-grid";
}

function toast(message) {
  const el = document.getElementById("toast");
  el.innerHTML = `<i></i>${message}`;
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (el.hidden = true), 2600);
}

/* ------------------------------------------------------------------ tabs */

function renderTabs() {
  const root = document.getElementById("tabs");
  root.innerHTML = state.tabs
    .map((tab) => {
      const active = tab.id === state.active;
      return `<button class="tab${tab.pinned ? " pinned" : ""}" role="tab"
        aria-selected="${active}" data-tab="${tab.id}" tabindex="${active ? 0 : -1}">
        ${ICON(tabIcon(tab.id))}<span>${tabLabel(tab.id)}</span>
        <span class="tab-close" role="button" tabindex="-1" aria-label="Close ${tabLabel(tab.id)}" data-close="${tab.id}">${ICON("i-x")}</span>
      </button>`;
    })
    .join("");

  root.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", (event) => {
      if (event.target.closest("[data-close]")) return;
      openTab(button.dataset.tab);
    });
  });
  root.querySelectorAll("[data-close]").forEach((close) => {
    close.addEventListener("click", (event) => {
      event.stopPropagation();
      closeTab(close.dataset.close);
    });
  });
}

function openTab(id) {
  if (!state.tabs.some((tab) => tab.id === id)) state.tabs.push({ id });
  state.active = id;
  state.os = null;
  renderTabs();
  renderStage();
  const stage = document.getElementById("stage");
  stage.focus({ preventScroll: true });
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
  menu.querySelectorAll("[data-open]").forEach((button) => {
    button.addEventListener("click", () => {
      menu.hidden = true;
      document.getElementById("tabAdd").setAttribute("aria-expanded", "false");
      openTab(button.dataset.open);
    });
  });
  menu.querySelectorAll('[data-action="call"]').forEach((button) => {
    button.addEventListener("click", () => {
      menu.hidden = true;
      toast("Your Omnia team will reach out to schedule a call.");
    });
  });
}

/* ---------------------------------------------------------------- charts */

function areaChart(series, width = 620, height = 168) {
  const primary = series[0];
  const secondary = series[1];
  const max = Math.max(...primary.values) * 1.16;
  const barMax = Math.max(...secondary.values) * 2.1;
  const pad = 14;
  const stepX = (width - pad * 2) / (primary.values.length - 1);
  const xAt = (index) => pad + index * stepX;
  const y = (value) => height - (value / max) * (height - 10);
  const barW = Math.min(24, stepX * 0.44);

  const linePath = (values) =>
    values
      .map((value, index) => {
        const x = pad + index * stepX;
        const yy = y(value);
        if (index === 0) return `M${x} ${yy}`;
        const prevX = pad + (index - 1) * stepX;
        const prevY = y(values[index - 1]);
        const cx = prevX + stepX / 2;
        return `C${cx} ${prevY} ${cx} ${yy} ${x} ${yy}`;
      })
      .join(" ");

  const area = `${linePath(primary.values)} L${width - pad} ${height} L${pad} ${height} Z`;

  return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img"
      aria-label="Weekly activity: conversations handled, with orders per day.">
    <defs>
      <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5b45d6" stop-opacity="0.18" />
        <stop offset="100%" stop-color="#5b45d6" stop-opacity="0" />
      </linearGradient>
    </defs>
    <g stroke="#f0ecfa" stroke-width="1">
      ${[0.25, 0.55, 0.85].map((p) => `<path d="M0 ${height * p}H${width}" />`).join("")}
    </g>
    <path d="${area}" fill="url(#fill)" />
    <g fill="#69e3c0" opacity="0.42">
      ${secondary.values
        .map((value, index) => {
          const barH = (value / barMax) * (height * 0.62);
          return `<rect x="${xAt(index) - barW / 2}" y="${height - barH}" width="${barW}" height="${barH}" rx="4" />`;
        })
        .join("")}
    </g>
    <path d="${linePath(primary.values)}" fill="none" stroke="#5b45d6" stroke-width="2.4"
      stroke-linecap="round" class="chart-line" />
    <circle cx="${xAt(primary.values.length - 1)}" cy="${y(primary.values.at(-1))}" r="4"
      fill="#fff" stroke="#5b45d6" stroke-width="2.4" />
  </svg>`;
}

/* ----------------------------------------------------------------- views */

function viewGeneral() {
  return `
  <div class="view-head">
    <div>
      <h1>Good evening, Maya</h1>
      <p>${dateLabel} · Everything Omnia runs for Meridian today.</p>
    </div>
    <div class="head-actions">
      <button class="btn" data-action="call">${ICON("i-clock")}Book a call</button>
    </div>
  </div>

  <div class="tile-grid">
    ${[
      ["Conversations handled", "1,284", "+18%", "vs last week", "i-spark", "", true],
      ["Orders processed", "392", "+6%", "vs last week", "i-bag", "mint", true],
      ["Median first reply", "18s", "", "down from 4m", "i-pulse", "lav", false],
      ["Hours returned", "46", "+11h", "this month", "i-clock", "ink", true],
    ]
      .map(
        ([label, value, delta, note, icon, tone, up]) => `
      <article class="tile">
        <div class="tile-top">
          <span class="tile-label">${label}</span>
          <span class="tile-icon ${tone}">${ICON(icon)}</span>
        </div>
        <div class="tile-value">${value}</div>
        <div class="tile-foot">
          ${delta ? `<span class="delta ${up ? "" : "down"}">${delta}</span>` : ""}
          <span>${note}</span>
        </div>
      </article>`,
      )
      .join("")}
  </div>

  <div class="split">
    <section class="card">
      <div class="card-head">
        <div>
          <h2>Activity</h2>
          <small>Conversations and orders across connected systems</small>
        </div>
        <div class="seg" role="group" aria-label="Period">
          <button type="button" aria-pressed="false">24h</button>
          <button type="button" aria-pressed="true">7d</button>
          <button type="button" aria-pressed="false">30d</button>
        </div>
      </div>
      <div class="card-body">
        <div class="chart-stats">
          <div><strong>1,284</strong><span>Conversations</span></div>
          <div><strong>392</strong><span>Orders</span></div>
          <div><strong>7%</strong><span>Handed to a person</span></div>
        </div>
        <div class="chart-wrap">
          ${areaChart([
            {
              name: "Conversations",
              values: [128, 141, 133, 176, 162, 198, 214],
            },
            { name: "Orders", values: [42, 51, 44, 58, 61, 63, 72] },
          ])}
          <div class="chart-axis">
            ${["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"]
              .map((day) => `<span>${day}</span>`)
              .join("")}
          </div>
        </div>
      </div>
      <div class="card-foot">
        <div class="chart-legend">
          <span><i></i>Conversations</span>
          <span><i class="mint"></i>Orders</span>
        </div>
        <span>Sample data</span>
      </div>
    </section>

    <aside class="review">
      <div class="review-top">
        <h2>Needs your attention</h2>
        ${ICON("i-clock")}
      </div>
      <div class="review-count">03<small>ready for review</small></div>
      <div class="review-list">
        <button class="review-row" data-open="inventory"><i class="dot warn"></i>2 stock recommendations${ICON("i-arrow")}</button>
        <button class="review-row" data-open="orders"><i class="dot"></i>1 order exception${ICON("i-arrow")}</button>
        <button class="review-row" data-open="agents"><i class="dot"></i>1 approval in Agents${ICON("i-arrow")}</button>
      </div>
      <p class="review-foot"><i class="dot"></i>Everything else is running normally</p>
    </aside>
  </div>

  <div class="split">
    <section class="card">
      <div class="card-head">
        <div>
          <h2>Agent activity</h2>
          <small>What your agents are doing right now</small>
        </div>
        <button class="btn quiet sm" data-open="agents">Open Agents${ICON("i-arrow")}</button>
      </div>
      <div class="card-body rows">
        ${[
          ["Coordinator", "Holding 2 Riyadh orders for your approval", "live", "Waiting on you"],
          ["Order Operations", "Matching new orders to stock", "live", "Running"],
          ["Inventory Control", "Prepared 2 reorder suggestions", "warn", "Needs review"],
        ]
          .map(
            ([name, task, dot, chip]) => `
          <div class="row" style="grid-template-columns:minmax(0,1fr) auto">
            <span class="row-title"><i class="dot ${dot === "warn" ? "warn" : ""} ${dot === "live" ? "live-dot" : ""}"></i>
              <span><strong>${name}</strong><br><span class="muted">${task}</span></span>
            </span>
            <span class="chip ${chip === "Running" ? "good" : chip === "Needs review" ? "warn" : "uv"}">${chip}</span>
          </div>`,
          )
          .join("")}
      </div>
    </section>

    <section class="card">
      <div class="card-head">
        <div>
          <h2>Recent runs</h2>
          <small>Work completed by Omnia</small>
        </div>
      </div>
      <div class="card-body rows">
        ${[
          ["Order batch fulfilled", "4 min ago", "i-check"],
          ["Customer question answered", "12 min ago", "i-message"],
          ["Stock levels refreshed", "28 min ago", "i-refresh"],
          ["Daily summary prepared", "1 hr ago", "i-doc"],
        ]
          .map(
            ([text, time, icon]) => `
          <div class="row" style="grid-template-columns:auto minmax(0,1fr) auto">
            <span class="tile-icon ink" style="width:28px;height:28px;border-radius:9px">${ICON(icon)}</span>
            <span><strong>${text}</strong></span>
            <span class="muted">${time}</span>
          </div>`,
          )
          .join("")}
      </div>
    </section>
  </div>`;
}

function viewAgents() {
  const approval = state.approved
    ? `<div class="approval done">
        <div class="approval-head">${ICON("i-shield")}<strong>Released · 09:44</strong></div>
        <p>Both orders left the hold with their original tracking. Customers were not charged again.</p>
      </div>`
    : `<div class="approval">
        <div class="approval-head">${ICON("i-shield")}<strong>Approval needed</strong></div>
        <p>Re-release 2 held orders (MRD-4471, MRD-4478) with existing tracking. Total value AED 1,860.</p>
        <div class="approval-actions">
          <button class="btn primary" data-approve>Approve release</button>
          <button class="btn" data-action="adjust">Adjust</button>
        </div>
      </div>`;

  const messages = state.chat
    .map((message) => {
      if (message.from === "user")
        return `<div class="msg user"><div class="bubble">${message.text}
          <div class="msg-meta">${message.meta}</div></div></div>`;
      return `<div class="msg agent">
        <div class="bubble">${message.text}
          ${message.tool ? `<div class="tool">${ICON("i-check")}<span><strong>${message.tool}</strong></span><span class="tool-state">Done</span></div>` : ""}
          ${message.approval ? approval : ""}
          <div class="msg-meta">${message.meta}<i></i>Omnia agent</div>
        </div>
      </div>`;
    })
    .join("");

  return `
  <div class="view-head">
    <div>
      <h1>Agents</h1>
      <p>Configured by Omnia around Meridian's work. Every action that matters waits for a person.</p>
    </div>
    <div class="head-actions">
      <button class="btn" data-action="call">${ICON("i-clock")}Book a call</button>
    </div>
  </div>

  <div class="agents">
    <section class="card agent-list">
      ${[
        ["Coordinator", "Runs the workspace · 3 tools", "i-agent", true, "live"],
        ["Order Operations", "Shopify · Warehouse API", "i-bag", false, "live"],
        ["Inventory Control", "Shopify · Stock levels", "i-boxes", false, "idle"],
        ["Customer replies", "WhatsApp · Knowledge", "i-spark", false, "live"],
      ]
        .map(
          ([name, meta, icon, current, status]) => `
        <button class="agent-item" ${current ? 'aria-current="true"' : ""}>
          <span class="agent-avatar">${ICON(icon)}</span>
          <span><strong>${name}</strong><small>${meta}</small></span>
          <i class="status-dot ${status === "idle" ? "idle" : "live-dot"}"></i>
        </button>`,
        )
        .join("")}
    </section>

    <section class="card chat">
      <div class="chat-head">
        <span class="agent-avatar">${ICON("i-agent")}</span>
        <div><strong>Coordinator</strong><small>Connected to Shopify, Warehouse API, Stripe</small></div>
        <span class="chip good">Active</span>
      </div>
      <div class="chat-log" id="chatLog">${messages}</div>
      <div class="chat-foot">
        <form class="composer" id="composer">
          <input id="composerInput" type="text" placeholder="Ask the Coordinator anything…" autocomplete="off" />
          <button class="send" type="submit" aria-label="Send">${ICON("i-send")}</button>
        </form>
        <p class="chat-hint"><i></i>Sample conversation · actions stay inside the demo</p>
      </div>
    </section>
  </div>`;
}

function viewOrders() {
  return `
  <div class="view-head">
    <div>
      <h1>Order Operations</h1>
      <p>Intake, validation and fulfilment across Shopify and the warehouse.</p>
    </div>
    <div class="head-actions">
      <span class="chip good">Running</span>
      <button class="btn" data-action="call">Contact Omnia</button>
    </div>
  </div>

  <div class="pipeline">
    ${[
      ["Captured today", "18", 38, ""],
      ["Validated", "24", 52, "mint"],
      ["In fulfilment", "12", 26, "lav"],
      ["Completed", "338", 100, ""],
    ]
      .map(
        ([label, value, width, tone]) => `
      <div class="stage-tile ${tone}">
        <span>${label}</span><strong>${value}</strong>
        <div class="bar"><i style="width:${width}%"></i></div>
      </div>`,
      )
      .join("")}
  </div>

  <div class="split">
    <section class="card">
      <div class="card-head">
        <div><h2>Recent orders</h2><small>Last 24 hours · AED</small></div>
      </div>
      <div class="card-body">
        <table class="table">
          <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Value</th><th>Stage</th></tr></thead>
          <tbody>
            ${[
              ["MRD-4483", "Layla Haddad", "3", "612", "Captured", "uv"],
              ["MRD-4482", "Omar Nassar", "1", "238", "Validated", "good"],
              ["MRD-4481", "Sara Maktoum", "2", "410", "In fulfilment", ""],
              ["MRD-4479", "Khalid Rashed", "5", "1,180", "Completed", "good"],
              ["MRD-4478", "Nadia Farouk", "2", "860", "On hold", "warn"],
              ["MRD-4471", "Yousef Amin", "1", "1,000", "On hold", "warn"],
            ]
              .map(
                ([id, customer, items, value, stage, tone]) => `
              <tr>
                <td><strong>${id}</strong></td>
                <td>${customer}</td>
                <td class="mono">${items}</td>
                <td class="mono">${value}</td>
                <td><span class="chip ${tone}">${stage}</span></td>
              </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <div class="card-foot"><span>2 orders held pending approval</span><button class="btn quiet sm" data-open="agents">Review in Agents${ICON("i-arrow")}</button></div>
    </section>

    <aside class="card">
      <div class="card-head"><div><h2>Today</h2><small>Order health</small></div></div>
      <div class="card-body rows">
        ${[
          ["Processed", "392"],
          ["Ready to fulfil", "24"],
          ["Needs review", "1"],
          ["Failed", "0"],
        ]
          .map(
            ([label, value]) => `<div class="row" style="grid-template-columns:minmax(0,1fr) auto"><span class="muted">${label}</span><strong class="mono">${value}</strong></div>`,
          )
          .join("")}
      </div>
      <div class="card-foot"><span>Updated 2 minutes ago</span></div>
    </aside>
  </div>`;
}

function viewInventory() {
  return `
  <div class="view-head">
    <div>
      <h1>Inventory Control</h1>
      <p>Stock signals from Shopify, reconciled against the warehouse.</p>
    </div>
    <div class="head-actions">
      <span class="chip warn">2 need review</span>
    </div>
  </div>

  <div class="tile-grid" style="grid-template-columns:repeat(3,minmax(0,1fr))">
    ${[
      ["Tracked items", "1,842", "i-boxes", ""],
      ["Low stock", "2", "i-pulse", "lav"],
      ["Awaiting approval", "1", "i-clock", "mint"],
    ]
      .map(
        ([label, value, icon, tone]) => `
      <article class="tile"><div class="tile-top"><span class="tile-label">${label}</span>
        <span class="tile-icon ${tone}">${ICON(icon)}</span></div>
        <div class="tile-value">${value}</div></article>`,
      )
      .join("")}
  </div>

  <div class="split">
    <section class="card">
      <div class="card-head">
        <div><h2>Reorder suggestions</h2><small>Prepared from 30-day sell-through</small></div>
        <button class="btn sm" data-approve-reorder>Send to Omnia</button>
      </div>
      <div class="card-body">
        <table class="table">
          <thead><tr><th>Item</th><th>On hand</th><th>Cover</th><th>Suggested</th><th>Status</th></tr></thead>
          <tbody>
            ${[
              ["Linen overshirt · Sand", "6", "4 days", "24 units", "warn", "Review"],
              ["Canvas tote · Olive", "9", "6 days", "18 units", "warn", "Review"],
              ["Desert boot · 42", "31", "22 days", "—", "good", "Healthy"],
              ["Cotton cap · Navy", "44", "31 days", "—", "good", "Healthy"],
            ]
              .map(
                ([item, onHand, cover, suggested, tone, status]) => `
              <tr><td><strong>${item}</strong></td><td class="mono">${onHand}</td>
              <td class="mono">${cover}</td><td class="mono">${suggested}</td>
              <td><span class="chip ${tone}">${status}</span></td></tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <div class="card-foot"><span>Suggestions stay here until someone approves them</span></div>
    </section>

    <aside class="card">
      <div class="card-head"><div><h2>How this works</h2><small>Inventory Control</small></div></div>
      <div class="card-body rows">
        <p class="muted" style="font-size:12.5px;line-height:1.6">
          Omnia reads stock and sell-through every six hours. When cover drops under a
          week it drafts a reorder and waits — nothing is purchased automatically.
        </p>
        <div class="row" style="grid-template-columns:minmax(0,1fr) auto"><span class="muted">Last refresh</span><strong>6 minutes ago</strong></div>
        <div class="row" style="grid-template-columns:minmax(0,1fr) auto"><span class="muted">Systems</span><strong>Shopify · Warehouse</strong></div>
        <div class="row" style="grid-template-columns:minmax(0,1fr) auto"><span class="muted">Approvals</span><strong>Required</strong></div>
      </div>
    </aside>
  </div>`;
}

function viewSavings() {
  return `
  <div class="view-head">
    <div>
      <h1>Savings Report</h1>
      <p>What Omnia recovered for Meridian this quarter.</p>
    </div>
    <div class="head-actions"><button class="btn" data-action="export">${ICON("i-doc")}Export</button></div>
  </div>

  <section class="savings-hero">
    <div>
      <span>Quarter to date</span>
      <strong>AED ${money(41200)}</strong>
      <p>Duplicate tools retired, manual hours returned and fewer fulfilment errors — measured against the three months before Omnia.</p>
    </div>
    <div class="savings-badge">${ICON("i-chart")}</div>
  </section>

  <div class="split">
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
            ([label, value, width]) => `
          <div class="bar-row">
            <span class="label">${label}</span>
            <span class="track"><i style="width:${width}%"></i></span>
            <span class="amount">${money(value)}</span>
          </div>`,
          )
          .join("")}
      </div>
      <div class="card-foot"><span>Figures are illustrative for this demo</span><span>Prepared by Omnia</span></div>
    </section>

    <aside class="card">
      <div class="card-head"><div><h2>By month</h2><small>AED</small></div></div>
      <div class="card-body">
        <table class="table">
          <thead><tr><th>Month</th><th>Saved</th></tr></thead>
          <tbody>
            ${[
              ["August", "11,900"],
              ["September", "13,400"],
              ["October", "15,900"],
            ]
              .map(([month, value]) => `<tr><td>${month}</td><td class="mono"><strong>${value}</strong></td></tr>`)
              .join("")}
          </tbody>
        </table>
      </div>
      <div class="card-foot"><span>Reported to finance monthly</span></div>
    </aside>
  </div>`;
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

function viewOsBody() {
  const view = state.osView;
  if (view === "people")
    return `<section class="card">
      <div class="card-head"><div><h2>People & access</h2><small>Who can see and approve work</small></div>
        <button class="btn sm" data-action="invite">${ICON("i-plus")}Invite person</button></div>
      <div class="card-body">
        <table class="table">
          <thead><tr><th>Person</th><th>Role</th><th>Access</th><th></th></tr></thead>
          <tbody>
            ${[
              ["MO", "Maya Ortiz", "Workspace admin", "Full"],
              ["JL", "Jordan Lee", "Operations", "Dashboards · approvals"],
              ["AS", "Amira Saleh", "Finance", "Savings · reports"],
              ["HR", "Hassan Rahimi", "Warehouse", "Orders · stock"],
            ]
              .map(
                ([initials, name, role, access]) => `
              <tr><td><span class="person"><span class="mini-avatar">${initials}</span>${name}</span></td>
              <td>${role}</td><td class="muted">${access}</td>
              <td><button class="btn quiet sm" data-action="edit-person">Manage</button></td></tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <div class="card-foot"><span>Access changes are applied by your Omnia team</span></div>
    </section>`;

  if (view === "systems")
    return `<section class="card">
      <div class="card-head"><div><h2>Connected systems</h2><small>Maintained and monitored by Omnia</small></div>
        <span class="chip good">5 healthy</span></div>
      <div class="card-body system-grid">
        ${[
          ["Shopify", "Orders, catalog, stock", "Synced 2 min ago", "i-bag", "good", "Healthy"],
          ["Warehouse API", "Fulfilment & tracking", "Synced 6 min ago", "i-boxes", "good", "Healthy"],
          ["Stripe", "Payments & refunds", "Synced 1 min ago", "i-card", "good", "Healthy"],
          ["WhatsApp Business", "Customer conversations", "Synced 12 min ago", "i-spark", "good", "Healthy"],
          ["Google Workspace", "Team & calendar", "Synced 1 hr ago", "i-team", "", "Connected"],
        ]
          .map(
            ([name, meta, sync, icon, tone, state]) => `
          <div class="system-card">
            <span class="tile-icon ${tone}">${ICON(icon)}</span>
            <span><strong>${name}</strong><small>${meta} · ${sync}</small></span>
            <span class="chip ${tone}">${state}</span>
          </div>`,
          )
          .join("")}
      </div>
      <div class="card-foot"><span>Adding or removing a connection goes through your Omnia team</span></div>
    </section>`;

  if (view === "modules")
    return `<section class="card">
      <div class="card-head"><div><h2>Modules</h2><small>What your workspace can do</small></div></div>
      <div class="card-body rows">
        ${[
          ["Order operations", "Intake, validation, fulfilment routing", true],
          ["Inventory control", "Stock signals and reorder drafts", true],
          ["Customer replies", "Answers from approved knowledge", true],
          ["Business reporting", "Weekly summaries for finance", false],
          ["Supplier follow-up", "Chasing delivery confirmations", false],
        ]
          .map(
            ([name, meta, on]) => `
          <div class="row" style="grid-template-columns:minmax(0,1fr) auto">
            <span><strong>${name}</strong><br><span class="muted">${meta}</span></span>
            <button class="toggle" aria-pressed="${on}" aria-label="Toggle ${name}" data-toggle></button>
          </div>`,
          )
          .join("")}
      </div>
      <div class="card-foot"><span>Off-modules are configured by Omnia when you ask for them</span></div>
    </section>`;

  if (view === "agents")
    return `<section class="card">
      <div class="card-head"><div><h2>Agents</h2><small>What each agent may do on its own</small></div>
        <button class="btn sm" data-action="call">Adjust with Omnia</button></div>
      <div class="card-body rows">
        ${[
          ["Coordinator", "Cross-module work", "Everything except payments", true],
          ["Order Operations", "Orders and fulfilment", "Internal updates only", true],
          ["Inventory Control", "Stock and reorder drafts", "Drafts, never purchases", true],
          ["Customer replies", "Customer conversations", "Approved answers only", false],
        ]
          .map(
            ([name, scope, autonomy, on]) => `
          <div class="row" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto">
            <span><strong>${name}</strong><br><span class="muted">${scope}</span></span>
            <span class="muted">${autonomy}</span>
            <button class="toggle" aria-pressed="${on}" aria-label="Toggle ${name}" data-toggle></button>
          </div>`,
          )
          .join("")}
      </div>
      <div class="card-foot"><span>Every agent escalation still lands with a person</span></div>
    </section>`;

  if (view === "activity")
    return `<section class="card">
      <div class="card-head"><div><h2>Activity log</h2><small>Everything Omnia did, newest first</small></div>
        <span class="chip ghost">Last 24 hours</span></div>
      <div class="card-body">
        <table class="table">
          <thead><tr><th>Time</th><th>Agent</th><th>Action</th><th>Result</th></tr></thead>
          <tbody>
            ${[
              ["09:44", "Coordinator", "Released 2 held orders", "Done"],
              ["09:41", "Coordinator", "Requested approval for release", "Waiting"],
              ["09:38", "Order Operations", "Validated 11 new orders", "Done"],
              ["09:20", "Inventory Control", "Drafted 2 reorder suggestions", "Waiting"],
              ["08:55", "Customer replies", "Answered 14 conversations", "Done"],
              ["08:30", "Order Operations", "Synced fulfilment status", "Done"],
            ]
              .map(
                ([time, agent, action, result]) => `
              <tr><td class="mono">${time}</td><td>${agent}</td><td>${action}</td>
              <td><span class="chip ${result === "Done" ? "good" : "warn"}">${result}</span></td></tr>`,
              )
              .join("")}
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
        <div class="usage-row"><span>Workspace activity <b>62%</b></span><div class="track"><i style="width:62%"></i></div></div>
        <div class="usage-row"><span>Agent runs <b>41%</b></span><div class="track mint"><i style="width:41%"></i></div></div>
        <div class="usage-row"><span>Connected systems <b>5 of 8</b></span><div class="track"><i style="width:62%"></i></div></div>
      </div>
      <div class="card-body facts" style="padding-top:0">
        <div class="fact"><span>Plan</span><strong>Omnia Workspace</strong></div>
        <div class="fact"><span>Seats</span><strong>8 of 12</strong></div>
        <div class="fact"><span>Billing</span><strong>Monthly · AED</strong></div>
        <div class="fact"><span>Support</span><strong>Named Omnia team</strong></div>
      </div>
      <div class="card-foot"><span>Plan changes are handled by your Omnia team</span></div>
    </section>`;

  return `<section class="card">
    <div class="card-head"><div><h2>Workspace overview</h2><small>Configured and maintained by Omnia</small></div>
      <span class="chip good">Healthy</span></div>
    <div class="card-body facts">
      <div class="fact"><span>Workspace</span><strong>Meridian Outfitters</strong></div>
      <div class="fact"><span>Region</span><strong>United Arab Emirates</strong></div>
      <div class="fact"><span>People</span><strong>8</strong></div>
      <div class="fact"><span>Connected systems</span><strong>5</strong></div>
      <div class="fact"><span>Active Solutions</span><strong>4</strong></div>
      <div class="fact"><span>Omnia team</span><strong>Client success</strong></div>
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
          ([name, meta, state]) => `
        <div class="row" style="grid-template-columns:minmax(0,1fr) auto">
          <span><strong>${name}</strong><br><span class="muted">${meta}</span></span>
          <span class="chip ${state === "Handled" ? "good" : "ghost"}">${state}</span>
        </div>`,
        )
        .join("")}
    </div>
  </section>`;
}

function viewOs() {
  return `
  <div class="view-head">
    <div>
      <h1>Manage Omnia OS</h1>
      <p>Meridian's workspace: people, systems, modules and the agents that run them.</p>
    </div>
    <div class="head-actions">
      <button class="btn" data-action="back">${ICON("i-arrow")}Back to workspace</button>
    </div>
  </div>

  <div class="os">
    <nav class="os-rail" aria-label="Omnia OS sections">
      <div class="os-rail-label">Omnia OS</div>
      <div class="os-nav">
        ${OS_NAV.map(
          ([id, label, icon]) => `
          <button data-os="${id}" ${state.osView === id ? 'aria-current="true"' : ""}>
            ${ICON(icon)}${label}
          </button>`,
        ).join("")}
      </div>
      <div class="os-rail-foot">Maintained by your Omnia team. Changes are applied with you, not to you.</div>
    </nav>
    <div class="os-body">${viewOsBody()}</div>
  </div>`;
}

/* ---------------------------------------------------------------- render */

function renderStage() {
  const stage = document.getElementById("stage");
  const html = state.os
    ? viewOs()
    : state.active === "general"
      ? viewGeneral()
      : state.active === "agents"
        ? viewAgents()
        : state.active === "orders"
          ? viewOrders()
          : state.active === "inventory"
            ? viewInventory()
            : state.active === "savings"
              ? viewSavings()
              : viewGeneral();

  stage.innerHTML = html;
  document
    .querySelector(".tabstrip")
    .classList.toggle("os-mode", Boolean(state.os));
  wireStage();
  animateStage();
}

function wireStage() {
  const stage = document.getElementById("stage");
  stage.querySelectorAll("[data-open]").forEach((el) =>
    el.addEventListener("click", () => openTab(el.dataset.open)),
  );
  stage.querySelectorAll('[data-action="call"]').forEach((el) =>
    el.addEventListener("click", () =>
      toast("Your Omnia team will reach out to schedule a call."),
    ),
  );
  stage.querySelectorAll('[data-action="export"]').forEach((el) =>
    el.addEventListener("click", () => toast("Report exported · sample data")),
  );
  stage.querySelectorAll("[data-approve]").forEach((el) =>
    el.addEventListener("click", () => {
      state.approved = true;
      state.chat[2].text =
        "Both orders are moving again. I kept the original tracking and left the customers untouched.";
      renderStage();
      toast("Released · 2 orders back in fulfilment");
    }),
  );
  stage.querySelectorAll('[data-action="adjust"]').forEach((el) =>
    el.addEventListener("click", () =>
      toast("Tell the agent what to change — nothing is released yet."),
    ),
  );
  stage.querySelectorAll("[data-approve-reorder]").forEach((el) =>
    el.addEventListener("click", () =>
      toast("Sent to your Omnia team for purchasing."),
    ),
  );
  stage.querySelectorAll("[data-action=invite], [data-action=edit-person]").forEach((el) =>
    el.addEventListener("click", () =>
      toast("Access changes are applied by your Omnia team."),
    ),
  );
  stage.querySelectorAll("[data-toggle]").forEach((el) =>
    el.addEventListener("click", () => {
      const next = el.getAttribute("aria-pressed") !== "true";
      el.setAttribute("aria-pressed", String(next));
      toast(next ? "Module enabled for the demo" : "Module paused for the demo");
    }),
  );
  stage.querySelectorAll("[data-os]").forEach((el) =>
    el.addEventListener("click", () => {
      state.osView = el.dataset.os;
      renderStage();
    }),
  );
  stage.querySelectorAll("[data-action=back]").forEach((el) =>
    el.addEventListener("click", () => {
      state.os = null;
      renderTabs();
      renderStage();
    }),
  );
  stage.querySelectorAll(".seg button").forEach((el) =>
    el.addEventListener("click", () => {
      el.parentElement
        .querySelectorAll("button")
        .forEach((b) => b.setAttribute("aria-pressed", String(b === el)));
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
      state.chat.push({ from: "user", text, meta: "Maya Ortiz · now" });
      input.value = "";
      renderStage();
      const log = document.getElementById("chatLog");
      if (log) log.scrollTop = log.scrollHeight;
      setTimeout(() => {
        state.chat.push({
          from: "agent",
          text: "Noted. In the real workspace I would work this through the connected systems and bring anything consequential back to you first.",
          meta: "Coordinator · now",
        });
        if (state.active === "agents" && !state.os) {
          renderStage();
          const next = document.getElementById("chatLog");
          if (next) next.scrollTop = next.scrollHeight;
        }
      }, 850);
    });
  }
}

function animateStage() {
  const stage = document.getElementById("stage");
  const blocks = stage.querySelectorAll(
    ".view-head, .tile, .card, .review, .stage-tile, .savings-hero, .agents > *",
  );
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (window.gsap && !reduced) {
    gsap.fromTo(
      [...blocks],
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.44, stagger: 0.035, ease: "power3.out", overwrite: true },
    );
    const line = stage.querySelector(".chart-line");
    if (line) {
      const length = line.getTotalLength ? line.getTotalLength() : 0;
      if (length) {
        gsap.fromTo(
          line,
          { strokeDasharray: length, strokeDashoffset: length },
          { strokeDashoffset: 0, duration: 1.1, ease: "power2.out" },
        );
      }
    }
    gsap.fromTo(
      [
        ...stage.querySelectorAll(
          ".tile-value, .review-count, .savings-hero strong",
        ),
      ],
      { opacity: 0.4 },
      { opacity: 1, duration: 0.5, stagger: 0.04, ease: "power2.out" },
    );
  }
}

/* ------------------------------------------------------------- chrome */

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
    if (action === "manage-os") {
      state.os = true;
      state.osView = "overview";
      renderStage();
    }
    if (action === "people") {
      state.os = true;
      state.osView = "people";
      renderStage();
    }
    if (action === "call") toast("Your Omnia team will reach out to schedule a call.");
    if (action === "notify") toast("Notifications are managed by your Omnia team.");
  });

  document.querySelectorAll('[data-action="workspace"], [data-action="notify"]').forEach((el) => {
    if (el.closest("#accountMenu")) return;
    el.addEventListener("click", () => toast("This demo shows one delivered workspace."));
  });

  // search palette
  const backdrop = document.getElementById("paletteBackdrop");
  const input = document.getElementById("paletteInput");
  const results = document.getElementById("paletteResults");
  const items = [
    ["General", "Overview", "i-grid", () => openTab("general")],
    ["Agents", "Your Omnia agents", "i-agent", () => openTab("agents")],
    ["Order Operations", "Dashboard", "i-bag", () => openTab("orders")],
    ["Inventory Control", "Dashboard", "i-boxes", () => openTab("inventory")],
    ["Savings Report", "Dashboard", "i-chart", () => openTab("savings")],
    [
      "Manage Omnia OS",
      "Workspace settings",
      "i-gear",
      () => {
        state.os = true;
        state.osView = "overview";
        renderStage();
      },
    ],
  ];

  function renderResults(query = "") {
    const q = query.toLowerCase();
    const matches = items.filter((item) => item[0].toLowerCase().includes(q));
    results.innerHTML = matches
      .map(
        ([label, meta, icon], index) => `
      <button class="palette-item ${index === 0 ? "active" : ""}" data-index="${items.indexOf(matches[index])}">
        ${ICON(icon)}<span>${label}</span><small>${meta}</small>
      </button>`,
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
  }
  function closePalette() {
    backdrop.hidden = true;
  }

  document.querySelector('[data-action="search"]').addEventListener("click", openPalette);
  input.addEventListener("input", () => renderResults(input.value));
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) closePalette();
  });

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openPalette();
    }
    if (event.key === "Escape") {
      closePalette();
      accountMenu.hidden = true;
      accountButton.setAttribute("aria-expanded", "false");
      document.getElementById("solutionsMenu").hidden = true;
      document.getElementById("tabAdd").setAttribute("aria-expanded", "false");
    }
    if (event.key === "Enter" && !backdrop.hidden) {
      const active = results.querySelector(".palette-item");
      if (active) active.click();
    }
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key.toLowerCase() === "g" && document.activeElement === document.body) {
      state.os = true;
      state.osView = "overview";
      renderStage();
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

  // keyboard tab navigation
  document.getElementById("tabs").addEventListener("keydown", (event) => {
    if (!["ArrowRight", "ArrowLeft"].includes(event.key)) return;
    const index = state.tabs.findIndex((tab) => tab.id === state.active);
    const next =
      (index + (event.key === "ArrowRight" ? 1 : -1) + state.tabs.length) %
      state.tabs.length;
    event.preventDefault();
    openTab(state.tabs[next].id);
    document.querySelector(`[data-tab="${state.tabs[next].id}"]`)?.focus();
  });
}

document.addEventListener("DOMContentLoaded", init);
