import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  Translations,
  LanguageTranslations,
  TranslationNamespace,
} from "@/types/translations";
import { currentUser } from "@clerk/nextjs/server";

function ensureValidContent(content: unknown): LanguageTranslations {
  if (
    typeof content === "object" &&
    content !== null &&
    !Array.isArray(content)
  ) {
    // Validate each namespace
    const contentObj = content as Record<string, unknown>;
    Object.entries(contentObj).forEach(([namespace, translations]) => {
      if (typeof translations !== "object" || translations === null) {
        throw new Error(`Invalid translations for namespace ${namespace}`);
      }
    });
    return content as LanguageTranslations;
  }

  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content);
      if (typeof parsed === "object" && !Array.isArray(parsed)) {
        return ensureValidContent(parsed);
      }
    } catch {
      console.error("Failed to parse content string");
    }
  }

  throw new Error("Invalid content format");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language");
    const namespace = searchParams.get("namespace");

    // Fetching translations for language and namespace

    const translations = await prisma.translation.findMany({
      where: language ? { language } : undefined,
    });

    // If no translations found in database, return empty object
    // The app will fall back to JSON files from initialTranslations
    if (translations.length === 0) {
      // If requesting a specific language/namespace, return empty structure
      if (language && namespace) {
        return NextResponse.json({});
      }
      if (language) {
        return NextResponse.json({});
      }
      // If requesting all languages, return empty object
      return NextResponse.json({});
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
              [namespace]: parsedContent[namespace],
            };
          }
        } else {
          formattedTranslations[language] = parsedContent;
        }

        console.warn(`✓ Successfully processed ${language} translation`);
      } catch (err) {
        console.error(`✗ Failed to process ${language} translation:`, err);
      }
    }

    // If we're requesting a specific language and namespace, return just that content
    let responseData;
    if (language && namespace) {
      // Check if the language and namespace exist
      if (formattedTranslations[language] && formattedTranslations[language][namespace]) {
        responseData = formattedTranslations[language][namespace] as TranslationNamespace;
      } else {
        // Return empty object if not found (will use JSON fallback)
        responseData = {};
      }
    } else if (language) {
      responseData = formattedTranslations[language] || {};
    } else {
      responseData = formattedTranslations;
    }

    // Set cache-control header to prevent caching
    const headers = {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    };

    return NextResponse.json(responseData, { headers });
  } catch (error) {
    console.error("Error fetching translations:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch translations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    // Check authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { language, namespace, translations } = body;

    if (!language || !namespace || !translations) {
      return NextResponse.json(
        { error: "Missing required fields: language, namespace, translations" },
        { status: 400 }
      );
    }

    // Validate translations object
    if (typeof translations !== "object" || translations === null) {
      return NextResponse.json(
        { error: "Invalid translations format" },
        { status: 400 }
      );
    }

    // Get existing translation
    const existingTranslation = await prisma.translation.findUnique({
      where: { language },
    });

    if (!existingTranslation) {
      return NextResponse.json(
        { error: "Translation not found" },
        { status: 404 }
      );
    }

    // Parse existing content
    let existingContent: Record<string, unknown>;
    if (typeof existingTranslation.content === "string") {
      existingContent = JSON.parse(existingTranslation.content);
    } else {
      existingContent = existingTranslation.content as Record<string, unknown>;
    }

    // Update only the specified namespace
    const updatedContent = {
      ...existingContent,
      [namespace]: translations,
    };

    // Save the updated translation
    await prisma.translation.update({
      where: { language },
      data: {
        content: updatedContent,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating translations:", error);
    return NextResponse.json(
      {
        error: "Failed to update translations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
