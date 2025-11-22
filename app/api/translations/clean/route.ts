import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, readFile } from "fs/promises";
import path from "path";
import { currentUser } from "@clerk/nextjs/server";

// Hilfsfunktion zum Entfernen eines Schlüssels aus einem verschachtelten Objekt
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function removeNestedKey(obj: any, keyPath: string[]): boolean {
  if (keyPath.length === 1) {
    if (keyPath[0] in obj) {
      delete obj[keyPath[0]];
      return true;
    }
    return false;
  }
  
  const key = keyPath.shift();
   
  if (key && obj[key] && typeof obj[key] === 'object') {
    return removeNestedKey(obj[key], keyPath);
  }
  return false;
}

/**
 * API-Route zum Entfernen ungenutzter Übersetzungen aus der Datenbank und den JSON-Dateien
 */
export async function POST(request: Request) {
  try {
    // Security-Check: Nur Admin-Benutzer dürfen diese Aktion ausführen
    const user = await currentUser();
    if (!user || user.publicMetadata.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Only admins can clean translations." }, { status: 401 });
    }

    // Lese die Liste der ungenutzten Schlüssel aus dem Request-Body
    const { unusedKeys } = await request.json();
    
    if (!unusedKeys || !Array.isArray(unusedKeys) || unusedKeys.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. Please provide an array of unused translation keys." }, 
        { status: 400 }
      );
    }

    console.warn(`Bereinige ${unusedKeys.length} unbenutzte Übersetzungsschlüssel`);

    // 1. Bereinige die Datenbank-Übersetzungen
    let dbCleanCount = 0;
    
    try {
      // Check if the translation table exists first
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'Translation'
        );
      `;
      
      if (!tableExists[0].exists) {
        console.warn("Translation table does not exist in the database, skipping database cleanup");
      } else {
        const translations = await prisma.translation.findMany();
        console.warn(`Found ${translations.length} translation records in database`);
        
        for (const translation of translations) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let content: any;
          
          // Parse den Inhalt, wenn er als String gespeichert ist
          if (typeof translation.content === 'string') {
            content = JSON.parse(translation.content);
          } else {
            content = translation.content;
          }
          
          // Entferne jeden ungenutzten Schlüssel
          let contentChanged = false;
          let languageCleanCount = 0;
          
          for (const key of unusedKeys) {
            const keyParts = key.split('.');
            const changed = removeNestedKey(content, [...keyParts]); // Kopie erstellen mit [...keyParts]
            if (changed) {
              contentChanged = true;
              dbCleanCount++;
              languageCleanCount++;
            }
          }
          
          // Aktualisiere die Datenbank nur, wenn Änderungen vorgenommen wurden
          if (contentChanged) {
            try {
              await prisma.translation.update({
                where: { id: translation.id },
                data: { content }
              });
              console.warn(`✓ Cleaned ${languageCleanCount} keys from database for language: ${translation.language}`);
            } catch (error) {
              console.error(`Failed to update database for language ${translation.language}:`, error);
            }
          } else {
            console.warn(`No changes needed for language: ${translation.language} in database`);
          }
        }
      }
    } catch (dbError) {
      console.error("Error cleaning database translations:", dbError);
      // Continue with JSON cleaning even if database cleaning fails
    }

    // 2. Bereinige die JSON-Dateien
    const translationsDir = path.join(process.cwd(), "translations");
    const jsonFiles = [
      "en.json",
      "de.json",
      "fr.json",
      "es.json",
      "it.json",
      "nl.json",
      "pt.json", 
      "uk.json",
      "lv.json",
      "hr.json",
      "hu.json",
      "el.json",
      "lt.json"
    ];
    
    let jsonCleanCount = 0;
    
    for (const fileName of jsonFiles) {
      try {
        const filePath = path.join(translationsDir, fileName);
        const fileContent = await readFile(filePath, 'utf8');
        const jsonData = JSON.parse(fileContent);
        
        let fileChanged = false;
        for (const key of unusedKeys) {
          const keyParts = key.split('.');
          
          // Bei allen Sprachdateien ist der Inhalt direkt das Übersetzungsobjekt
          const changed = removeNestedKey(jsonData, [...keyParts]);
          if (changed) {
            fileChanged = true;
            jsonCleanCount++;
          }
        }
        
        // Speichere die Datei nur, wenn Änderungen vorgenommen wurden
        if (fileChanged) {
          await writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
          console.warn(`✓ Bereinigte ${fileName}`);
        }
      } catch (err) {
        console.error(`Fehler beim Bereinigen von ${fileName}:`, err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Removed ${dbCleanCount} unused keys from database and ${jsonCleanCount} from JSON files.` 
    });
  } catch (error) {
    console.error("Error cleaning translations:", error);
    return NextResponse.json(
      {
        error: "Failed to clean translations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
} 