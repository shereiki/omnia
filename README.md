# Omnia — prelaunch introduction

Omnia is a technology company building **Omnia OS**: a persistent, deeply customizable, AI-native environment that works with existing business technology.

The controlling brief is [Fix the Module Ecosystem and Repetitive Branding](docs/MODULE_ECOSYSTEM_BRIEF.md). This pass preserves the approved identity, welcome, product architecture, navigation, contact backend and private inbox. [Implementation and verification](docs/MODULE_ECOSYSTEM_VERIFICATION.md) records the changes and checks.

## Product concepts

- **Omnia OS** is the persistent, customizable foundation, including native intelligence and the intended agent runtime.
- **Omnia Modules** expand its capabilities. The four internal engineering categories remain Connectors, Extensions, Automations and Custom Services. Agents are native to OS intelligence, not a fifth Module category.
- **Solutions** combine the OS, Modules, intelligence, configuration and custom engineering around a client's requirements.

Omnia can deliver integrations and extensions, internal workspaces, customer-facing websites and portals, complete purpose-built applications, backend services, business logic and cross-system workflows. Existing interfaces can remain, be extended, or be joined by entirely new frontends.

## OS exploration and visual refinement

The five stages follow measured document scroll, synchronized with the existing Lenis animation loop. A single persistent environment pins only when its complete final state fits the viewport. Shorter or narrower viewports use cumulative stages in normal document flow. Arrows and Left/Right/Home/End move to the same scroll positions; they do not maintain a separate selected state. No wheel interception, scroll locking, or nested scrolling is used.

The Module visual is an open assembly of small keyed capabilities, rather than named products. It begins with illustrative connection and knowledge capabilities; later stages show reuse, adapted access, workspace functionality, coordinated work, frontend support and custom business logic. Counts accumulate as 2, 2, 4, 5 and 6. Expansion positions increase from one to three. These are examples of what can be composed, not a released product catalog. Connections, access rules and workflows visibly combine in the resulting customer interface.

Only the primary OS introduction retains the dimensional logo sculpture. Native Intelligence uses a compact runtime layer with knowledge, configured responsibility, permitted capabilities and access boundaries. The agent configuration illustration uses controls rather than another brand sculpture. Internal/customer perspectives, six agent dimensions, and the approved interface composition remain.

## Preview the design

Static files only:

```sh
python3 -m http.server 8766 --bind 127.0.0.1
```

Open http://127.0.0.1:8766. A static preview does not collect inquiries.

To exercise the inquiry form and the private inbox against an in-memory store:

```sh
npm install
npm run preview
```

The command prints a local password for http://127.0.0.1:8787/admin/login. Nothing is written to Neon. A submission reports success only after the handler confirms a stored record.

## Inquiry storage and admin

Inquiries are stored in Neon Postgres and read from `/admin/`. There is no company mailbox and no email is sent. The form collects the visitor's email so the team can reply later.

`/admin` and `/api/admin/*` require a signed httpOnly session. The password and the session secret are Vercel environment variables. Knowing the admin URL does not grant access. Missing configuration denies access.

**Production is not deployed from this repository's automation.** Create the Neon database, set the environment variables, and connect `useomnia.dev` by following [the Vercel checklist](docs/VERCEL_SETUP.md).

```sh
npm test
npm run migrate
```

`npm run migrate` applies `db/schema.sql` when `DATABASE_URL` is set. The same SQL can be pasted into the Neon SQL editor.

## Source files

- `index.html`, `styles.css`: the public narrative and composition.
- `launch.css`: the preserved welcome screen styles.
- `script.js`: entry, smooth navigation and optional disclosure.
- `omnia-story.js`: the preserved OS overview interaction and rebuilt five-stage assembly, with cumulative Modules/effects, keyboard navigation, entry/deep-link handling and reduced-motion behavior.
- `native-intelligence.js`: internal/customer perspectives, permission/context boundaries, six agent dimensions, keyboard navigation and reduced-motion behavior.
- `inquiry.js`: inquiry and launch-interest selection, editable drafts, confirmed storage and failure handling.
- `api/`, `server/`, `db/schema.sql`: the Vercel Functions, admin session and Postgres schema.
- `admin/`: the private inbox and its sign-in page.
- `assets/`: existing local logos, Manrope (woff2 subset plus the original file), Lenis, and their attribution/license files.
- `archive/cloudflare/`: the previous Pages, D1 and Access setup. It is not deployed.

No framework was added to the public site. Vercel serves the static files and the `api/` functions. Integration targets are illustrative, not live-connector or partnership claims. Omnia OS is the shared foundation of the upcoming offering. The public site does not claim proven scalability, customers or metrics.

## Checks

`npm test` covers the admin session, inquiry validation, rate limit, and the public meta tags. It does not call Neon or Vercel.
