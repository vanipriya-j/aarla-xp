/** Transaction-mode PgBouncer (Supabase :6543) cannot reuse Prisma prepared statements. */
export function withPgBouncer(url: string) {
  if (!url.includes(":6543")) return url;
  if (/[?&]pgbouncer=true(?:&|$)/.test(url)) return url;
  return `${url}${url.includes("?") ? "&" : "?"}pgbouncer=true`;
}

export function prismaRuntimeUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required.");
  }
  return withPgBouncer(url);
}

/** Prefer DIRECT_URL (session pooler :5432). Still disable prepared statements if :6543. */
export function prismaCliUrl() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required.");
  }
  return withPgBouncer(url);
}
