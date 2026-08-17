# Aarla XP

**Your leisure time concierge.**

Talk naturally → Aarla understands → Aarla curates → Aarla composes a plan → Aarla helps execute it → Aarla remembers.

This is not an events directory, a marketplace, or a chatbot. The unit of recommendation is a **Plan**. Intelligence lives in a `LeisureAgent` with tools. Deterministic engines enforce time, budget, travel and availability. A `MockAIProvider` drives the whole product without an API key.

## Stack

- Next.js 16, React 19, TypeScript, Tailwind 4
- Prisma 6 + SQLite for local development (schema is relational and portable to PostgreSQL)
- Vitest for intelligence tests

## First run

```bash
npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The demo persona is **Vanipriya** in Chennai. Try:

> I have 3 hours with friends from the US. Something very Chennai. Not too touristy. Budget around ₹3k.

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
