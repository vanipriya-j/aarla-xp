# Aarla XP

Leisure time concierge. The `LeisureAgent` owns intelligence. React components only render contracts from `src/application/contracts.ts`.

Do not put ranking, constraint, or LLM logic in UI components.
Do not invent factual inventory.
Do not mark provider actions as live unless the capability status is LIVE_API or PARTNER_API.

```bash
npm run db:setup
npm test
npm run dev
```
