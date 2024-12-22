import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

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

    if (!translation) {
      return NextResponse.json(
        { error: "Translation not found" },
        { status: 404 }
      );
    }

    const content = translation.content as Record<string, unknown>;
    return NextResponse.json(content[namespace] || {});
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

    // Update file system for fallback
    const filePath = path.join(
      process.cwd(),
      "public",
      "locales",
      language,
      `${namespace}.json`
    );
    await fs.writeFile(filePath, JSON.stringify(translations, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Translation save error:", error);
    return NextResponse.json(
      { error: "Failed to save translations" },
      { status: 500 }
    );
  }
}
