# Deploy the website and private inbox

The inquiry backend is implemented and tested with a real local Cloudflare Pages/D1 runtime. It has not been deployed to your account. No Cloudflare API token or account access is available in this workspace. Owning useomnia.dev in Cloudflare supplies DNS control; it does not, by itself, create hosting, a database, or an admin login.

## What is implemented

- Public website with same-origin inquiry submission to `/api/inquiries`.
- D1 stores the visitor's name, email, interest, idea, creation time, and reviewed status.
- Private inbox at `/admin/`, with newest inquiries first, pagination, and reviewed/new status.
- Cloudflare Access JWT verification on every private API request. Missing or invalid Access configuration denies access; knowing the admin URL does not grant data access.
- No company mailbox is needed. The form does collect the visitor's email so the team can contact them later. There is no automatic email sender.
- Basic server validation, same-origin writes, a honeypot, and a ten-submissions-per-hour limit per network address. Only a temporary hourly hash is stored for rate limiting; raw IP addresses are not stored.

## Account setup still required

1. A Cloudflare Pages project for this directory.
2. A production D1 database and its database ID in `wrangler.toml`.
3. An Access application protecting **both** `useomnia.dev/admin*` and `useomnia.dev/api/admin*`, with an Allow policy limited to the owner's chosen login identity. Use an identity provider or Cloudflare's one-time PIN for the owner's login address. That address is private authentication, not a public company contact mailbox.
4. The Access team hostname and application audience in Pages environment variables: `ADMIN_ACCESS_TEAM_DOMAIN` (for example `your-team.cloudflareaccess.com`, without a URL scheme) and `ADMIN_ACCESS_AUD` (the application's AUD tag).
5. Authorization to deploy to that Cloudflare account. Do not put an API token in the ZIP, source files, or public site.

## Commands on an authenticated machine

The CLI version used for local checks was Wrangler 4.154.0. All commands run from the site root.

```sh
npx wrangler@4.154.0 login
npx wrangler@4.154.0 d1 create omnia-inquiries
```

Replace the all-zero `database_id` in `wrangler.toml` with the returned ID. Keep the binding name `INQUIRIES_DB`.

```sh
npx wrangler@4.154.0 d1 migrations apply omnia-inquiries --remote
python3 scripts/prepare-deploy.py
npx wrangler@4.154.0 pages project create omnia --production-branch main
npx wrangler@4.154.0 pages deploy dist --project-name omnia
```

If the Pages project already exists, use its actual name and skip project creation. This project needs Pages Functions: a static drag-and-drop upload alone will not provide the inquiry API.

Add the two Access environment variables in the Pages project settings and redeploy. In the Pages dashboard, add `useomnia.dev` under Custom domains. Add the matching Access application and owner-only policy in Zero Trust → Access. If also using a `*.pages.dev` address, protect its admin paths with a corresponding Access policy or use the custom domain for admin access. The API still independently checks the configured audience and issuer.

Test production by submitting one inquiry, signing in to `/admin/`, and confirming that it appears. Confirm a signed-out browser cannot read `/api/admin/inquiries`. Keep the Access Allow policy limited to authorized administrators. Do not connect the production database to unrestricted preview deployments; use a separate preview database if needed.

## Local preview

A plain Python HTTP server previews the design but does not run the API. It will never claim a submission was saved. For actual local inquiry storage:

```sh
python3 scripts/prepare-deploy.py
npx wrangler@4.154.0 d1 migrations apply omnia-inquiries --local
npx wrangler@4.154.0 pages dev dist
```

Open the URL Wrangler prints. The private API remains locked until real Access authentication is supplied. Local storage and `.dev.vars` are deliberately excluded from the archive and deployment output.
