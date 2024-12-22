import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs/promises";

const prisma = new PrismaClient();

async function loadJsonFile(language: string, namespace: string) {
  const filePath = path.join(process.cwd(), "public", "locales", language, `${namespace}.json`);
  const content = await fs.readFile(filePath, "utf-8");
  return JSON.parse(content);
}

async function main() {
  const languages = ["en", "de", "fr", "es", "it"];
  const namespaces = ["home", "about", "contact", "events", "gallery", "header", "components", "other"];

  // Clear existing data
  await prisma.homeTranslation.deleteMany();
  await prisma.headerTranslation.deleteMany();
  await prisma.aboutTranslation.deleteMany();
  await prisma.contactTranslation.deleteMany();
  await prisma.eventsTranslation.deleteMany();
  await prisma.galleryTranslation.deleteMany();
  await prisma.componentsTranslation.deleteMany();
  await prisma.otherTranslation.deleteMany();

  // Seed translations
  for (const language of languages) {
    for (const namespace of namespaces) {
      const content = await loadJsonFile(language, namespace);
      
      // Specific translation tables
      const modelMap: Record<string, any> = {
        home: prisma.homeTranslation,
        about: prisma.aboutTranslation,
        contact: prisma.contactTranslation,
        events: prisma.eventsTranslation,
        gallery: prisma.galleryTranslation,
        header: prisma.headerTranslation,
        components: prisma.componentsTranslation,
        other: prisma.otherTranslation,
      };

      if (namespace in modelMap) {
        await modelMap[namespace].create({
          data: {
            language,
            content,
          },
        });
      }
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