import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language");
    const namespace = searchParams.get("namespace");

    if (!language || !namespace) {
      return NextResponse.json(
        { error: "Language and namespace are required" },
        { status: 400 }
      );
    }

    const translation = await db.translation.findUnique({
      where: { language },
    });

    if (translation) {
      const content = translation.content as Record<string, unknown>;
      return NextResponse.json(content[namespace] || {});
    }

    return NextResponse.json({});
  } catch (error) {
    console.error("Translation fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch translations" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { language, namespace, translations } = await request.json();

    const existing = await db.translation.findUnique({
      where: { language },
    });

    const content = existing ? { ...(existing.content as object) } : {};
    content[namespace] = translations;

    await db.translation.upsert({
      where: { language },
      create: {
        language,
        content,
      },
      update: {
        content,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Translation save error:", error);
    return NextResponse.json(
      { error: "Failed to save translations" },
      { status: 500 }
    );
  }
}
