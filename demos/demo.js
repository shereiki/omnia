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
import { LOGOS } from "./logos.js";

const I = (id) => `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#${id}"></use></svg>`;

/* ------------------------------------------------------------------ data */

/* Which client this workspace belongs to. /demos/<slug> or ?client=<slug>. */
const RESERVED = new Set(["workspace", "login", "index", "demo"]);
const fromPath = (location.pathname.match(/\/demos\/([a-z0-9-]+)\/?$/) || [])[1];
const SLUG =
  new URLSearchParams(location.search).get("client") ||
  (fromPath && !RESERVED.has(fromPath) ? fromPath : "meridian");

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

const CONNECTORS = [
  ["Shopify", "Commerce", "#95BF47"], ["WooCommerce", "Commerce", "#7F54B3"], ["Magento", "Commerce", "#EE672F"],
  ["BigCommerce", "Commerce", "#121118"], ["Salla", "Commerce", "#00C48C"], ["Zid", "Commerce", "#1F6FEB"],
  ["Amazon Seller", "Commerce", "#FF9900"], ["Noon", "Commerce", "#FEEE00"], ["Namshi", "Commerce", "#F5613F"],
  ["Trendyol", "Commerce", "#F27A1A"], ["Shopware", "Commerce", "#189EFF"], ["PrestaShop", "Commerce", "#DF0067"],
  ["Stripe", "Payments", "#635BFF"], ["Adyen", "Payments", "#0ABF53"], ["Checkout.com", "Payments", "#0F2A6B"],
  ["PayPal", "Payments", "#003087"], ["Telr", "Payments", "#00A5A8"], ["Ziina", "Payments", "#5B45D6"],
  ["Tabby", "Payments", "#3EEDBF"], ["Tamara", "Payments", "#FFC93C"], ["Mamo", "Payments", "#0E2A47"],
  ["PayTabs", "Payments", "#1E88E5"], ["Network International", "Payments", "#0B5FA5"], ["Paymob", "Payments", "#FF4D4D"],
  ["QuickBooks", "Finance", "#2CA01C"], ["Xero", "Finance", "#13B5EA"], ["Zoho Books", "Finance", "#E42527"],
  ["Wafeq", "Finance", "#6C5CE7"], ["Tally", "Finance", "#0B4D8A"], ["SAP", "Finance", "#0FAAFF"],
  ["Oracle NetSuite", "Finance", "#C74634"], ["Sage", "Finance", "#00D639"], ["FreshBooks", "Finance", "#0075DD"],
  ["HubSpot", "CRM", "#FF7A59"], ["Salesforce", "CRM", "#00A1E0"], ["Pipedrive", "CRM", "#017737"],
  ["Zoho CRM", "CRM", "#E42527"], ["Monday CRM", "CRM", "#FF3D57"], ["Close", "CRM", "#4B4BFF"],
  ["Attio", "CRM", "#2F6BFF"], ["Copper", "CRM", "#C76A29"], ["Freshsales", "CRM", "#2E7BF6"],
  ["Google Workspace", "Productivity", "#4285F4"], ["Microsoft 365", "Productivity", "#0078D4"],
  ["Slack", "Productivity", "#4A154B"], ["Zoom", "Productivity", "#2D8CFF"], ["Notion", "Productivity", "#111111"],
  ["Asana", "Productivity", "#FF6B6B"], ["Trello", "Productivity", "#0079BF"], ["ClickUp", "Productivity", "#7B68EE"],
  ["Airtable", "Productivity", "#FCB400"], ["Coda", "Productivity", "#F46A54"], ["Calendly", "Productivity", "#006BFF"],
  ["DocuSign", "Productivity", "#FFCC22"], ["Figma", "Productivity", "#F24E1E"],
  ["WhatsApp Business", "Messaging", "#25D366"], ["Twilio", "Messaging", "#F22F46"], ["MessageBird", "Messaging", "#2D6BFF"],
  ["Intercom", "Messaging", "#1F8DED"], ["Zendesk", "Messaging", "#03363D"], ["Freshdesk", "Messaging", "#25C16F"],
  ["Front", "Messaging", "#001B38"], ["Telegram", "Messaging", "#26A5E4"], ["Gmail", "Messaging", "#EA4335"],
  ["Outlook", "Messaging", "#0F6CBD"], ["SendGrid", "Messaging", "#1A82E2"], ["Resend", "Messaging", "#111111"],
  ["Meta", "Marketing", "#0866FF"], ["Google Ads", "Marketing", "#34A853"], ["TikTok Ads", "Marketing", "#000000"],
  ["LinkedIn Ads", "Marketing", "#0A66C2"], ["Klaviyo", "Marketing", "#111111"], ["Mailchimp", "Marketing", "#FFE01B"],
  ["Braze", "Marketing", "#3B2A56"], ["Customer.io", "Marketing", "#5C2EE5"], ["Segment", "Marketing", "#52BD94"],
  ["Mixpanel", "Analytics", "#7856FF"], ["Amplitude", "Analytics", "#1E61F0"], ["Looker", "Analytics", "#4285F4"],
  ["Power BI", "Analytics", "#F2C811"], ["Tableau", "Analytics", "#E97627"], ["PostHog", "Analytics", "#F54E00"],
  ["Metabase", "Analytics", "#509EE3"], ["Fivetran", "Data", "#0073FF"], ["Airbyte", "Data", "#615EFF"],
  ["Snowflake", "Data", "#29B5E8"], ["BigQuery", "Data", "#4285F4"], ["Redshift", "Data", "#8C4FFF"],
  ["Databricks", "Data", "#FF3621"], ["Neon", "Data", "#00E599"], ["Supabase", "Data", "#3ECF8E"],
  ["MongoDB", "Data", "#47A248"], ["PostgreSQL", "Data", "#4169E1"], ["MySQL", "Data", "#4479A1"],
  ["Shopify POS", "Operations", "#5E8E3E"], ["Lightspeed", "Operations", "#FF0000"], ["Square", "Operations", "#000000"],
  ["Foodics", "Operations", "#27AE60"], ["Toast", "Operations", "#FF4C00"], ["Zoho Inventory", "Operations", "#E42527"],
  ["Cin7", "Operations", "#2D9CDB"], ["Fishbowl", "Operations", "#1B7A43"], ["Katana", "Operations", "#5C4EE5"],
  ["SAP Business One", "ERP", "#0FAAFF"], ["Odoo", "ERP", "#714B67"], ["Microsoft Dynamics", "ERP", "#002050"],
  ["Epicor", "ERP", "#0057B8"], ["Infor", "ERP", "#FF5000"], ["Acumatica", "ERP", "#00A3E0"],
  ["Workday", "HR", "#0875E1"], ["BambooHR", "HR", "#71B532"], ["Personio", "HR", "#0A0A0A"],
  ["Zenefits", "HR", "#FF4E00"], ["Deel", "HR", "#1D4ED8"], ["Gusto", "HR", "#F45D48"],
  ["Jira", "Engineering", "#0052CC"], ["GitHub", "Engineering", "#181717"], ["GitLab", "Engineering", "#FC6D26"],
  ["Linear", "Engineering", "#5E6AD2"], ["Sentry", "Engineering", "#362D59"], ["Datadog", "Engineering", "#632CA6"],
  ["PagerDuty", "Engineering", "#06AC38"], ["Vercel", "Engineering", "#000000"], ["Cloudflare", "Engineering", "#F38020"],
  ["AWS S3", "Storage", "#569A31"], ["Google Drive", "Storage", "#0F9D58"], ["Dropbox", "Storage", "#0061FF"],
  ["Box", "Storage", "#0061D5"], ["OneDrive", "Storage", "#0078D4"], ["SharePoint", "Storage", "#038387"],
  ["DocuWare", "Documents", "#0B4C8C"], ["PandaDoc", "Documents", "#3B2B6B"], ["Concord", "Documents", "#FF6B57"],
  ["Twilio Flex", "Support", "#F22F46"], ["Gladly", "Support", "#3060CF"], ["Kustomer", "Support", "#3E7BFA"],
  ["Gorgias", "Support", "#0F1B2D"], ["Re:amaze", "Support", "#00C2A8"], ["Crisp", "Support", "#1972F5"],
  ["DHL", "Logistics", "#FFCC00"], ["Aramex", "Logistics", "#E4002B"], ["FedEx", "Logistics", "#4D148C"],
  ["UPS", "Logistics", "#351C15"], ["SMSA", "Logistics", "#00594F"], ["Fetchr", "Logistics", "#00C4B3"],
  ["ShipStation", "Logistics", "#1E90FF"], ["Shippo", "Logistics", "#0EA5E9"], ["EasyPost", "Logistics", "#2C3E50"],
  ["Onfleet", "Logistics", "#2196F3"], ["Bringoz", "Logistics", "#0B7A75"], ["Locus", "Logistics", "#4F46E5"],
  ["SAP SuccessFactors", "HR", "#0FAAFF"], ["Zoho People", "HR", "#E42527"], ["HiBob", "HR", "#E6007E"],
  ["Zapier", "Automation", "#FF4F00"], ["Make", "Automation", "#6D00CC"], ["n8n", "Automation", "#EA4B71"],
  ["Workato", "Automation", "#00A3E0"], ["Tray", "Automation", "#0A2540"], ["Retool", "Automation", "#3D3D3D"],
  ["Twake", "Productivity", "#0057FF"], ["Grafana", "Analytics", "#F46800"], ["Elastic", "Analytics", "#005571"],
  ["Algolia", "Search", "#003DFF"], ["Typesense", "Search", "#C2211D"], ["Meilisearch", "Search", "#FF5CAA"],
  ["Stripe Tax", "Finance", "#635BFF"], ["Avalara", "Finance", "#00A651"], ["TaxJar", "Finance", "#2E86AB"],
  ["Payoneer", "Payments", "#FF4800"], ["Wise", "Payments", "#9FE870"], ["Revolut Business", "Payments", "#0666EB"],
  ["Emirates NBD", "Banking", "#00263A"], ["Mashreq", "Banking", "#E4002B"], ["HSBC", "Banking", "#DB0011"],
  ["First Abu Dhabi Bank", "Banking", "#0033A0"], ["Riyad Bank", "Banking", "#00539F"], ["Al Rajhi", "Banking", "#005EAB"],
];

