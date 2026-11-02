# Omnia — prelaunch introduction

Omnia connects the software a business already uses into one system: cutting
duplicate tools and manual work first, then adding the capabilities that are
missing through four kinds of Modules — Connectors, Extensions, Automations and
Custom Services.

The site is static. Vercel serves the files and the functions in `api/`.

## Preview the design

Static files only:

```sh
python3 -m http.server 8766 --bind 127.0.0.1
```

Open http://127.0.0.1:8766. A static preview does not collect sign-ups.

To exercise the early access form and the private inbox against an in-memory
store:

```sh
npm install
npm run preview
```

The command prints a local password for http://127.0.0.1:8787/admin/login.
Nothing is written to Neon. A submission reports success only after the handler
confirms a stored record.

## Early access storage and admin

Early access sign-ups are stored in Neon Postgres and read from `/admin/`. There
is no company mailbox and no email is sent. The form collects a work email so
the team can contact the visitor before launch.

`/admin` and `/api/admin/*` require a signed httpOnly session. The password and
the session secret are Vercel environment variables. Knowing the admin URL does
not grant access. Missing configuration denies access.

**Production is not deployed from this repository's automation.** Create the
Neon database, set the environment variables, and connect `useomnia.dev` by
following [the Vercel checklist](docs/VERCEL_SETUP.md).

```sh
npm test
npm run migrate
```

`npm run migrate` applies `db/schema.sql` when `DATABASE_URL` is set. The same
SQL can be pasted into the Neon SQL editor. The sign-up table is `early_access`.

## Source files

- `index.html`: the public page.
- `styles.css`: all page styles in one readable file (desktop first, then the
  small-screen layer). Pages load the minified `styles.min.css`; run
  `npm run build:css` after editing, then bump `?v=` in every HTML file,
  because CSS and JS are cached for a year.
- `script.js`: smooth navigation, section tracking and disclosure motion.
- `omnia-story.js`: the OS overview interaction and five-stage Module assembly.
- `native-intelligence.js`: the Automations perspectives and six settings.
- `inquiry.js`: the two-step early access form and failure handling.
- `api/`, `server/`, `db/schema.sql`: the Vercel Functions, admin session and
  Postgres schema.
- `admin/`: the private early access inbox and its sign-in page.
- `assets/`: local logos, Manrope, Lenis, and their attribution/license files.
- `archive/cloudflare/`: the previous Pages, D1 and Access setup. It is not
  deployed.

No framework was added to the public site. Integration targets are illustrative,
not live-connector or partnership claims. The public site does not claim proven
scalability, customers or metrics.

## Checks

`npm test` covers the admin session, early access validation, duplicate handling,
rate limiting, details token checks, the schema and the public meta tags. It does
not call Neon or Vercel.
