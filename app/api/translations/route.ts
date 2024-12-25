import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    console.log('Fetching translations from database...');
    const translations = await prisma.translation.findMany();
    console.log('Found translations:', translations.map(t => t.language));

    if (translations.length === 0) {
      console.warn('No translations found in database');
      return NextResponse.json(
        { error: 'No translations available' },
        { status: 404 }
      );
    }
    
    // Transform the data into a more usable format
    const formattedTranslations = translations.reduce((acc, { language, content }) => {
      if (!content) {
        console.warn(`Empty content for language: ${language}`);
        return acc;
      }

      try {
        // Ensure content is properly structured
        const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
        acc[language] = parsedContent;
        console.log(`Successfully processed ${language} translation with keys:`, Object.keys(parsedContent));
      } catch (err) {
        console.error(`Error processing ${language} translation:`, err);
      }
      return acc;
    }, {} as Record<string, Record<string, string>>);

    // Validate we have at least some translations
    if (Object.keys(formattedTranslations).length === 0) {
      console.error('No valid translations after processing');
      return NextResponse.json(
        { error: 'No valid translations available' },
        { status: 500 }
      );
    }

    console.log('Available languages:', Object.keys(formattedTranslations));

    // Set cache headers
    const headers = {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    };

    return NextResponse.json(formattedTranslations, { headers });
  } catch (error) {
    console.error('Error fetching translations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch translations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