/* Product families: one vendor, many connectors. This is where the catalogue
   gets its size without inventing companies. */
const FAMILIES = [
  ["Shopify", "Commerce", "#95BF47", ["Payments", "POS", "Plus", "Markets", "Flow", "Fulfilment"]],
  ["Zoho", "CRM", "#E42527", ["CRM", "Books", "Inventory", "People", "Desk", "Projects", "Recruit", "Analytics", "Campaigns", "Flow"]],
  ["Microsoft", "Productivity", "#0078D4", ["Dynamics 365 Sales", "Dynamics 365 Finance", "Dynamics 365 Supply Chain", "Dynamics 365 Commerce", "Business Central", "Power BI", "Power Automate", "Teams", "SharePoint", "Outlook", "Excel", "Azure SQL", "Azure Blob", "Entra ID"]],
  ["Google", "Productivity", "#4285F4", ["Workspace", "Sheets", "Calendar", "Drive", "Analytics 4", "BigQuery", "Cloud Storage", "Pub/Sub", "Looker Studio", "Firebase"]],
  ["Salesforce", "CRM", "#00A1E0", ["Sales Cloud", "Service Cloud", "Marketing Cloud", "Commerce Cloud", "Experience Cloud", "Tableau", "MuleSoft", "Slack", "Pardot"]],
  ["SAP", "ERP", "#0FAAFF", ["S/4HANA", "Business One", "ByDesign", "Ariba", "Concur", "SuccessFactors", "Customer Checkout", "Fieldglass", "Commerce Cloud", "Emarsys"]],
  ["Oracle", "ERP", "#C74634", ["NetSuite", "Fusion ERP", "Fusion HCM", "Fusion CX", "Primavera", "Responsys", "Eloqua", "Retail Xstore"]],
  ["Adobe", "Marketing", "#FF0000", ["Commerce", "Experience Manager", "Analytics", "Campaign", "Marketo Engage", "Sign", "Target", "Real-Time CDP"]],
  ["Stripe", "Payments", "#635BFF", ["Payments", "Billing", "Connect", "Tax", "Terminal", "Radar", "Treasury", "Invoicing"]],
  ["Twilio", "Messaging", "#F22F46", ["SMS", "Voice", "Flex", "SendGrid", "Segment", "Verify", "Studio", "WhatsApp"]],
  ["Amazon", "Engineering", "#FF9900", ["S3", "RDS", "Redshift", "Lambda", "SQS", "EventBridge", "Kinesis", "Glue", "SES", "DynamoDB", "Seller Central", "SP-API"]],
  ["Meta", "Marketing", "#0866FF", ["Business Suite", "Messenger", "Instagram Shop", "WhatsApp Cloud", "Conversions API", "Audience Network"]],
  ["HubSpot", "CRM", "#FF7A59", ["Marketing Hub", "Sales Hub", "Service Hub", "CMS Hub", "Operations Hub", "Commerce Hub"]],
  ["Atlassian", "Engineering", "#0052CC", ["Jira Software", "Jira Service Management", "Confluence", "Bitbucket", "Trello", "Opsgenie"]],
  ["Intuit", "Finance", "#236CFF", ["QuickBooks Online", "QuickBooks Payroll", "QuickBooks Commerce", "TurboTax Business", "Mailchimp", "Credit Karma"]],
  ["Xero", "Finance", "#13B5EA", ["Accounting", "Payroll", "Projects", "Invoicing", "Bank Feeds", "Expenses"]],
  ["WooCommerce", "Commerce", "#7F54B3", ["Payments", "Subscriptions", "Bookings", "Memberships", "Shipping", "Tax"]],
  ["BigCommerce", "Commerce", "#121118", ["Storefront", "B2B Edition", "Multi-Storefront", "Payments", "Shipping"]],
  ["Magento", "Commerce", "#EE672F", ["Adobe Commerce", "Open Source", "B2B", "Page Builder", "Live Search"]],
  ["PayPal", "Payments", "#003087", ["Checkout", "Braintree", "Payflow", "Working Capital", "Payouts", "Invoicing"]],
  ["Adyen", "Payments", "#0ABF53", ["Online", "POS", "MarketPay", "Issuing", "Risk", "Data"]],
  ["Square", "Operations", "#000000", ["Payments", "POS", "Invoices", "Team", "Online Store", "Banking"]],
  ["Zendesk", "Support", "#03363D", ["Support", "Chat", "Talk", "Guide", "Explore", "Sell"]],
  ["Intercom", "Messaging", "#1F8DED", ["Messenger", "Help Desk", "Tickets", "Fin", "Outbound", "Reports"]],
  ["Notion", "Productivity", "#111111", ["Docs", "Databases", "Projects", "Wiki", "Calendar", "AI"]],
  ["Airtable", "Productivity", "#FCB400", ["Bases", "Interfaces", "Automations", "Sync", "Marketplace"]],
  ["Dropbox", "Storage", "#0061FF", ["Files", "Paper", "Sign", "Replay", "Capture"]],
  ["Mailchimp", "Marketing", "#FFE01B", ["Marketing", "Journeys", "Transactional", "Audience", "Surveys"]],
  ["Klaviyo", "Marketing", "#111111", ["Email", "SMS", "Flows", "Segments", "Reviews"]],
  ["Meta Ads", "Marketing", "#0866FF", ["Campaigns", "Catalog", "Pixel", "Custom Audiences", "Insights"]],
  ["Google Ads", "Marketing", "#34A853", ["Search", "Performance Max", "Shopping", "Display", "Offline Conversions"]],
  ["Sage", "Finance", "#00D639", ["Business Cloud", "Intacct", "X3", "50", "Payroll", "HR"]],
  ["Freshworks", "Support", "#25C16F", ["Freshdesk", "Freshservice", "Freshsales", "Freshchat", "Freshmarketer"]],
  ["Zoho Analytics", "Analytics", "#E42527", ["Dashboards", "Data Sources", "Query Tables", "White Label"]],
  ["Snowflake", "Data", "#29B5E8", ["Warehouse", "Data Sharing", "Snowpark", "Streams", "Tasks"]],
  ["Databricks", "Data", "#FF3621", ["Lakehouse", "SQL Warehouse", "Delta Live Tables", "Unity Catalog"]],
  ["MongoDB", "Data", "#47A248", ["Atlas", "Realm", "Charts", "Data Lake"]],
  ["Elastic", "Search", "#005571", ["Search", "Observability", "Security", "Workplace Search"]],
  ["Algolia", "Search", "#003DFF", ["Search", "Recommend", "Personalisation", "Insights"]],
  ["Okta", "Security", "#007DC1", ["SSO", "MFA", "Lifecycle Management", "Workflows"]],
  ["Auth0", "Security", "#EB5424", ["Universal Login", "Actions", "Organizations", "MFA"]],
  ["Workday", "HR", "#0875E1", ["HCM", "Payroll", "Financials", "Recruiting", "Learning"]],
  ["BambooHR", "HR", "#71B532", ["Core HR", "Payroll", "Hiring", "Performance", "Time Off"]],
  ["Deel", "HR", "#1D4ED8", ["EOR", "Contractors", "Payroll", "HRIS", "Compliance"]],
  ["DHL", "Logistics", "#FFCC00", ["Express", "Parcel", "Freight", "eCommerce", "Tracking"]],
  ["Aramex", "Logistics", "#E4002B", ["Domestic", "International", "Freight", "Tracking", "Shop & Ship"]],
  ["FedEx", "Logistics", "#4D148C", ["Express", "Ground", "Freight", "Ship Manager", "Tracking"]],
  ["UPS", "Logistics", "#351C15", ["Small Parcel", "Freight", "Mail Innovations", "Tracking", "Quantum View"]],
  ["SAP Concur", "Finance", "#0FAAFF", ["Expense", "Travel", "Invoice", "Request"]],
  ["Stripe Connect", "Payments", "#635BFF", ["Accounts", "Payouts", "Onboarding", "Radar"]],
  ["Fivetran", "Data", "#0073FF", ["Connectors", "Transformations", "HVR", "Activations"]],
  ["Airbyte", "Data", "#615EFF", ["Cloud", "Self-Managed", "Connector Builder", "CDC"]],
  ["PostHog", "Analytics", "#F54E00", ["Product Analytics", "Session Replay", "Feature Flags", "Experiments"]],
  ["Sentry", "Engineering", "#362D59", ["Errors", "Performance", "Replays", "Crons"]],
  ["Datadog", "Engineering", "#632CA6", ["APM", "Logs", "Metrics", "RUM", "Synthetics"]],
  ["PagerDuty", "Engineering", "#06AC38", ["Incidents", "On-Call", "Automation", "Status Pages"]],
  ["Vercel", "Engineering", "#000000", ["Deployments", "Edge Config", "Analytics", "Log Drains"]],
  ["Cloudflare", "Engineering", "#F38020", ["Workers", "R2", "D1", "Queues", "Zero Trust"]],
  ["GitHub", "Engineering", "#181717", ["Repositories", "Actions", "Issues", "Projects", "Packages"]],
  ["GitLab", "Engineering", "#FC6D26", ["Repositories", "CI/CD", "Issues", "Epics", "Registry"]],
];

const REGIONAL = [
  ["Emirates NBD Business", "Banking", "#00263A"], ["ADCB", "Banking", "#C8102E"], ["Dubai Islamic Bank", "Banking", "#00693E"],
  ["Mashreq NeoBiz", "Banking", "#E4002B"], ["FAB", "Banking", "#0033A0"], ["Riyad Bank", "Banking", "#00539F"],
  ["Al Rajhi Business", "Banking", "#005EAB"], ["SNB AlAhli", "Banking", "#00843D"], ["QNB", "Banking", "#5C0632"],
  ["KFH", "Banking", "#0C2340"], ["HSBC UAE", "Banking", "#DB0011"], ["Standard Chartered", "Banking", "#0473EA"],
  ["Citibank MENA", "Banking", "#003B70"], ["Arab Bank", "Banking", "#FDB913"], ["Bank Muscat", "Banking", "#00843D"],
  ["Careem Business", "Logistics", "#3EDC81"], ["Fetchr", "Logistics", "#00C4B3"], ["SMSA Express", "Logistics", "#00594F"],
  ["Naqel", "Logistics", "#00447C"], ["Aramex Freight", "Logistics", "#E4002B"], ["Bosta", "Logistics", "#FF3D00"],
  ["Talabat", "Commerce", "#FF5A00"], ["Noon Minutes", "Commerce", "#FEEE00"], ["Amazon.ae", "Commerce", "#FF9900"],
  ["Namshi Seller", "Commerce", "#F5613F"], ["Ounass", "Commerce", "#000000"], ["6thStreet", "Commerce", "#E4002B"],
  ["Salla Merchant", "Commerce", "#00C48C"], ["Zid Store", "Commerce", "#1F6FEB"], ["Foodics POS", "Operations", "#27AE60"],
  ["Marn", "Operations", "#0E9F6E"], ["Posist", "Operations", "#FF6B00"], ["Loyverse", "Operations", "#2196F3"],
  ["Wafeq Accounting", "Finance", "#6C5CE7"], ["Daftra", "Finance", "#FF5252"], ["Qoyod", "Finance", "#00B894"],
  ["Zoho Books ME", "Finance", "#E42527"], ["Etisalat SMS", "Messaging", "#00A651"], ["du Business", "Messaging", "#E60000"],
  ["Mobily", "Messaging", "#00A9E0"], ["STC Business", "Messaging", "#4F008C"], ["Unifonic", "Messaging", "#FF4D00"],
  ["Msegat", "Messaging", "#0F766E"], ["WhatsApp Business API", "Messaging", "#25D366"], ["Telegram Bot", "Messaging", "#26A5E4"],
];

const EXPANDED = [
  ...CONNECTORS,
  ...FAMILIES.flatMap(([brand, cat, colour, products]) =>
    products.map((product) => [`${brand} · ${product}`, cat, colour]),
  ),
  ...REGIONAL,
];

const CONNECTOR_CATEGORIES = ["All", ...new Set(EXPANDED.map(([, c]) => c))];

/* What each agent is actually doing, shown above its chat. */
const AGENT_WORK = {
  coordinator: { task: "Holding two Riyadh orders for your approval", steps: ["Read the order history", "Checked the price floor", "Prepared a decision"], queue: ["2 orders waiting on you", "1 stock reorder draft"] },
  orders: { task: "Matching new orders to stock", steps: ["Pulled 11 new orders", "Matched against stock", "Queued 9 for fulfilment"], queue: ["2 orders need a phone number"] },
  inventory: { task: "Watching cover on 6 SKUs", steps: ["Read sell-through", "Compared against lead time", "Drafted 2 reorders"], queue: ["2 reorder drafts"] },
  replies: { task: "Answering customer questions", steps: ["Matched approved knowledge", "Answered 14 conversations", "Escalated 2 to a person"], queue: ["2 escalations for Jordan"] },
  dispatch: { task: "Tendering two unassigned loads", steps: ["Shortlisted 3 carriers", "Checked the rate floor", "Waiting on your call"], queue: ["2 loads to tender", "1 border audit"] },
  quotes: { task: "Drafting overnight quote requests", steps: ["Read 9 requests", "Priced against lane cost", "Sent 7, held 2"], queue: ["2 below the floor"] },
  drivers: { task: "Tracking driver hours", steps: ["Checked 6 rosters", "Flagged one at 46/48h", "Drafted a swap"], queue: ["1 overtime approval"] },
  exceptions: { task: "Working a damaged pallet claim", steps: ["Pulled gate logs", "Matched timestamps", "Drafted a claim"], queue: ["1 claim for review"] },
  frontdesk: { task: "Confirming tomorrow's bookings", steps: ["Read 14 overnight requests", "Booked 11", "Moved 3 to open slots"], queue: ["3 moved bookings"] },
  scheduling: { task: "Fitting an urgent referral", steps: ["Checked 48h window", "Found two gaps", "Prepared a decision"], queue: ["1 urgent fit"] },
  reminders: { task: "Sending tomorrow's confirmations", steps: ["Built the list", "Sent 96 reminders", "61 confirmed"], queue: ["26 not answered"] },
  billing: { task: "Answering billing questions", steps: ["Read 6 threads", "Explained 4 invoices", "Held 1 waiver"], queue: ["1 fee waiver for you"] },
};

