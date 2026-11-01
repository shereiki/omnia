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

```sh
python3 -m http.server 8766 --bind 127.0.0.1
```

Open http://127.0.0.1:8766. Static previews show the design but do not collect inquiries. A submission reports success only after the backend confirms an actual stored record.

## Inquiry storage and admin

The website includes Cloudflare Pages Functions, a D1 schema, and a private inbox at `/admin/`. Inquiries go to the database, with no company mailbox or email sending service. Admin data requires a verified Cloudflare Access session. No credentials are included.

**Production is not deployed.** Cloudflare account authorization, a D1 database ID, and an Access application with an owner-only policy still need to be configured. See [Cloudflare setup](docs/CLOUDFLARE_SETUP.md) for the exact steps.

```sh
python3 scripts/prepare-deploy.py
npx wrangler@4.154.0 d1 migrations apply omnia-inquiries --local
npx wrangler@4.154.0 pages dev dist
```

`dist/` contains only public assets. Functions are compiled from `functions/`, with shared server utilities in `server/`. Private state, documentation, and local credentials are not copied into the deployment output.

## Source files

- `index.html`, `styles.css`: the public narrative and composition.
- `launch.css`: the preserved welcome screen styles.
- `script.js`: entry, smooth navigation and optional disclosure.
- `omnia-story.js`: the preserved OS overview interaction and rebuilt five-stage assembly, with cumulative Modules/effects, keyboard navigation, entry/deep-link handling and reduced-motion behavior.
- `native-intelligence.js`: internal/customer perspectives, permission/context boundaries, six agent dimensions, keyboard navigation and reduced-motion behavior.
- `inquiry.js`: inquiry and launch-interest selection, editable drafts, confirmed storage and failure handling.
- `functions/`, `server/`, `migrations/`: the API, admin authentication and database.
- `admin/`: the private inbox interface.
- `assets/`: existing local logos, Manrope and Lenis, with their attribution/license files.

No framework or runtime dependency was added to the site. Wrangler is deployment/development tooling. Integration targets are illustrative, not live-connector or partnership claims. Omnia OS is the shared foundation of the upcoming offering. The public site does not claim proven scalability, customers or metrics.

## Backend verification

Run `node tests/access-check.mjs` for the cryptographic Access checks (controlled local signing keys and JWKS fixture; no account or network required). The backend was also tested in the local Cloudflare runtime with real D1 migrations, form writes and independent database readback. Production Access login and domain deployment still require the account setup above.
