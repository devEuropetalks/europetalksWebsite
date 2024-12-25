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

      return NextResponse.json(translation.content);
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

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = translationSchema.parse(body);

    await db.translation.upsert({
      where: { language: validatedData.language },
      create: {
        language: validatedData.language,
        content: validatedData.translations,
      },
      update: {
        content: validatedData.translations,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Translation save error:", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
