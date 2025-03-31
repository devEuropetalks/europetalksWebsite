import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function fixTranslations() {
  try {
    // Get all translations
    const translations = await prisma.translation.findMany();
    
    for (const translation of translations) {
      const content = typeof translation.content === "string" 
        ? JSON.parse(translation.content) 
        : translation.content;
      
      // Check events namespace
      if (content.events && content.events.events) {
        // Flatten the structure
        for (const key in content.events.events) {
          if (!content.events[key]) {
            content.events[key] = content.events.events[key];
          }
        }
        
        // Update the translation
        await prisma.translation.update({
          where: { language: translation.language },
          data: { 
            content,
            updatedAt: new Date()
          }
        });
        
        console.log(`Updated ${translation.language} translation`);
      } else {
        console.log(`No changes needed for ${translation.language}`);
      }
    }
    
    console.log("All translations updated successfully");
  } catch (error) {
    console.error("Error fixing translations:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTranslations(); 