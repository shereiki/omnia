# Deploy Omnia on Vercel

The site is ready to deploy. Nothing in this repository creates a Vercel project, a database, or DNS records. Do that in the dashboard after this pull request is merged. The domain is **useomnia.dev**. Do not attach omnia.ai.

Functions run in `fra1` (Frankfurt). Create the database in the matching Neon region, **AWS eu-central-1**.

## 1. Import the project

1. In Vercel, add this Git repository as a project.
2. Framework preset: **Other**.
3. Root directory: the repository root.
4. Build command: leave empty. There is no build step.
5. Output directory: leave empty. Static files are served from the root, and `api/` becomes Vercel Functions.
6. Install command: the default `npm install`.
7. Production branch: `main`.

Pushing `main` deploys production. Pull-request branches get preview URLs. Leave production public. You can turn on Vercel Authentication for **Preview** deployments only. Do not enable a project-wide password or Deployment Protection on Production — that would hide the marketing site.

## 2. Create the Neon database

1. Open the project → **Storage** → **Marketplace** → **Neon**.
2. Create a database named `omnia-early-access` in **eu-central-1 (Frankfurt)**.
3. Connect it to this project for the **Production** environment only.
4. Leave Preview disconnected until you want a separate Neon branch. Do not point preview deployments at the production database.
5. Confirm the integration added `DATABASE_URL`. That value is the pooled connection string. Do not copy it into git.

## 3. Create the tables

The sign-up table is `early_access`. It stores one row per work email, with an
optional company, role and message, and a status of `new` or `reviewed`.

In the Neon SQL editor, paste and run the whole of `db/schema.sql`.

Or, from a machine that already has the production `DATABASE_URL`:

```sh
npm install
npm run migrate
```

The statements are safe to run again.

## 4. Set the environment variables

In the project → **Settings** → **Environment Variables**, add these for **Production**. Mark both as **Sensitive**.

| Name | Value |
| --- | --- |
| `DATABASE_URL` | Added by the Neon integration. If it is missing, set it to the pooled Neon URL. |
| `ADMIN_PASSWORD` | The password you will type at `/admin/login`. 12 characters or more. |
| `ADMIN_SESSION_SECRET` | The output of `openssl rand -base64 32`. 32 characters or more. |

Redeploy production after saving the variables. A deployment that was built before they existed will not see them.

`.env.example` lists the names only. Real values stay in Vercel.

## 5. Connect useomnia.dev

1. Project → **Settings** → **Domains** → add `useomnia.dev`.
2. Add `www.useomnia.dev` and set it to redirect to `useomnia.dev`.
3. Copy the DNS records and the verification TXT that Vercel shows for this project. Use those values. They are specific to the project.
4. At the DNS host that currently serves the coming-soon site, replace the apex and `www` records that point at that old host. Keep MX records and any other unrelated records.
5. Wait until Vercel marks the domain valid and the certificate is issued.
6. Open `https://useomnia.dev` and confirm it is this site.

## 6. Check production

1. Submit the early access form with a work email you control. The next step appears only after `/api/early-access` stores the row.
2. Add a company or role and submit the optional details. The thanks message appears only after `/api/early-access/details` saves them.
3. Open `/admin` in a signed-out browser. You should land on `/admin/login`, not the inbox.
4. Sign in with `ADMIN_PASSWORD`. The sign-up should be first in the list. Mark it reviewed.
5. Sign out. In a private window, `https://useomnia.dev/api/admin/inquiries` should return 401.
6. A wrong password should not open the inbox. After too many failures from the same network, sign-in pauses until the next hour. The correct password still works.

Sign-ups are visible in `/admin` in production (signed in with `ADMIN_PASSWORD`), or directly in the Neon console under **Tables → early_access**.

Local preview (`npm run preview`) uses an in-memory inbox and a printed password. It is not a substitute for the production check.
