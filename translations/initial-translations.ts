// Import all your existing JSON files to create initial translations
import { TranslationObject } from "@/types/translations";
import translations from '@/translations/translations.json';

export const initialTranslations: Record<string, Record<string, TranslationObject>> = translations;
