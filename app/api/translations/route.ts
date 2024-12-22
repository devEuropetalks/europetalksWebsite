import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import fs from "fs/promises";
import path from "path";
import { TranslationObject } from "@/types/translations";

type BaseTranslationModel = {
  findUnique: (args: {
    where: { language: string };
  }) => Promise<{ content: TranslationObject } | null>;
  upsert: (args: {
    where: { language: string };
    create: { language: string; content: TranslationObject };
    update: { content: TranslationObject };
  }) => Promise<{ content: TranslationObject }>;
};

const namespaceToModel: Record<string, BaseTranslationModel> = {
  home: db.homeTranslation as unknown as BaseTranslationModel,
  header: db.headerTranslation as unknown as BaseTranslationModel,
  about: db.aboutTranslation as unknown as BaseTranslationModel,
  contact: db.contactTranslation as unknown as BaseTranslationModel,
  events: db.eventsTranslation as unknown as BaseTranslationModel,
  gallery: db.galleryTranslation as unknown as BaseTranslationModel,
  components: db.componentsTranslation as unknown as BaseTranslationModel,
  other: db.otherTranslation as unknown as BaseTranslationModel,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language");
  const namespace = searchParams.get("namespace");

  if (!language || !namespace) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const model = namespaceToModel[namespace];
    if (!model) {
      throw new Error(`Invalid namespace: ${namespace}`);
    }

    // Try to get from database first
    const translation = await model.findUnique({
      where: { language },
    });

    if (translation) {
      return NextResponse.json(translation.content);
    }

    // Fall back to file system if no translation in DB
    const filePath = path.join(
      process.cwd(),
      "public",
      "locales",
      language,
      `${namespace}.json`
    );
    const content = await fs.readFile(filePath, "utf-8");
    return NextResponse.json(JSON.parse(content) as TranslationObject);
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

    const model = namespaceToModel[namespace];
    if (!model) {
      throw new Error(`Invalid namespace: ${namespace}`);
    }

    await model.upsert({
      where: { language },
      create: {
        language,
        content: translations,
      },
      update: {
        content: translations,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Translation save error:", error);
    return NextResponse.json(
      { error: "Failed to save translations" },
      { status: 500 }
    );
  }
}
