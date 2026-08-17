import { prisma } from "@/db/prisma";

let pending: Promise<void> | null = null;

export async function ensureSeeded() {
  const count = await prisma.person.count();
  if (count > 0) return;
  if (!pending) {
    pending = (async () => {
      const { seedDatabase } = await import("../../prisma/seed");
      await seedDatabase();
    })();
  }
  await pending;
}
