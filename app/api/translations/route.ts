import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    const translations = await prisma.translation.findMany();
    
    // Transform the data into a more usable format
    const formattedTranslations = translations.reduce((acc, { language, content }) => {
      acc[language] = content as Record<string, string>;
      return acc;
    }, {} as Record<string, Record<string, string>>);

    // Set cache headers
    const headers = {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    };

    return NextResponse.json(formattedTranslations, { headers });
  } catch (error) {
    console.error('Error fetching translations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch translations' },
      { status: 500 }
    );
  }
}
