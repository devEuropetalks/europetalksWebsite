import { PrismaClient, Prisma } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Ensure DATABASE_URL is set during build
const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://user:password@localhost:5432/db?schema=public";

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  // Create PostgreSQL connection pool
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);

  // Type assertion: Prisma 7 supports adapter but generated types may be strict
  const client = new PrismaClient({
    adapter,
  } as Prisma.PrismaClientOptions);

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = getPrismaClient();
