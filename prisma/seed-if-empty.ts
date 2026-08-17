import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { prismaCliUrl } from "../src/db/url";
import { seedDatabase } from "./seed";

const prisma = new PrismaClient({
  datasources: { db: { url: prismaCliUrl() } },
});

async function main() {
  const count = await prisma.person.count();
  if (count > 0) {
    console.log("Database already has people. Skipping seed.");
    return;
  }
  console.log("Empty database. Seeding the Vanipriya demo catalog...");
  await seedDatabase();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