const controls = new Map();
function controlFor(id) {
  if (!controls.has(id)) controls.set(id, { autonomy: "Act, then tell me", paused: false, quiet: false });
  return controls.get(id);
}

const state = {
  tabs: [
    { id: "general", pinned: true },
    { id: "agents" },
    { id: "decisions" },
    ...CLIENT.views.map((v) => ({ id: v.id })),
  ],
  dock: { open: false, view: "requests", thread: null },
  active: "general",
  os: false,
  osView: "overview",
  period: "7d",
  connectorQuery: "",
  connectorCategory: "All",
  connectorExpanded: false,
  chats: {},
  agentPending: false,
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

function toast(message, tone = "") {
  const el = document.getElementById("toast");
  el.className = `toast${tone ? ` ${tone}` : ""}`;
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
  { id: "agents", label: "Agents", icon: "i-agent" },
  { id: "decisions", label: "Decisions", icon: "i-shield" },
  ...CLIENT.views.map((v) => ({ id: v.id, label: v.label, icon: v.icon })),
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
      if (Math.abs(event.clientX - drag.startX) < 14) return;
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

    drag.reordered = true;
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
    if (drag.moved && drag.reordered) {
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

  <section class="demo-banner">
    <span class="demo-badge">Demo</span>
    <div class="demo-banner-copy">
      <strong>This is an agent-run workspace</strong>
      <span>Sample data throughout. The agents are live — talk to one and it answers about its own work.</span>
    </div>
    <button class="btn primary sm" data-open-ask>Talk to an agent${I("i-arrow")}</button>
  </section>

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
  document.getElementById("askButton")?.setAttribute("aria-expanded", String(view === "ask"));
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
    document.getElementById("askButton")?.setAttribute("aria-expanded", "false");
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

function agentHistory(agent) {
  if (!state.chats[agent.id]) {
    state.chats[agent.id] = agent.thread.slice(-2).map((m) => ({
      role: m.from === "user" ? "user" : "assistant",
      content: m.text,
      meta: m.meta,
      tool: m.tool,
    }));
  }
  return state.chats[agent.id];
}

function agentBubble(message) {
  const who = message.role === "user" ? "Maya" : "Agent";
  return `<div class="chat-line ${message.role}">
    <div class="chat-bubble">
      ${message.tool ? `<div class="chat-tool">${I("i-check")}${message.tool}</div>` : ""}
      ${message.content}
      <span class="chat-meta">${message.meta || who}</span>
    </div>
  </div>`;
}

function paintAgentChat() {
  const log = document.getElementById("agentChatLog");
  const agent = AGENTS.find((a) => a.id === state.agentId) || AGENTS[0];
  if (!log) return;
  const control = controlFor(agent.id);
  log.innerHTML =
    agentHistory(agent).map(agentBubble).join("") +
    (state.agentPending ? '<div class="chat-line assistant"><div class="chat-bubble typing"><span class="dots"><i></i><i></i><i></i></span></div></div>' : "");
  log.scrollTop = log.scrollHeight;
  const status = document.getElementById("agentChatStatus");
  if (status)
    status.textContent = control.paused ? "Paused" : agent.status === "live" ? "Working now" : "Idle";
}

function askAgentBody(text) {
  const agent = AGENTS.find((a) => a.id === state.agentId) || AGENTS[0];
  const history = agentHistory(agent);
  history.push({ role: "user", content: text, meta: "You · now" });
  state.agentPending = true;
  paintAgentChat();

  askAssistant(
    history.map((m) => ({ role: m.role, content: m.content })).slice(-8),
    agent.name,
  )
    .then((result) => {
      history.push({
        role: "assistant",
        content: result.error || result.reply,
        meta: `${agent.name} · now`,
      });
    })
    .catch(() => {
      history.push({ role: "assistant", content: "Could not reach the assistant.", meta: "now" });
    })
    .finally(() => {
      state.agentPending = false;
      paintAgentChat();
    });
}

function dockAgents() {
  const agent = AGENTS.find((a) => a.id === state.agentId) || AGENTS[0];
  const control = controlFor(agent.id);
  return `
    <div class="chat-shell">
      <div class="chat-picks" role="tablist" aria-label="Agents">
        ${AGENTS.map(
          (a) => `<button class="chat-pick ${a.id === agent.id ? "selected" : ""}" data-dock-agent="${a.id}" role="tab" aria-selected="${a.id === agent.id}">
            <i class="status-dot ${a.status === "idle" ? "idle" : "live"}"></i>${a.name}
          </button>`,
        ).join("")}
      </div>

      <header class="chat-top">
        <span class="agent-avatar">${I(agent.icon)}</span>
        <div class="chat-top-copy">
          <strong>${agent.name}</strong>
          <span id="agentChatStatus">${control.paused ? "Paused" : agent.status === "live" ? "Working now" : "Idle"}</span>
        </div>
        <button class="chip ghost" data-open-os-agents>${I("i-gear")}Settings</button>
      </header>

      <div class="agent-work">
        <span class="agent-work-label"><i class="live-dot"></i>Working on</span>
        <strong>${(AGENT_WORK[agent.id] || {}).task || "Working through today's queue"}</strong>
        <ol class="agent-steps">
          ${((AGENT_WORK[agent.id] || {}).steps || []).map(
            (step, i) => `<li class="${i === 0 ? "done" : i === 1 ? "done" : "current"}"><i></i>${step}</li>`,
          ).join("")}
        </ol>
        <div class="agent-queue">
          ${((AGENT_WORK[agent.id] || {}).queue || []).map((q) => `<span class="agent-queue-chip">${q}</span>`).join("")}
        </div>
      </div>

      <div class="chat-body" id="agentChatLog"></div>

      <div class="chat-quick">
        ${["What are you working on?", "What needs my decision?", "What would you do next?"]
          .map((q) => `<button data-agent-ask="${q}">${q}</button>`)
          .join("")}
      </div>

      <form class="chat-composer" id="agentAskForm">
        <input id="agentAskInput" placeholder="Message ${agent.name}…" autocomplete="off" />
        <button type="submit" aria-label="Send">${I("i-send")}</button>
      </form>
    </div>`;
}

/* ---------------------------------------------------------- live assistant */

const askHistory = [];
let askPending = false;
let askTargetId = "askThread";

function chatBubble(role, text) {
  return `<div class="ask-msg ${role}">${text}</div>`;
}

async function askAssistant(messages, agent) {
  try {
    const response = await fetch("/api/demo/ask", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages, agent, session: "omnia-demo" }),
      signal: AbortSignal.timeout(40000),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok)
      return { error: data.error || "The assistant did not answer.", code: data.code };
    return { reply: data.reply };
  } catch {
    return { error: "Could not reach the assistant. Try again in a moment.", code: "network" };
  }
}

function renderAskThread() {
  const target = document.getElementById(askTargetId) || document.getElementById("askThread");
  if (!target) return;
  target.innerHTML =
    askHistory.map((m) => chatBubble(m.role === "user" ? "user" : "assistant", m.content)).join("") +
    (askPending
      ? '<div class="ask-msg assistant typing"><span class="dots"><i></i><i></i><i></i></span></div>'
      : "");
  target.scrollTop = target.scrollHeight;
}

async function sendTo(logEl, text) {
  if (askPending || !text.trim()) return;
  askTargetId = logEl?.id || "askThread";
  askPending = true;
  askHistory.push({ role: "user", content: text.trim() });
  renderAskThread();

  const result = await askAssistant(askHistory.slice(-8));
  askPending = false;
  askHistory.push({
    role: "assistant",
    content: result.error || result.reply,
  });
  renderAskThread();
}

function viewAgentsPage() {
  const agent = AGENTS.find((a) => a.id === state.agentId) || AGENTS[0];
  const work = AGENT_WORK[agent.id] || { task: "Working through today's queue", steps: [], queue: [] };
  const control = controlFor(agent.id);
  return `
  <div class="view-head">
    <div><h1>Agents</h1><p>Four agents working this workspace. Each shows what it is doing, and stops at a decision.</p></div>
    <div class="head-actions">
      <span class="chip good">${AGENTS.filter((a) => a.status === "live").length} running</span>
      <button class="btn sm" data-os-open="agents">${I("i-gear")}Settings</button>
    </div>
  </div>

  <div class="agents-page">
    <aside class="agents-rail">
      ${AGENTS.map(
        (a) => `<button class="agents-rail-item ${a.id === agent.id ? "selected" : ""}" data-dock-agent="${a.id}">
          <span class="agent-avatar">${I(a.icon)}</span>
          <span class="agents-rail-copy"><strong>${a.name}</strong><small>${a.scope}</small></span>
          <i class="status-dot ${a.status === "idle" ? "idle" : "live"}"></i>
        </button>`,
      ).join("")}
      <p class="agents-rail-note">Agents can be paused or given more autonomy in Settings.</p>
    </aside>

    <section class="agents-main">
      <header class="agents-head">
        <div><strong>${agent.name}</strong><span>${control.paused ? "Paused" : agent.status === "live" ? "Working now" : "Idle"} · ${agent.autonomy}</span></div>
        <span class="chip ${agent.status === "live" ? "good" : "ghost"}">${agent.status === "live" ? "Running" : "Idle"}</span>
      </header>

      <div class="agents-work">
        <span class="agent-work-label"><i class="live-dot"></i>Working on</span>
        <strong>${work.task}</strong>
        <ol class="agent-steps">
          ${work.steps.map((step, i) => `<li class="${i < work.steps.length - 1 ? "done" : "current"}"><i></i>${step}</li>`).join("")}
        </ol>
        <div class="agent-queue">${work.queue.map((q) => `<span class="agent-queue-chip">${q}</span>`).join("")}</div>
      </div>

      <div class="agents-chat">
        <div class="chat-body" id="agentChatLog"></div>
        <div class="chat-quick">
          ${["What are you working on?", "What needs my decision?", "What would you do next?"]
            .map((q) => `<button data-agent-ask="${q}">${q}</button>`)
            .join("")}
        </div>
        <form class="chat-composer" id="agentAskForm">
          <input id="agentAskInput" placeholder="Message ${agent.name}…" autocomplete="off" />
          <button type="submit" aria-label="Send">${I("i-send")}</button>
        </form>
      </div>
    </section>

    <aside class="agents-side">
      <section class="card">
        <div class="card-head"><div><h2>Today</h2><small>${agent.name}</small></div></div>
        <div class="card-body rows">
          <div class="row row-static"><span class="muted">Runs</span><strong>${fmt.n(agent.stats.runs)}</strong></div>
          <div class="row row-static"><span class="muted">Raised to you</span><strong>${agent.stats.approval}</strong></div>
          <div class="row row-static"><span class="muted">Success</span><strong>${agent.stats.success}</strong></div>
        </div>
      </section>
      <section class="card">
        <div class="card-head"><div><h2>Rules</h2><small>What it may decide alone</small></div></div>
        <div class="card-body">
          <div class="guardrails">
            <span class="guard">${I("i-shield")}${agent.autonomy}</span>
            <span class="guard">${I("i-shield")}Cost and customers go to Decisions</span>
          </div>
          <div class="agent-tools-list" style="margin-top:10px">
            ${agent.tools.map((t) => `<span class="tool-chip">${t}</span>`).join("")}
          </div>
        </div>
      </section>
    </aside>
  </div>`;
}

function dockAsk() {
  return `
    <div class="ask-head">
      <span class="ask-mark">${I("i-spark")}</span>
      <div><strong>Ask Omnia</strong><span>What we can build, how it would work, what it costs you.</span></div>
    </div>
    <div class="ask-suggestions">
      ${[
        "What would Omnia do for a wholesaler with three warehouses?",
        "How do decisions and approvals actually work?",
        "Can you connect our ERP and our courier?",
        "What does a first month look like?",
      ]
        .map((q) => `<button class="ask-chip" data-ask-prompt="${q}">${q}</button>`)
        .join("")}
    </div>
    <div class="ask-thread" id="askThread"></div>
    <form class="composer" id="askForm">
      <input id="askInput" placeholder="Ask anything about Omnia…" autocomplete="off" />
      <button class="send" type="submit" aria-label="Send">${I("i-send")}</button>
    </form>
    <p class="chat-hint"><i></i>Live answers · ask it something real</p>`;
}

function wireDockDelegate() {
  const body = document.getElementById("dockBody");
  if (!body || body.dataset.delegated) return;
  body.dataset.delegated = "1";
  body.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-ask-prompt]");
    if (!chip) return;
    const thread = document.getElementById("askThread");
    if (thread) sendTo(thread, chip.dataset.askPrompt);
  });
  body.addEventListener("submit", (event) => {
    const form = event.target.closest("#askForm");
    if (!form) return;
    event.preventDefault();
    const input = document.getElementById("askInput");
    const text = input?.value.trim();
    if (!text) return;
    input.value = "";
    const thread = document.getElementById("askThread");
    if (thread) sendTo(thread, text);
  });
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
        : view === "ask"
          ? `<div class="dock-title-copy"><strong>Ask Omnia</strong><span>Live answers about what we build</span></div>`
          : `<div class="dock-title-copy">${engineerAvatar("sm")}<div><strong>${ENGINEER.name}</strong><span>${ENGINEER.role}</span></div></div>`;
  }
  wireDockDelegate();
  body.innerHTML =
    view === "agents"
      ? dockAgents()
      : view === "ask"
        ? dockAsk()
        : state.dock.thread
          ? dockThread()
          : dockRequests();

  if (false) {
    body.querySelectorAll("[data-open-os-agents]").forEach((el) =>
    el.addEventListener("click", () => {
      closeDock();
      state.os = true;
      state.osView = "agents";
      renderStage();
    }),
  );
  body.querySelectorAll("[data-agent-ask]").forEach((chip) =>
      chip.addEventListener("click", () => askAgentBody(chip.dataset.agentAsk)),
    );
  }

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

  const agentForm = document.getElementById("agentAskForm");
  if (agentForm) {
    agentForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = document.getElementById("agentAskInput");
      const text = input.value.trim();
      if (!text) return;
      input.value = "";
      askAgentBody(text);
    });
  }

  const askThread = document.getElementById("askThread");
  if (askThread) {
    askThread.innerHTML = askHistory
      .map((m) => chatBubble(m.role === "user" ? "user" : "assistant", m.content))
      .join("");


  }
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

