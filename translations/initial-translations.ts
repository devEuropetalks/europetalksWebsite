// Only load English translations initially - other languages load on demand
import { Translations } from "@/types/translations";
import enTranslations from "@/translations/en.json";

// Create initial translations with only English (default language)
// Other languages will be loaded dynamically when needed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const allTranslations: any = {
  en: enTranslations,
};

// Validate and type the translations
function validateTranslations(data: unknown): Translations {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid translations format: root must be an object");
  }

  const translationsData = data as Record<string, unknown>;

  Object.entries(translationsData).forEach(([lang, content]) => {
    if (typeof content !== "object" || content === null) {
      throw new Error(
        `Invalid translations format for language ${lang}: must be an object`
      );
    }

    const languageContent = content as Record<string, unknown>;
    Object.entries(languageContent).forEach(([namespace, translations]) => {
      if (typeof translations !== "object" || translations === null) {
        throw new Error(
          `Invalid translations format for ${lang}/${namespace}: must be an object`
        );
      }
    });
  });

  return data as Translations;
}

export const initialTranslations = validateTranslations(allTranslations);

// Dynamic import function for other languages
export async function loadLanguage(langCode: string): Promise<Record<string, unknown> | null> {
  if (langCode === "en") return enTranslations;
  
  try {
    // Dynamic import based on language code
    const translations = await import(`@/translations/${langCode}.json`);
    return translations.default;
  } catch (error) {
    console.warn(`Failed to load translations for ${langCode}:`, error);
    return null;
  }
}
