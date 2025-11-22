import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use a dummy DATABASE_URL during build if not available
// This allows Prisma to initialize during build without errors
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://user:password@localhost:5432/db?schema=public";
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
