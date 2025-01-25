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

    console.log(
      `Fetching translations for language: ${language}, namespace: ${namespace}`
    );

    const translations = await prisma.translation.findMany({
      where: language ? { language } : undefined,
    });

    // If no translations found, return 404
    if (translations.length === 0) {
      return NextResponse.json(
        { error: "No translations found" },
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
              [namespace]: parsedContent[namespace],
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
        ? (formattedTranslations[language][namespace] as TranslationNamespace)
        : formattedTranslations[language]
      : formattedTranslations;

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
