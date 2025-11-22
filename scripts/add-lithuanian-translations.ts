/**
 * Script to add Lithuanian translations to the database
 * Run with: bun scripts/add-lithuanian-translations.ts
 */

import { PrismaClient, Prisma } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFile } from "fs/promises";
import { join } from "path";

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://user:password@localhost:5432/db?schema=public";

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
} as Prisma.PrismaClientOptions);

async function addLithuanianTranslations() {
  try {
    console.warn("📥 Adding Lithuanian translations to database...\n");

    // Read the Lithuanian translation file
    const translationsPath = join(process.cwd(), "translations", "lt.json");
    const translationsContent = await readFile(translationsPath, "utf8");
    const translations = JSON.parse(translationsContent);

    // Check if Lithuanian translation already exists
    const existing = await prisma.translation.findUnique({
      where: { language: "lt" },
    });

    if (existing) {
      // Update existing translation
      await prisma.translation.update({
        where: { language: "lt" },
        data: {
          content: translations,
        },
      });
      console.warn("✅ Updated existing Lithuanian translations in database");
    } else {
      // Create new translation
      await prisma.translation.create({
        data: {
          language: "lt",
          content: translations,
        },
      });
      console.warn("✅ Created new Lithuanian translations in database");
    }

    console.warn("\n" + "=".repeat(50));
    console.warn("✅ Successfully added Lithuanian translations to database");
    console.warn("=".repeat(50));
  } catch (error) {
    console.error("❌ Error adding Lithuanian translations:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addLithuanianTranslations();

