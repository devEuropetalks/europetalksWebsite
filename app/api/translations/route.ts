import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const revalidate = 3600; // Revalidate every hour

type TranslationContent = Record<string, Record<string, unknown>>;

function ensureValidContent(content: unknown): TranslationContent {
  // If content is already a valid object, return it
  if (typeof content === 'object' && content !== null && !Array.isArray(content)) {
    return content as TranslationContent;
  }

  // If content is a string, try to parse it
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      if (typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as TranslationContent;
      }
    } catch {
      // If parsing fails, log it
      console.error('Failed to parse content string');
    }
  }

  throw new Error('Invalid content format');
}

export async function GET() {
  try {
    console.log('Fetching translations from database...');
    const translations = await prisma.translation.findMany();
    
    // Transform the data into a more usable format
    const formattedTranslations: Record<string, TranslationContent> = {};
    
    for (const { language, content } of translations) {
      try {
        console.log(`Processing ${language} translation, content type:`, typeof content);
        formattedTranslations[language] = ensureValidContent(content);
        console.log(`✓ Successfully processed ${language} translation`);
      } catch (err) {
        console.error(`✗ Failed to process ${language} translation:`, err);
        // Don't add invalid translations to the response
      }
    }

    const availableLanguages = Object.keys(formattedTranslations);
    console.log('Available languages:', availableLanguages);

    if (availableLanguages.length === 0) {
      return NextResponse.json(
        { error: 'No valid translations available' },
        { status: 500 }
      );
    }

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