/* ------------------------------------------------- three different shops
   Logistics and clinics are not retail with new words on it: each brings its
   own boards. */

/* ------------------------------------------------ one signature each */

function viewTracker() {
  const point = (t) => [
    t.from[0] + (t.to[0] - t.from[0]) * t.progress,
    t.from[1] + (t.to[1] - t.from[1]) * t.progress,
  ];
  return `
  <div class="view-head">
    <div><h1>Live map</h1><p>Every load on the road, where it actually is.</p></div>
    <div class="head-actions"><span class="chip good">${CLIENT.trucks.filter((t) => t.status !== "Delivered").length} moving</span></div>
  </div>
  <div class="tracker">
    <section class="tracker-map">
      <svg viewBox="0 0 700 430" role="img" aria-label="Loads moving between cities">
        <rect x="0" y="0" width="700" height="430" rx="18" fill="#f7f4fd" />
        ${CLIENT.trucks
          .map((t) => `<line x1="${t.from[0]}" y1="${t.from[1]}" x2="${t.to[0]}" y2="${t.to[1]}"
            stroke="#ded5f8" stroke-width="2.5" stroke-dasharray="6 6" stroke-linecap="round" />`)
          .join("")}
        ${CLIENT.cities
          .map(
            (c) => `<g><circle cx="${c.x}" cy="${c.y}" r="6" fill="#fff" stroke="#c9bff0" stroke-width="2" />
              <text x="${c.x + 11}" y="${c.y + 4}" class="map-city">${c.name}</text></g>`,
          )
          .join("")}
        ${CLIENT.trucks
          .map((t) => {
            const [x, y] = point(t);
            return `<g class="truck" data-truck="${t.id}" tabindex="0" role="button" aria-label="${t.id} ${t.label}">
              <circle cx="${x}" cy="${y}" r="13" fill="#efeaff" />
              <circle cx="${x}" cy="${y}" r="7" fill="${t.status === "At border" ? "#d9a353" : t.status === "Delivered" ? "#1e7f66" : "#5b45d6"}" />
            </g>`;
          })
          .join("")}
      </svg>
    </section>
    <aside class="tracker-list">
      ${CLIENT.trucks
        .map(
          (t) => `<button class="truck-row ${t.status === "At border" ? "warn" : ""}" data-truck="${t.id}">
            <span class="truck-id">${t.id}</span>
            <strong>${t.label}</strong>
            <span class="truck-meta">${t.status} · ${Math.round(t.progress * 100)}% of the way</span>
          </button>`,
        )
        .join("")}
    </aside>
  </div>`;
}

