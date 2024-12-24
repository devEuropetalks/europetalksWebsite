import { db } from "@/lib/db";
import { initialTranslations } from "./initial-translations";

async function main() {
  for (const [language, namespaces] of Object.entries(initialTranslations)) {
    await db.translation.upsert({
      where: { language },
      create: {
        language,
        content: namespaces,
      },
      update: {
        content: namespaces,
      },
    });
  }
  
  console.log("Translations seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding translations:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  }); 