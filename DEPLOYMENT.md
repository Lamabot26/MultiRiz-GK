# Deploying GridKavach

## Which target are you deploying to?

| Target | Status out of the box | What you must do |
| --- | --- | --- |
| Vercel | Marketing site works; database features need one change | Switch SQLite to a hosted Postgres (10 min, below) |
| VPS / dedicated server / Docker | Works as-is | `bun install` → `bun run build` → `bun run start` |

**Why Vercel needs a change:** the app uses Prisma with a SQLite file (`db/custom.db`). Vercel's serverless functions have an ephemeral, read-only filesystem, so a local SQLite file cannot be read or written at runtime. All pages render fine, but the API routes (`/api/projects`, `/api/auth/*`, `/api/investments`) would fail until you point `DATABASE_URL` at a hosted database.

---

## Option A: Deploy to Vercel (recommended path)

### 1. Create a hosted Postgres database

Create a free Postgres database on [Neon](https://neon.tech), [Supabase](https://supabase.com), or use Vercel's built-in Postgres (Storage tab). Copy the connection string, e.g.:

```
postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

### 2. Switch the Prisma provider

In `prisma/schema.prisma`, change one line:

```diff
 datasource db {
-  provider = "sqlite"
+  provider = "postgresql"
   url      = env("DATABASE_URL")
 }
```

### 3. Create the tables and seed the data

Run these from the project root (with the Postgres URL). With Bun (recommended, `bun.lock` is included):

```bash
bun install                       # also runs "postinstall": prisma generate
DATABASE_URL="<your-postgres-url>" bunx prisma db push
DATABASE_URL="<your-postgres-url>" bun run scripts/update-kavach-data.js
```

Or with npm/npx (no Bun needed):

```bash
npm install
export DATABASE_URL="<your-postgres-url>"
npx prisma db push
node scripts/update-kavach-data.js
```

This seeds the live marketplace project (SP International School, 50 kW, Bhubaneswar), the demo user (`demo@gridkavach.com` / `demo1234`) and the demo investment (`GK-2026-000001`).

### 4. Push the code to Git

```bash
git init
git add .
git commit -m "GridKavach initial deploy"
# create a GitHub repo, then:
git remote add origin https://github.com/<you>/gridkavach.git
git push -u origin main
```

Note: `.gitignore` excludes `.env`, `node_modules`, `.next` and logs automatically. `db/custom.db` is committed, which is fine for local dev and harmless on Vercel.

### 5. Import into Vercel

1. On [vercel.com](https://vercel.com) → **Add New → Project** → import your GitHub repo.
2. Framework preset: **Next.js** (auto-detected). Leave build command as default.
3. Add Environment Variables (Project → Settings → Environment Variables), for Production, Preview and Development:
   - `DATABASE_URL` = your Postgres connection string
   - `AUTH_SECRET` = a long random string (generate with `openssl rand -base64 32`). This signs login session cookies; without it a development fallback is used, which is insecure.
4. Deploy.

If Vercel logs a notice about `output: "standalone"` in `next.config.ts`, you can safely delete that line — it is only needed for self-hosting via `npm start` (Option B).

### 6. Verify

- Home page loads with the hero and savings calculator.
- Projects page lists SP International School (Phase 1).
- Log in with `demo@gridkavach.com` / `demo1234` and open the dashboard.

---

## Option B: Self-host (VPS, Docker, any Node server)

SQLite works perfectly when the process owns a persistent filesystem, so no database change is needed:

```bash
bun install          # or: npm install
bun run build        # next build + standalone packaging
bun run start        # runs .next/standalone/server.js on port 3000
```

Put a reverse proxy (Nginx/Caddy) with TLS in front of port 3000. Set `AUTH_SECRET` in the environment for production. The SQLite file lives at `db/custom.db`; back it up regularly (it is already seeded with the marketplace data).

---

## Environment variables reference

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Prisma datasource. Local SQLite: `file:../db/custom.db` (relative to `prisma/schema.prisma`). Vercel: hosted Postgres URL. |
| `AUTH_SECRET` | Production | HMAC key for signed session cookies. Generate: `openssl rand -base64 32`. |

## Useful commands

```bash
bun run dev                          # development server on :3000
bun run lint                         # eslint
bunx prisma db push                  # apply schema changes to the database
bun run scripts/update-kavach-data.js  # reseed marketplace data + demo accounts
```
