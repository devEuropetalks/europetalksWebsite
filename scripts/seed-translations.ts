import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs/promises";

const prisma = new PrismaClient();

async function loadJsonFile(language: string, namespace: string) {
  try {
    const filePath = path.join(process.cwd(), "public", "locales", language, `${namespace}.json`);
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to load ${language}/${namespace}:`, error);
    return {};
  }
}

async function main() {
  const languages = ["en", "de", "fr", "es", "it"];
  const namespaces = [
    "home", 
    "about", 
    "contact", 
    "events", 
    "gallery", 
    "header", 
    "components",
    "auth",
    "other"
  ];

  // Clear existing data
  await prisma.translation.deleteMany();

  // Seed translations
  for (const language of languages) {
    const content: Record<string, unknown> = {};
    
    for (const namespace of namespaces) {
      const namespaceContent = await loadJsonFile(language, namespace);
      content[namespace] = namespaceContent;
    }

    try {
      await prisma.translation.create({
        data: {
          language,
          content,
        },
      });
      console.log(`✓ Seeded ${language} translations`);
    } catch (error) {
      console.error(`✗ Failed to seed ${language} translations:`, error);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });