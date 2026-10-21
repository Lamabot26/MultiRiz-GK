# GridKavach — Solar Panel for Everyone

India's marketplace for **Digital Solar**: project owners list rooftop projects, users reserve solar capacity from Rs 1,000 to Rs 1,00,000, funds sit in a per-project escrow account, and every unit generated after maintenance flows to users as electricity bill credits. GridKavach executes projects with leading solar partners and handles AMC, Assurance and support.

## Tech stack

- **Next.js 16** (App Router, standalone output) + **React 19** + TypeScript
- **Tailwind CSS 4** + shadcn/ui components + Framer Motion
- **Prisma 6** + SQLite for local development (switch to hosted Postgres for serverless deploys, see `DEPLOYMENT.md`)
- **Zustand** for client state, custom HMAC-signed cookie sessions (no external auth service)

## Local development

```bash
bun install          # or npm install (runs prisma generate automatically)
bun run dev          # http://localhost:3000
```

The database file `db/custom.db` is committed and pre-seeded with the live marketplace project (SP International School Phase 1, 50 kW, Bhubaneswar, Odisha) and a demo account:

```
email:    demo@gridkavach.com
password: demo1234
```

Environment variables live in `.env` (see `.env.example`): `DATABASE_URL` and, in production, `AUTH_SECRET`.

## Key directories

```
src/
  app/            App Router pages + API routes (/api/projects, /api/auth/*, /api/investments)
  components/
    kavach/       All product UI: home, projects, invest wizard, dashboard,
                  safety, legal (DSA/PPA/Terms), auth
    ui/           shadcn/ui primitives
  lib/            brand constants (fees, address, agreement version), db, auth, legal text
prisma/           Prisma schema
db/               SQLite database file
scripts/          Data seeding (update-kavach-data.js), favicon/logo generators, P&L analysis
public/           Brand assets and favicons
```

## Business model constants

Fees and rates are defined centrally in `src/lib/brand.ts`: free project listing, optional Booster plan at Rs 500/kW, one-time 2% owner platform fee at execution (80% reserved), AMC at Rs 1,200/kW/year and GridKavach Assurance & insurance at Rs 999/kW/year billed to the project owner, 1% investor onboarding fee.

## Deploying

See **DEPLOYMENT.md**:
- **Vercel** — works after a 10-minute switch to hosted Postgres (Neon/Supabase), full steps included.
- **VPS / self-hosting** — runs as-is with SQLite via `bun run build` + `bun run start`.
