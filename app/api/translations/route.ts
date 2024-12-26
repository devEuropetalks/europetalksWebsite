import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Translations, LanguageTranslations, TranslationNamespace } from "@/types/translations";

export const revalidate = 3600; // Revalidate every hour

function ensureValidContent(content: unknown): LanguageTranslations {
  if (typeof content === 'object' && content !== null && !Array.isArray(content)) {
    // Validate each namespace
    const contentObj = content as Record<string, unknown>;
    Object.entries(contentObj).forEach(([namespace, translations]) => {
      if (typeof translations !== 'object' || translations === null) {
        throw new Error(`Invalid translations for namespace ${namespace}`);
      }
    });
    return content as LanguageTranslations;
  }

  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      if (typeof parsed === 'object' && !Array.isArray(parsed)) {
        return ensureValidContent(parsed);
      }
    } catch {
      console.error('Failed to parse content string');
    }
  }

  throw new Error('Invalid content format');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');
    const namespace = searchParams.get('namespace');

    console.log(`Fetching translations for language: ${language}, namespace: ${namespace}`);

    const translations = await prisma.translation.findMany({
      where: language ? { language } : undefined
    });
    
    // If no translations found, return 404
    if (translations.length === 0) {
      return NextResponse.json(
        { error: 'No translations found' },
        { status: 404 }
      );
    }

    // Transform the data into the correct format
    const formattedTranslations: Translations = {};
    
    for (const { language, content } of translations) {
      try {
        const parsedContent = ensureValidContent(content);
        
        // If a specific namespace is requested, only return that namespace's content directly
        if (namespace) {
          if (parsedContent[namespace]) {
            formattedTranslations[language] = {
              [namespace]: parsedContent[namespace]
            };
          }
        } else {
          formattedTranslations[language] = parsedContent;
        }
        
        console.log(`✓ Successfully processed ${language} translation`);
      } catch (err) {
        console.error(`✗ Failed to process ${language} translation:`, err);
      }
    }

    // If we're requesting a specific language and namespace, return just that content
    const responseData = language 
      ? namespace 
        ? formattedTranslations[language][namespace] as TranslationNamespace
        : formattedTranslations[language]
      : formattedTranslations;

    // Set cache headers
    const headers = {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    };

    return NextResponse.json(responseData, { headers });
  } catch (error) {
    console.error('Error fetching translations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch translations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
