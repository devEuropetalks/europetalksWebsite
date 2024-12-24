import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const translationSchema = z.object({
  language: z.string(),
  namespace: z.string(),
  translations: z.record(z.unknown()),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language");
    const namespace = searchParams.get("namespace");

    if (!language || !namespace) {
      return new NextResponse("Language and namespace are required", { status: 400 });
    }

    const translation = await db.translation.findUnique({
      where: { language },
      select: {
        content: true,
      },
    });

    if (!translation) {
      return NextResponse.json({});
    }

    const content = translation.content as Record<string, unknown>;
    return NextResponse.json(content[namespace] || {});
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

    const existing = await db.translation.findUnique({
      where: { language: validatedData.language },
      select: {
        content: true,
      },
    });

    const content = existing ? { ...(existing.content as object) } : {};
    content[validatedData.namespace] = validatedData.translations;

    await db.translation.upsert({
      where: { language: validatedData.language },
      create: {
        language: validatedData.language,
        content,
      },
      update: {
        content,
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
