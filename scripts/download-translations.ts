/**
 * Script to download translations from the database and populate JSON files
 * Run with: tsx scripts/download-translations.ts
 */

import { PrismaClient } from "@prisma/client";
import { writeFile } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

async function downloadTranslations() {
  try {
    console.warn("📥 Downloading translations from database...\n");

    // Fetch all translations from the database
    const translations = await prisma.translation.findMany({
      orderBy: {
        language: "asc",
      },
    });

    if (translations.length === 0) {
      console.warn("⚠️  No translations found in database");
      return;
    }

    // Get the translations directory path (relative to project root)
    const translationsDir = path.join(process.cwd(), "translations");

    let exportedFiles = 0;

    // Process each translation
    for (const { language, content } of translations) {
      try {
        // Parse the content if it's a string, otherwise use it directly
        const contentObj =
          typeof content === "string" ? JSON.parse(content) : content;

        // Write to JSON file
        const filePath = path.join(translationsDir, `${language}.json`);
        await writeFile(filePath, JSON.stringify(contentObj, null, 2), "utf8");

        exportedFiles++;
        console.warn(`✓ Exported ${language} translations to ${filePath}`);
      } catch (err) {
        console.error(`✗ Failed to export ${language} translation:`, err);
      }
    }

    console.warn("\n" + "=".repeat(50));
    console.warn(
      `✅ Successfully exported ${exportedFiles} translation file(s)`
    );
    console.warn("=".repeat(50));
  } catch (error) {
    console.error("❌ Error downloading translations:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
downloadTranslations();
