import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { TranslationObject } from "@/types/translations";

// Change to app directory instead of public
const TRANSLATIONS_DIR = path.join(process.cwd(), "app", "translations-data");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language");
  const namespace = searchParams.get("namespace");

  if (!language || !namespace) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    // First try to read from app directory
    const filePath = path.join(TRANSLATIONS_DIR, language, `${namespace}.json`);
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return NextResponse.json(JSON.parse(content) as TranslationObject);
    } catch {
      // If file doesn't exist in app directory, fall back to public directory
      const publicPath = path.join(
        process.cwd(),
        "public",
        "locales",
        language,
        `${namespace}.json`
      );
      const content = await fs.readFile(publicPath, "utf-8");
      return NextResponse.json(JSON.parse(content) as TranslationObject);
    }
  } catch (error: unknown) {
    console.error("Translation load error:", error);
    return NextResponse.json(
      { error: "Failed to load translations" },
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
    
    // Save to app directory
    const localesDir = path.join(TRANSLATIONS_DIR, language);
    await fs.mkdir(localesDir, { recursive: true });
    
    const filePath = path.join(localesDir, `${namespace}.json`);
    
    await fs.writeFile(
      filePath,
      JSON.stringify(translations, null, 2),
      "utf-8"
    );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Translation save error:", error);
    return NextResponse.json(
      { error: "Failed to save translations" },
      { status: 500 }
    );
  }
} 