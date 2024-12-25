import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { initialTranslations } from "@/translations/initial-translations";

const translationSchema = z.object({
  language: z.string(),
  namespace: z.string(),
  translations: z.record(z.unknown()) as z.ZodType<Prisma.JsonValue>,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language");
    const namespace = searchParams.get("namespace");

    if (!language || !namespace) {
      return new NextResponse("Language and namespace are required", { status: 400 });
    }

    try {
      const translation = await db.translation.findUnique({
        where: { language },
        select: {
          content: true,
        },
      });

      if (!translation) {
        // If translation not found and it's not English, return English as fallback
        if (language !== 'en') {
          return NextResponse.json(initialTranslations.en[namespace] || {});
        }
        return NextResponse.json({});
      }

      // Return only the namespace-specific translations
      const namespaceTranslations = translation.content[namespace] || {};
      return NextResponse.json(namespaceTranslations);
    } catch (dbError) {
      // If database error (e.g., table doesn't exist), fallback to English translations
      console.warn("Database error, falling back to English:", dbError);
      if (language !== 'en') {
        return NextResponse.json(initialTranslations.en[namespace] || {});
      }
      return NextResponse.json({});
    }
  } catch (error) {
    console.error("Translation fetch error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = translationSchema.parse(body);

    // Get existing translations
    const existingTranslation = await db.translation.findUnique({
      where: { language: validatedData.language },
      select: {
        content: true,
      },
    });

    if (existingTranslation) {
      // Create updated content by merging existing content with new translations
      const updatedContent = {
        ...(existingTranslation.content as Prisma.JsonObject),
        [validatedData.namespace]: validatedData.translations
      };

      // Update using Prisma's update method
      await db.translation.update({
        where: { 
          language: validatedData.language 
        },
        data: {
          content: updatedContent
        }
      });
    } else {
      // Create new translation
      const initialContent = {
        [validatedData.namespace]: validatedData.translations
      };

      await db.translation.create({
        data: {
          id: `cm${Math.random().toString(36).slice(2)}`,
          language: validatedData.language,
          content: initialContent,
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Translation save error:", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    return new NextResponse(error instanceof Error ? error.message : "Internal Server Error", { status: 500 });
  }
}
