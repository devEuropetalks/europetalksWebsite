// Import all your existing JSON files to create initial translations
import { Translations } from "@/types/translations";
import translations from '@/translations/translations.json';

// Validate and type the translations
function validateTranslations(data: unknown): Translations {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid translations format: root must be an object');
  }

  // Cast to Record<string, unknown> first to allow type checking
  const translationsData = data as Record<string, unknown>;

  // Validate each language
  Object.entries(translationsData).forEach(([lang, content]) => {
    if (typeof content !== 'object' || content === null) {
      throw new Error(`Invalid translations format for language ${lang}: must be an object`);
    }

    // Validate each namespace
    const languageContent = content as Record<string, unknown>;
    Object.entries(languageContent).forEach(([namespace, translations]) => {
      if (typeof translations !== 'object' || translations === null) {
        throw new Error(`Invalid translations format for ${lang}/${namespace}: must be an object`);
      }
    });
  });

  return data as Translations;
}

export const initialTranslations = validateTranslations(translations);
