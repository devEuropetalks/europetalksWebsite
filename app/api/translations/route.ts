import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    console.log('Fetching translations from database...');
    const translations = await prisma.translation.findMany();
    console.log('Raw database response:', JSON.stringify(translations, null, 2));

    if (translations.length === 0) {
      console.warn('No translations found in database');
      return NextResponse.json(
        { error: 'No translations available' },
        { status: 404 }
      );
    }
    
    // Transform the data into a more usable format
    const formattedTranslations = translations.reduce((acc, { language, content }) => {
      console.log(`Processing ${language} translation:`, {
        contentType: typeof content,
        contentSample: content ? JSON.stringify(content).slice(0, 100) + '...' : 'empty'
      });

      if (!content) {
        console.warn(`Empty content for language: ${language}`);
        return acc;
      }

      try {
        // Handle different content formats
        let parsedContent;
        if (typeof content === 'string') {
          console.log(`Parsing string content for ${language}`);
          parsedContent = JSON.parse(content);
        } else if (typeof content === 'object') {
          console.log(`Using object content for ${language}`);
          parsedContent = content;
        } else {
          throw new Error(`Unexpected content type: ${typeof content}`);
        }

        // Validate the parsed content
        if (!parsedContent || typeof parsedContent !== 'object') {
          throw new Error('Invalid content structure');
        }

        acc[language] = parsedContent;
        console.log(`Successfully processed ${language} translation with keys:`, Object.keys(parsedContent));
      } catch (err) {
        console.error(`Error processing ${language} translation:`, err);
        console.error('Problematic content:', content);
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

    console.log('Final formatted translations:', {
      languages: Object.keys(formattedTranslations),
      sampleStructure: Object.entries(formattedTranslations).map(([lang, content]) => ({
        language: lang,
        keys: Object.keys(content)
      }))
    });

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
