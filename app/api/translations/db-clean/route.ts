import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

/**
 * This is a test API for cleaning database translations
 * For real use, use the clean endpoint with POST instead
 */
export async function GET() {
  try {
    // Security-Check: Only admin users can access this
    const user = await currentUser();
    if (!user || user.publicMetadata.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Only admins can clean translations." }, { status: 401 });
    }

    console.log("Running database cleanup test");

    // Check if Translation table exists
    try {
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'Translation'
        );
      `;
      
      console.log("Table exists check:", tableExists);

      if (!tableExists[0].exists) {
        return NextResponse.json({ 
          error: "Translation table does not exist in the database" 
        }, { status: 404 });
      }

      // List all translation records
      const translations = await prisma.translation.findMany();
      console.log(`Found ${translations.length} translation records in database`);

      // For safety, we're just listing the translations, not modifying them
      const translationSummary = translations.map(t => ({
        id: t.id,
        language: t.language,
        contentSize: JSON.stringify(t.content).length,
      }));

      return NextResponse.json({ 
        success: true, 
        message: `Found ${translations.length} translation records`,
        translations: translationSummary
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json({ 
        error: "Database error", 
        details: dbError instanceof Error ? dbError.message : String(dbError) 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({
      error: "Failed to connect to database",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
} 