# Aarla XP

**Your leisure time concierge.**

Talk naturally → Aarla understands → Aarla curates → Aarla composes a plan → Aarla helps execute it → Aarla remembers.

This is not an events directory, a marketplace, or a chatbot. The unit of recommendation is a **Plan**. Intelligence lives in a `LeisureAgent` with tools. Deterministic engines enforce time, budget, travel and availability. A `MockAIProvider` drives the whole product without an API key.

## Stack

- Next.js 16, React 19, TypeScript, Tailwind 4
- Prisma 6 + **Supabase Postgres**
- Vercel for hosting
- Vitest for intelligence tests

We use Supabase as the Postgres host only. Auth, Storage, and the Supabase JS client are not part of this build.

All Aarla XP tables are prefixed `xp_` (`xp_people`, `xp_plans`, `xp_activities`, …) so they can live in the same database as aarla-os without colliding.

## Supabase + Vercel

### 1. Create a Supabase project

1. Open [https://supabase.com/dashboard](https://supabase.com/dashboard) and create a project.
2. Go to **Project Settings → Database**.
3. Copy two connection strings:

| Variable | Which string | Port | Used for |
| --- | --- | --- | --- |
| `DATABASE_URL` | Transaction pooler | `6543` | The Next.js app on Vercel |
| `DIRECT_URL` | Session pooler | `5432` | `prisma migrate` during the Vercel build |

Both hosts should be `aws-0-ap-northeast-1.pooler.supabase.com`. Do **not** use `db.….supabase.co` on Vercel — that address is IPv6-only and the build will fail.

```bash
DATABASE_URL="postgresql://postgres.YOUR_REF:YOUR_PASSWORD@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.YOUR_REF:YOUR_PASSWORD@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

### 2. Deploy on Vercel

1. Import `vanipriya-j/aarla-xp` into Vercel (this branch or `main` after merge).
2. Add environment variables for **Production** and **Preview**:

```text
DATABASE_URL
DIRECT_URL
AARLA_AI_PROVIDER=mock
```

3. Deploy. The Vercel build will:

- generate the Prisma client
- run `prisma migrate deploy`
- seed the Vanipriya demo catalog if the database is empty
- build Next.js

The first deploy creates the schema and demo data. Later deploys will not wipe the database.

### 3. Confirm

Open the Vercel URL and ask:

> I have 3 hours with friends from the US. Something very Chennai. Not too touristy. Budget around ₹3k.

## Local development

Use the same Supabase project, or a local Postgres:

```bash
cp .env.example .env
# paste your Supabase URLs, or:
docker compose up -d
# DATABASE_URL=postgresql://aarla:aarla@localhost:5432/aarla_xp
# DIRECT_URL=postgresql://aarla:aarla@localhost:5432/aarla_xp

npm install
npm run db:setup
npm run dev
```

## Architecture

```
src/application/leisure-agent   LeisureAgent + tool surface
src/services/ai                 AIProvider, mock + swap-in real provider
src/services/deterministic      constraints, scoring, karma, plan validation
src/services/memory             proposal / write policy
src/services/sources            connector framework
src/services/providers          capability-based actions
src/domains                     shared types
src/app                         visual product only
```

Provider actions and source connectors are placeholders unless marked live.

## Tests

```bash
npm test
```

Covers hard constraints, circle-scoped memory, rejection specificity, family ranking, karma diversity, explicit intent override, and no invented inventory.
