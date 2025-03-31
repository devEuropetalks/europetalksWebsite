import { PrismaClient } from "@prisma/client";
import fs from 'fs';

const prisma = new PrismaClient();

async function fixAllTranslations() {
  try {
    // Load source English translations as reference
    const englishSource = JSON.parse(fs.readFileSync('./translations/translations.json', 'utf8')).en;
    console.log("Loaded English source translations with namespaces:", Object.keys(englishSource));

    // Get all translations from database
    const translations = await prisma.translation.findMany();
    console.log(`Found ${translations.length} translations in database`);

    for (const translation of translations) {
      const language = translation.language;
      console.log(`\nProcessing ${language} translation...`);
      
      // Parse content
      const content = typeof translation.content === "string" 
        ? JSON.parse(translation.content) 
        : translation.content;
      
      // Check if this is English (no need to modify)
      if (language === 'en') {
        console.log("Skipping English - already complete");
        continue;
      }
      
      let updated = false;
      const updatedContent = { ...content };
      
      // Ensure all namespaces exist
      for (const namespace of Object.keys(englishSource)) {
        if (!updatedContent[namespace]) {
          console.log(`Creating missing namespace: ${namespace}`);
          updatedContent[namespace] = {};
          updated = true;
        }
        
        // Check for structural issues (like nested 'events' in events)
        if (namespace === 'events' && updatedContent.events.events) {
          console.log("Fixing nested events structure");
          // Copy nested events keys to top level
          for (const key in updatedContent.events.events) {
            if (!updatedContent.events[key]) {
              updatedContent.events[key] = updatedContent.events.events[key];
              updated = true;
            }
          }
        }
      }
      
      if (updated) {
        // Update the translation in database
        await prisma.translation.update({
          where: { language },
          data: { 
            content: updatedContent,
            updatedAt: new Date()
          }
        });
        console.log(`Updated ${language} translation in database`);
      } else {
        console.log(`No changes needed for ${language}`);
      }
    }
    
    console.log("\nAll translations fixed successfully!");
  } catch (error) {
    console.error("Error fixing translations:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllTranslations(); 