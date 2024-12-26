// Base type for leaf translation values
export type TranslationValue = string | number | boolean | null;

// Type for a translation object that can contain nested objects or leaf values
export type TranslationObject = {
  [key: string]: TranslationValue | TranslationObject;
};

// Type for a namespace's translations
export type TranslationNamespace = Record<string, TranslationObject>;

// Type for a language's translations (contains namespaces)
export type LanguageTranslations = Record<string, TranslationNamespace>;

// Type for all translations (keyed by language code)
export type Translations = Record<string, LanguageTranslations>; 