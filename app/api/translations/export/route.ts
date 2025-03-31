import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";
import { currentUser } from "@clerk/nextjs/server";

// API-Route, die Übersetzungen aus der Datenbank in JSON-Dateien exportiert
export async function POST(request: Request) {
  try {
    // Security-Check: Entweder Admin-Benutzer oder API-Key
    const user = await currentUser();
    const apiKey = request.headers.get("x-api-key");
    const envApiKey = process.env.TRANSLATIONS_EXPORT_API_KEY;

    const isAuthorized = 
      (user && user.publicMetadata.role === "admin") || 
      (envApiKey && apiKey === envApiKey);

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Hole alle Übersetzungen aus der Datenbank
    const translations = await prisma.translation.findMany();
    
    if (translations.length === 0) {
      return NextResponse.json({ message: "No translations found in database" }, { status: 404 });
    }

    // Verzeichnis für die JSON-Dateien
    const translationsDir = path.join(process.cwd(), "translations");
    
    // Speichere jede Sprache in eine separate JSON-Datei
    let exportedFiles = 0;
    for (const { language, content } of translations) {
      try {
        // Überspringe Englisch, da es bereits in translations.json definiert ist
        if (language === "en") continue;

        // Parse den Inhalt, wenn es ein String ist
        const contentObj = typeof content === "string" ? JSON.parse(content) : content;
        
        // Speichere als JSON-Datei
        const filePath = path.join(translationsDir, `${language}.json`);
        await writeFile(filePath, JSON.stringify(contentObj, null, 2), "utf8");
        exportedFiles++;
        
        console.log(`✓ Exported ${language} translations to ${filePath}`);
      } catch (err) {
        console.error(`✗ Failed to export ${language} translation:`, err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Exported ${exportedFiles} translation files to JSON` 
    });
  } catch (error) {
    console.error("Error exporting translations:", error);
    return NextResponse.json(
      {
        error: "Failed to export translations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
} 