// Import all your existing JSON files to create initial translations
import { Translations } from "@/types/translations";
import translations from '@/translations/translations.json';

// Import language-specific JSON files
import deTranslations from '@/translations/de.json';
import frTranslations from '@/translations/fr.json';
import elTranslations from '@/translations/el.json';
import huTranslations from '@/translations/hu.json';
import esTranslations from '@/translations/es.json';
import itTranslations from '@/translations/it.json';
import nlTranslations from '@/translations/nl.json';
import ptTranslations from '@/translations/pt.json';
import ukTranslations from '@/translations/uk.json';
import lvTranslations from '@/translations/lv.json';
import ltTranslations from '@/translations/lt.json';
import hrTranslations from '@/translations/hr.json';

// Create a combined translations object with all available language files
// We use any type here because the JSON structure doesn't match the exact TypeScript types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const allTranslations: any = {
  ...translations
};

// Add all language translations
allTranslations.de = deTranslations;
allTranslations.fr = frTranslations;
allTranslations.el = elTranslations;
allTranslations.hu = huTranslations;
allTranslations.es = esTranslations;
allTranslations.it = itTranslations;
allTranslations.nl = nlTranslations;
allTranslations.pt = ptTranslations;
allTranslations.uk = ukTranslations;
allTranslations.lv = lvTranslations;
allTranslations.lt = ltTranslations;
allTranslations.hr = hrTranslations;

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

export const initialTranslations = validateTranslations(allTranslations);
