import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  // Use a dummy DATABASE_URL during build if not available
  // This allows Prisma to initialize during build without errors
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL =
      "postgresql://user:password@localhost:5432/db?schema=public";
  }

  const client = new PrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = getPrismaClient();
