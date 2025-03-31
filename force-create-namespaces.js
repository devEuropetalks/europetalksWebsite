import { PrismaClient } from "@prisma/client";
import fs from 'fs';

const prisma = new PrismaClient();

async function forceCreateNamespaces() {
  try {
    // Load source English translations
    const englishSource = JSON.parse(fs.readFileSync('./translations/translations.json', 'utf8')).en;
    const namespaces = Object.keys(englishSource);
    console.log("English has these namespaces:", namespaces);

    // Get all translations
    const translations = await prisma.translation.findMany();
    console.log(`Found ${translations.length} translations in database`);

    for (const translation of translations) {
      const language = translation.language;
      if (language === 'en') continue; // Skip English
      
      console.log(`\nProcessing ${language}...`);
      
      // Parse content
      let content = typeof translation.content === "string" 
        ? JSON.parse(translation.content) 
        : translation.content;
      
      // Create a completely new content object
      let newContent = {};
      
      // Ensure ALL namespaces exist with proper content
      for (const namespace of namespaces) {
        // Copy existing namespace if it exists
        if (content[namespace] && typeof content[namespace] === 'object') {
          newContent[namespace] = content[namespace];
          console.log(`Using existing ${namespace} namespace`);
        } else {
          // Create empty namespace
          newContent[namespace] = {};
          console.log(`Created empty ${namespace} namespace`);
        }
        
        // Special handling for events namespace
        if (namespace === 'events' && newContent.events.events) {
          console.log("Flattening events structure");
          
          // Copy nested events to top-level
          for (const key in newContent.events.events) {
            if (!newContent.events[key]) {
              newContent.events[key] = newContent.events.events[key];
            }
          }
        }
      }
      
      // Always update to ensure we have a consistent structure
      await prisma.translation.update({
        where: { language },
        data: { 
          content: newContent,
          updatedAt: new Date()
        }
      });
      console.log(`Updated ${language} with ${Object.keys(newContent).length} namespaces`);
    }
    
    console.log("\nAll languages updated successfully!");
  } catch (error) {
    console.error("Error updating translations:", error);
  } finally {
    await prisma.$disconnect();
  }
}

forceCreateNamespaces(); 