function viewRooms() {
  return `
  <div class="view-head">
    <div><h1>Rooms</h1><p>What is occupied, what is free, and how hard each room is working.</p></div>
  </div>
  <div class="rooms">
    ${CLIENT.rooms
      .map(
        (room) => `<section class="room-card">
          <header><strong>${room.name}</strong><span>${room.used}% used</span></header>
          <div class="room-usage"><i style="width:${room.used}%"></i></div>
          <div class="room-slots">
            ${room.slots
              .map(
                (slot) => `<button class="room-slot ${slot[2]}" data-room-slot="${room.name} · ${slot[0]}">
                  <span>${slot[0]}</span><strong>${slot[1]}</strong>
                </button>`,
              )
              .join("")}
          </div>
        </section>`,
      )
      .join("")}
  </div>`;
}

function viewSkus() {
  const risk = (sku) => (sku.cover <= 5 ? "hot" : sku.cover <= 12 ? "warm" : "cool");
  return `
  <div class="view-head">
    <div><h1>Stock matrix</h1><p>Sell-through against cover, so the problem SKUs are obvious.</p></div>
  </div>
  <section class="card">
    <div class="card-head"><div><h2>Every SKU, by pressure</h2><small>Red means selling faster than it can be replaced</small></div>
      <div class="matrix-legend"><span class="hot"></span>under 5 days<span class="warm"></span>5–12<span class="cool"></span>12+</div></div>
    <div class="card-body matrix">
      ${CLIENT.skus
        .map(
          (sku) => `<button class="matrix-cell ${risk(sku)}" data-sku="${sku.name}">
            <span class="matrix-name">${sku.name}</span>
            <strong>${sku.sell}%</strong>
            <span class="matrix-cover">${sku.cover}d cover · ${sku.margin}% margin</span>
          </button>`,
        )
        .join("")}
    </div>
  </section>`;
}

function viewDispatch() {
  const columns = ["Unassigned", "Assigned", "In transit", "At border", "Delivered"];
  return `
  <div class="view-head">
    <div><h1>Dispatch board</h1><p>Every load, by where it actually is.</p></div>
    <div class="head-actions"><span class="chip good">${CLIENT.loads.filter((l) => l.status !== "Delivered").length} open</span></div>
  </div>
  <div class="board">
    ${columns
      .map(
        (col) => `<section class="board-col">
          <header><span>${col}</span><b>${CLIENT.loads.filter((l) => l.status === col).length}</b></header>
          <div class="board-cards">
            ${CLIENT.loads
              .filter((l) => l.status === col)
              .map(
                (l) => `<button class="load-card ${col === "At border" ? "warn" : ""}" data-load="${l.id}">
                  <span class="load-id">${l.id}</span>
                  <strong>${l.customer}</strong>
                  <span class="load-lane">${l.from} → ${l.to}</span>
                  <span class="load-meta">${l.weight} · ${CLIENT.currency} ${fmt.money(l.rate)}</span>
                  <span class="load-foot">${l.driver === "—" ? "No driver" : l.driver} · ${l.eta}</span>
                </button>`,
              )
              .join("") || '<p class="board-empty">Nothing here</p>'}
          </div>
        </section>`,
      )
      .join("")}
  </div>`;
}

function viewFleet() {
  const available = CLIENT.drivers.filter((d) => d.status === "Available").length;
  const nearCap = CLIENT.drivers.filter((d) => d.hours / d.cap > 0.85).length;
  const onRoad = CLIENT.loads.filter((l) => ["Assigned", "In transit"].includes(l.status)).length;
  return `
  <div class="view-head">
    <div><h1>Fleet &amp; drivers</h1><p>Hours, availability and who is close to the limit.</p></div>
  </div>
  <div class="tile-grid three">
    <article class="tile"><div class="tile-top"><span class="tile-label">Drivers available</span><span class="tile-icon">${I("i-team")}</span></div><div class="tile-value" data-count="${available}">${available}</div></article>
    <article class="tile"><div class="tile-top"><span class="tile-label">Close to hours cap</span><span class="tile-icon lav">${I("i-clock")}</span></div><div class="tile-value" data-count="${nearCap}">${nearCap}</div></article>
    <article class="tile"><div class="tile-top"><span class="tile-label">Loads on the road</span><span class="tile-icon mint">${I("i-boxes")}</span></div><div class="tile-value" data-count="${onRoad}">${onRoad}</div></article>
  </div>
  <section class="card">
    <div class="card-head"><div><h2>Driver hours this week</h2><small>Cap is 48 hours</small></div></div>
    <div class="card-body driver-list">
      ${CLIENT.drivers
        .map(
          (d) => `<div class="driver-row">
            <span class="driver-name"><strong>${d.name}</strong><small>${d.status}${d.load !== "—" ? ` · ${d.load}` : ""}</small></span>
            <span class="driver-bar"><i class="${d.hours / d.cap > 0.85 ? "hot" : ""}" style="width:${Math.round((d.hours / d.cap) * 100)}%"></i></span>
            <span class="driver-hours">${d.hours}/${d.cap}h</span>
          </div>`,
        )
        .join("")}
    </div>
  </section>`;
}

