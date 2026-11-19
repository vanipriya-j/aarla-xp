import { prisma } from "@/db/prisma";

let pending: Promise<void> | null = null;
let ready = false;

export async function ensureSeeded() {
  if (ready) return;
  if (!pending) {
    pending = (async () => {
      const count = await prisma.person.count();
      if (count === 0) {
        const { seedDatabase } = await import("../../prisma/seed");
        await seedDatabase();
      }
      ready = true;
    })();
  }
  await pending;
}
