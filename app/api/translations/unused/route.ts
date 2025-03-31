import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { currentUser } from "@clerk/nextjs/server";

/**
 * API-Route zum Abrufen der ungenutzten Übersetzungen
 * Liest die vom Node.js-Script erstellte unused-translations.json-Datei
 */
export async function GET(/* request: Request */) {
  try {
    // Security-Check: Nur Admin-Benutzer dürfen diese Aktion ausführen
    const user = await currentUser();
    if (!user || user.publicMetadata.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Only admins can access this information." }, { status: 401 });
    }

    try {
      // Versuche, die Datei mit ungenutzten Übersetzungen zu lesen
      const filePath = path.join(process.cwd(), "unused-translations.json");
      const fileContent = await readFile(filePath, 'utf8');
      const unusedTranslations = JSON.parse(fileContent);
      
      return NextResponse.json(unusedTranslations);
    } catch (fileError) {
      console.error("Error reading unused translations file:", fileError);
      
      // Generate mock data for testing when the file doesn't exist
      const mockData = {
        header: ["navigation.home", "navigation.about", "other.signIn"],
        components: ["languageSelector.label", "theme.toggleTheme"],
        home: ["hero.title", "cta.buttons.explore"],
        auth: ["signIn.title", "signUp.error"],
        other: ["months.january", "cities.berlin", "countries.germany"]
      };
      
      // Return mock data with a warning message
      return NextResponse.json(
        mockData,
        { 
          headers: {
            "X-Warning": "Using mock data. For production use, run 'node scripts/clean-translations.js' first."
          }
        }
      );
    }
  } catch (error) {
    console.error("Error accessing unused translations:", error);
    return NextResponse.json(
      {
        error: "Failed to access unused translations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
} 