function viewLanes() {
  return `
  <div class="view-head">
    <div><h1>Lane margin</h1><p>What each corridor earns after cost — the argument for changing a rate.</p></div>
  </div>
  <section class="card">
    <div class="card-head"><div><h2>By lane</h2><small>This month · ${CLIENT.currency}</small></div></div>
    <div class="card-body">
      <table class="table">
        <thead><tr><th>Lane</th><th>Loads</th><th>Revenue</th><th>Cost</th><th>Margin</th><th>Fill</th></tr></thead>
        <tbody>
          ${CLIENT.lanes
            .map((l) => {
              const margin = Math.round(((l.revenue - l.cost) / l.revenue) * 100);
              return `<tr>
                <td><strong>${l.lane}</strong></td>
                <td class="mono">${l.loads}</td>
                <td class="mono">${fmt.money(l.revenue)}</td>
                <td class="mono">${fmt.money(l.cost)}</td>
                <td><span class="margin ${margin < 20 ? "low" : ""}">${margin}%</span></td>
                <td><span class="fill"><i style="width:${l.fill}%"></i></span></td>
              </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </div>
    <div class="card-foot"><span>Salalah is losing money at this fill</span><span>Sample data</span></div>
  </section>`;
}

function viewSchedule() {
  const booked = CLIENT.clinicians.reduce(
    (n, c) => n + c.slots.filter((s) => s.state !== "open").length,
    0,
  );
  return `
  <div class="view-head">
    <div><h1>Today's list</h1><p>Three clinicians, one screen, so the front desk can see what is free.</p></div>
    <div class="head-actions"><span class="chip good">${booked} booked</span></div>
  </div>
  <div class="schedule">
    ${CLIENT.clinicians
      .map(
        (c) => `<section class="clinic-col">
          <header><strong>${c.name}</strong><small>${c.role}</small></header>
          ${c.slots
            .map(
              (slot) => `<button class="slot-card ${slot.state}" data-slot-detail="${c.name} · ${slot.time}">
                <span class="slot-time">${slot.time}</span>
                <span class="slot-body"><strong>${slot.patient}</strong><small>${slot.type}</small></span>
                <span class="slot-state">${slot.state === "open" ? "Free" : slot.state === "no-show" ? "No-show" : slot.state === "arrived" ? "Here" : "Booked"}</span>
              </button>`,
            )
            .join("")}
        </section>`,
      )
      .join("")}
  </div>`;
}

function viewWaitlist() {
  return `
  <div class="view-head">
    <div><h1>Waitlist</h1><p>People waiting for a slot, and how well they fit the gaps.</p></div>
    <div class="head-actions"><button class="btn sm" data-request="module">${I("i-plus")}Add to waitlist</button></div>
  </div>
  <section class="card">
    <div class="card-head"><div><h2>Waiting for a slot</h2><small>Best fit first</small></div>
      <span class="chip uv">${CLIENT.waitlist.length} waiting</span></div>
    <div class="card-body waitlist">
      ${CLIENT.waitlist
        .map(
          (w) => `<div class="wait-row">
            <span class="wait-main"><strong>${w.name}</strong><small>${w.need} · ${w.site} · waiting ${w.waiting}</small></span>
            <span class="wait-fit"><i style="width:${w.fit}%"></i></span>
            <span class="wait-score">${w.fit}% fit</span>
            <button class="btn sm" data-offer="${w.name}">Offer slot</button>
          </div>`,
        )
        .join("")}
    </div>
    <div class="card-foot"><span>Offers go out only when a clinician's list has a gap</span></div>
  </section>`;
}

function viewClaims() {
  const submitted = CLIENT.claims.reduce((n, c) => n + c.value, 0);
  const denied = CLIENT.claims.reduce((n, c) => n + c.denied, 0);
  return `
  <div class="view-head">
    <div><h1>Claims</h1><p>Submitted, approved, denied — by payer.</p></div>
  </div>
  <section class="card">
    <div class="card-head"><div><h2>This month</h2><small>${CLIENT.currency} ${fmt.money(submitted)} submitted</small></div>
      <span class="chip warn">${denied} denied</span></div>
    <div class="card-body claims">
      ${CLIENT.claims
        .map((c) => {
          const approved = Math.round((c.approved / c.submitted) * 100);
          return `<div class="claim-row">
            <span class="claim-name"><strong>${c.payer}</strong><small>${c.submitted} submitted · ${c.denied} denied</small></span>
            <span class="claim-bar"><i style="width:${approved}%"></i></span>
            <span class="claim-pct">${approved}%</span>
            <span class="claim-value">${fmt.money(c.value)}</span>
          </div>`;
        })
        .join("")}
    </div>
    <div class="card-foot"><span>Denials with Daman are up this month</span><span>Sample data</span></div>
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
    </section>

    <section class="card connect-apps">
      <div class="card-head">
        <div><h2>Connect apps</h2><small>We wire them up for you — pick the system and we build it</small></div>
        <span class="connect-count"><b>6</b> connected</span>
      </div>
      <div class="card-body">
        <div class="connect-toolbar">
          <input class="connect-search" id="connectorSearch" type="search" placeholder="Search across apps and skills" />
          <button class="btn sm" data-help>${I("i-mail")}Ask for help</button>
        </div>
        <div class="filter-chips connect-cats" id="connectorCats">
          ${CONNECTOR_CATEGORIES.map(
            (c) => `<button class="chip ${c === state.connectorCategory ? "sun" : "ghost"}" data-cat="${c}">${c}</button>`,
          ).join("")}
        </div>

        <div class="connect-section head-row">
          <h3>Recommended for you</h3>
          <button class="connect-link" data-connect-more>${state.connectorExpanded ? "Show less" : "View all 1,000+ connectors"}</button>
        </div>
        <div class="connect-list" id="connectRecommended"></div>

        <div class="connect-more" id="connectorGrid" ${state.connectorExpanded ? "" : "hidden"}></div>
      </div>
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
      <div class="card-head"><div><h2>Agents</h2><small>What each one may do on its own. Everything else comes to you.</small></div>
        <button class="btn sm" data-new-request>Ask for a change</button></div>
      <div class="card-body agent-settings">
        ${AGENTS.map((a) => {
          const control = controlFor(a.id);
          return `<article class="agent-setting">
            <span class="agent-avatar">${I(a.icon)}</span>
            <div class="agent-setting-body">
              <span class="agent-setting-top"><strong>${a.name}</strong>
                <span class="chip ${a.status === "live" ? "good" : "ghost"}">${a.status === "live" ? "Running" : "Idle"}</span></span>
              <p>${a.scope}</p>
              <div class="guardrails">${a.tools.slice(0, 3).map((t) => `<span class="tool-chip">${t}</span>`).join("")}</div>
            </div>
            <div class="agent-setting-controls">
              <label class="control">
                <span>How much it does alone</span>
                <select data-autonomy="${a.id}">
                  ${["Ask me first", "Act, then tell me", "Act on its own"]
                    .map(
                      (o) =>
                        `<option ${control.autonomy === o ? "selected" : ""} ${o === "Act on its own" ? "disabled" : ""}>${o}${o === "Act on its own" ? " — needs Omnia" : ""}</option>`,
                    )
                    .join("")}
                </select>
              </label>
              <div class="control-row"><span>Paused</span>
                <button class="toggle" aria-pressed="${control.paused}" aria-label="Pause ${a.name}" data-pause="${a.id}"></button></div>
              <div class="control-row"><span>Quiet hours · 21:00–07:00</span>
                <button class="toggle" aria-pressed="${control.quiet}" aria-label="Quiet hours" data-quiet="${a.id}"></button></div>
            </div>
          </article>`;
        }).join("")}
      </div>
      <div class="card-foot"><span>Anything beyond these three is applied by your engineer</span></div>
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

const VIEWS = {
  agents: () => viewAgentsPage(),
  tracker: () => viewTracker(),
  rooms: () => viewRooms(),
  skus: () => viewSkus(),
  general: () => viewGeneral(),
  decisions: () => viewDecisions(),
  orders: () => viewOrders(),
  inventory: () => viewInventory(),
  savings: () => viewSavings(),
  dispatch: () => viewDispatch(),
  fleet: () => viewFleet(),
  lanes: () => viewLanes(),
  schedule: () => viewSchedule(),
  waitlist: () => viewWaitlist(),
  claims: () => viewClaims(),
};

function renderStage() {
  const stage = document.getElementById("stage");
  const render = state.os ? viewOs : VIEWS[state.active] || viewGeneral;
  stage.innerHTML = render();
  document.getElementById("topbar").classList.toggle("os-mode", Boolean(state.os));
  wireStage();
  renderConnectors();
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

const LOGO_SLUGS = {
  shopify: "shopify", stripe: "stripe", hubspot: "hubspot", salesforce: "salesforce",
  quickbooks: "quickbooks", xero: "xero", slack: "slack", gmail: "gmail", google: "google",
  "google ads": "google", "google workspace": "google", meta: "meta", "meta ads": "meta",
  whatsapp: "whatsapp", "whatsapp business": "whatsapp", woocommerce: "woocommerce",
  paypal: "paypal", zendesk: "zendesk", intercom: "intercom", notion: "notion", jira: "jira",
  github: "github", gitlab: "github", mailchimp: "mailchimp", twilio: "twilio",
  airtable: "airtable", dropbox: "dropbox", adyen: "adyen", square: "square",
  bigcommerce: "bigcommerce", magento: "magento", "adobe commerce": "adobe", zoho: "zoho",
  sap: "sap", oracle: "oracle", netsuite: "oracle", adobe: "adobe", intuit: "intuit",
  sage: "sage", "amazon": "googlecloud", "google cloud": "googlecloud", outlook: "gmail",
  "microsoft": "googlecloud",
};

function connectorMark(name, colour) {
  const brand = name.split(" · ")[0].toLowerCase();
  const slug = LOGO_SLUGS[brand] || (LOGOS[brand] ? brand : null);
  const logo = slug && LOGOS[slug];
  if (logo)
    return `<span class="connector-mark has-logo" style="--brand:${colour}">
      <svg viewBox="${logo.vb}" aria-hidden="true"><path d="${logo.d}" fill="currentColor" /></svg>
    </span>`;
  return `<span class="connector-mark" style="--brand:${colour}">${name.slice(0, 2).toUpperCase()}</span>`;
}

const RECOMMENDED = [
  "Shopify",
  "Stripe",
  "HubSpot",
  "Salesforce",
  "QuickBooks",
  "Slack",
];

function connectorRow([name, cat, colour], { recommended = false } = {}) {
  return `<div class="connect-row">
    ${connectorMark(name, colour)}
    <span class="connect-copy"><strong>${name}</strong><small>${cat}</small></span>
    <button class="connect-btn" data-connect="${name}">Connect</button>
  </div>`;
}

function renderConnectors() {
  const recommended = document.getElementById("connectRecommended");
  const grid = document.getElementById("connectorGrid");
  if (!recommended) return;

  recommended.innerHTML = RECOMMENDED.map((name) => {
    const entry = EXPANDED.find(([n]) => n === name) || [name, "Commerce", "#5b45d6"];
    return connectorRow(entry, { recommended: true });
  }).join("");

  const q = state.connectorQuery.toLowerCase();
  const list = EXPANDED.filter(
    ([name, cat]) =>
      (state.connectorCategory === "All" || cat === state.connectorCategory) &&
      (!q || name.toLowerCase().includes(q) || cat.toLowerCase().includes(q)),
  );
  grid.innerHTML = list.map((entry) => connectorRow(entry)).join("");
  grid.hidden = !state.connectorExpanded && !q;

  document.querySelectorAll("[data-connect]").forEach((button) =>
    button.addEventListener("click", () => {
      const name = button.dataset.connect;
      button.textContent = "Not in the demo";
      button.classList.add("denied");
      document.querySelector(".card-foot")?.setAttribute("data-flash", "1");
      toast(`${name} would be connected by your Omnia team — this demo can't reach external systems.`, "error");
      setTimeout(() => {
        button.textContent = "Connect";
        button.classList.remove("denied");
      }, 2600);
    }),
  );

  const count = document.getElementById("connectorCount");
  if (count) count.textContent = `Showing ${list.length}`;
}

function wireStage() {
  const stage = document.getElementById("stage");

  stage.querySelectorAll("[data-tab]").forEach((el) => el.addEventListener("click", () => openTab(el.dataset.tab)));
  stage.querySelectorAll("[data-open]").forEach((el) => el.addEventListener("click", () => openTab(el.dataset.open)));
  stage.querySelectorAll("[data-open-ask]").forEach((el) =>
    el.addEventListener("click", () => {
      state.dock.thread = null;
      openDock("ask");
    }),
  );
  stage.querySelectorAll("[data-dock-agent]").forEach((el) =>
    el.addEventListener("click", () => {
      state.agentId = el.dataset.dockAgent;
      renderStage();
    }),
  );
  stage.querySelectorAll("[data-agent-ask]").forEach((chip) =>
    chip.addEventListener("click", () => askAgentBody(chip.dataset.agentAsk)),
  );
  {
    const agentForm = document.getElementById("agentAskForm");
    agentForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = document.getElementById("agentAskInput");
      const text = input?.value.trim();
      if (!text) return;
      input.value = "";
      askAgentBody(text);
    });
    if (document.getElementById("agentChatLog")) paintAgentChat();
  }

  stage.querySelectorAll("[data-truck]").forEach((el) =>
    el.addEventListener("click", () => {
      const truck = CLIENT.trucks.find((t) => t.id === el.dataset.truck);
      if (!truck) return;
      openDrawer(truck.id, truck.label, `<div class="drawer-facts">
        <div><span>Status</span><strong>${truck.status}</strong></div>
        <div><span>Progress</span><strong>${Math.round(truck.progress * 100)}%</strong></div>
      </div><div class="drawer-actions"><button class="btn primary sm" data-truck-act>Call driver</button></div>`);
      document.querySelector("[data-truck-act]")?.addEventListener("click", () => {
        closeDrawer();
        toast("Calling the driver — this demo cannot dial out.");
      });
    }),
  );
  stage.querySelectorAll("[data-room-slot]").forEach((el) =>
    el.addEventListener("click", () => toast(`${el.dataset.roomSlot} · booking changes go through your engineer`)),
  );
  stage.querySelectorAll("[data-sku]").forEach((el) =>
    el.addEventListener("click", () => toast(`${el.dataset.sku} · reorder draft goes to Decisions for your approval`)),
  );

  stage.querySelectorAll("[data-load]").forEach((el) =>
    el.addEventListener("click", () => {
      const load = CLIENT.loads.find((l) => l.id === el.dataset.load);
      if (!load) return;
      openDrawer(
        load.id,
        `${load.customer} · ${load.from} → ${load.to}`,
        `<div class="drawer-facts">
          <div><span>Status</span><strong>${load.status}</strong></div>
          <div><span>Weight</span><strong>${load.weight}</strong></div>
          <div><span>Rate</span><strong>${CLIENT.currency} ${fmt.money(load.rate)}</strong></div>
          <div><span>Driver</span><strong>${load.driver}</strong></div>
        </div>
        <h4 class="drawer-title">Timing</h4>
        <ol class="timeline">
          <li><i></i><div><strong>Booked</strong><span>${load.customer} · today</span></div></li>
          <li><i></i><div><strong>Tender</strong><span>${load.status === "Unassigned" ? "Waiting for a carrier" : "Carrier accepted"}</span></div></li>
          <li class="${load.status === "At border" ? "warn" : ""}"><i></i><div><strong>Transit</strong><span>${load.eta}</span></div></li>
        </ol>
        <div class="drawer-actions">
          <button class="btn primary sm" data-load-action>Tender load</button>
          <button class="btn sm" data-load-message>Message driver</button>
        </div>`,
      );
      document.querySelector("[data-load-action]")?.addEventListener("click", () => {
        closeDrawer();
        toast("Tendered · carriers notified");
      });
      document.querySelector("[data-load-message]")?.addEventListener("click", () => {
        closeDrawer();
        toast("Message queued for the driver");
      });
    }),
  );

  stage.querySelectorAll("[data-slot-detail]").forEach((el) =>
    el.addEventListener("click", () => {
      const [who, time] = el.dataset.slotDetail.split(" · ");
      openDrawer(time, who, `<p class="muted">Slot detail is illustrative in this demo.</p>`);
    }),
  );

  stage.querySelectorAll("[data-offer]").forEach((el) =>
    el.addEventListener("click", () => toast(`Offer sent to ${el.dataset.offer}`)),
  );

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
  const connectorSearch = document.getElementById("connectorSearch");
  if (connectorSearch) {
    connectorSearch.value = state.connectorQuery;
    connectorSearch.addEventListener("input", () => {
      state.connectorQuery = connectorSearch.value;
      renderConnectors();
    });
  }
  stage.querySelectorAll("[data-connect-more]").forEach((el) =>
    el.addEventListener("click", () => {
      state.connectorExpanded = !state.connectorExpanded;
      renderStage();
    }),
  );
  stage.querySelectorAll("[data-cat]").forEach((el) =>
    el.addEventListener("click", () => {
      state.connectorCategory = el.dataset.cat;
      stage.querySelectorAll("[data-cat]").forEach((b) =>
        b.classList.toggle("uv", b.dataset.cat === state.connectorCategory),
      );
      stage.querySelectorAll("[data-cat]").forEach((b) =>
        b.classList.toggle("ghost", b.dataset.cat !== state.connectorCategory),
      );
      renderConnectors();
    }),
  );
  stage.querySelectorAll("[data-help]").forEach((el) =>
    el.addEventListener("click", () => newRequestModal("integration")),
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
  const brand = document.getElementById("navBrand");
  if (brand && CLIENT.logo) brand.innerHTML = CLIENT.logo;
  const wsMark = document.querySelector('#accountMenu [data-action="workspace"] .workspace-mark');
  if (wsMark && CLIENT.logo) wsMark.innerHTML = CLIENT.logo;
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
  accountButton?.addEventListener("click", () => {
    const open = accountMenu.hidden;
    accountMenu.hidden = !open;
    accountButton.setAttribute("aria-expanded", String(!open));
  });
  accountMenu?.addEventListener("click", (event) => {
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

  document.querySelector('[data-action="workspace"]')?.addEventListener("click", () =>
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
  document.querySelector('[data-action="notify"]')?.addEventListener("click", renderNotifications);

  document.getElementById("askButton")?.addEventListener("click", () => {
    if (state.dock.open && state.dock.view === "ask") return closeDock();
    state.dock.thread = null;
    openDock("ask");
  });

  const agentsButton = document.getElementById("agentsButton");
  agentsButton?.addEventListener("click", () => openTab("agents"));

  const dockButton = document.getElementById("dockButton");
  dockButton?.addEventListener("click", () => {
    if (state.dock.open && state.dock.view === "requests") return closeDock();
    state.dock.thread = null;
    openDock("requests");
  });
  document.querySelector("[data-dock-close]")?.addEventListener("click", closeDock);

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

  document.getElementById("searchButton")?.addEventListener("click", openPalette);
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

  document.getElementById("tabs")?.addEventListener("keydown", (event) => {
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
