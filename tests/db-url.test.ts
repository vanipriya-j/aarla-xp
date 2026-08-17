import { afterEach, describe, expect, it } from "vitest";
import { prismaCliUrl, prismaRuntimeUrl, withPgBouncer } from "@/db/url";

const original = {
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
};

afterEach(() => {
  if (original.DATABASE_URL === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = original.DATABASE_URL;
  if (original.DIRECT_URL === undefined) delete process.env.DIRECT_URL;
  else process.env.DIRECT_URL = original.DIRECT_URL;
});

describe("withPgBouncer", () => {
  it("adds pgbouncer=true to transaction pooler URLs", () => {
    const url = "postgresql://u:p@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
    expect(withPgBouncer(url)).toBe(`${url}?pgbouncer=true`);
  });

  it("appends pgbouncer=true when other query params exist", () => {
    const url =
      "postgresql://u:p@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require";
    expect(withPgBouncer(url)).toBe(`${url}&pgbouncer=true`);
  });

  it("does not duplicate pgbouncer=true", () => {
    const url =
      "postgresql://u:p@host:6543/postgres?pgbouncer=true&sslmode=require";
    expect(withPgBouncer(url)).toBe(url);
  });

  it("leaves session pooler URLs unchanged", () => {
    const url =
      "postgresql://u:p@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require";
    expect(withPgBouncer(url)).toBe(url);
  });
});

describe("prisma URL helpers", () => {
  it("runtime URL forces pgbouncer on :6543", () => {
    process.env.DATABASE_URL =
      "postgresql://u:p@host:6543/postgres?sslmode=require";
    expect(prismaRuntimeUrl()).toContain("pgbouncer=true");
  });

  it("CLI URL prefers DIRECT_URL", () => {
    process.env.DATABASE_URL = "postgresql://u:p@host:6543/postgres";
    process.env.DIRECT_URL = "postgresql://u:p@host:5432/postgres?sslmode=require";
    expect(prismaCliUrl()).toBe(process.env.DIRECT_URL);
  });
});
