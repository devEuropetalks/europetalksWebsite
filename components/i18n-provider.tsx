"use client"

import { I18nextProvider as Provider } from "react-i18next"
import i18next, { TFunction } from "i18next"
import { initReactI18next } from "react-i18next"
import { InitOptions } from 'i18next';
import { initialTranslations } from "@/translations/initial-translations";

export const i18n = i18next;

const namespaces = [
  "home",
  "about",
  "contact",
  "events",
  "gallery",
  "header",
  "components",
  "auth",
  "other"
];

// Add this function to reload resources
i18n.reloadResources = async (language: string, namespace?: string) => {
  // Skip fetching for English - use default translations
  if (language === 'en') {
    Object.entries(initialTranslations.en).forEach(([ns, translations]) => {
      i18n.addResourceBundle('en', ns, translations, true, true);
    });
    return;
  }

  try {
    // If no specific namespace is provided, load all namespaces
    const namespacesToLoad = namespace ? [namespace] : namespaces;
    
    for (const ns of namespacesToLoad) {
      const response = await fetch(
        `/api/translations?language=${language}&namespace=${ns}`
      );
      
      if (!response.ok) {
        console.warn(`Warning: Failed to reload translations for ${language}/${ns}`);
        // Fallback to English if other language fails
        const defaultTranslations = initialTranslations.en[ns];
        i18n.addResourceBundle(language, ns, defaultTranslations, true, true);
        continue;
      }
      
      const data = await response.json();
      // The response is now already namespace-specific
      i18n.addResourceBundle(language, ns, data, true, true);
    }
  } catch (error) {
    console.warn("Warning: Error reloading translations:", error);
    // Fallback to English on error
    Object.entries(initialTranslations.en).forEach(([ns, translations]) => {
      i18n.addResourceBundle(language, ns, translations, true, true);
    });
  }
};

// Extend i18next to load all resources when changing language
const originalChangeLanguage = i18n.changeLanguage.bind(i18n);
i18n.changeLanguage = async (lng: string | undefined, callback?: (error: unknown, t: TFunction) => void) => {
  await i18n.reloadResources(lng as string);
  return originalChangeLanguage(lng, callback);
};

// Initialize i18next
const config: InitOptions = {
  resources: {
    en: initialTranslations.en // Load all English translations immediately
  },
  lng: "en",
  fallbackLng: "en",
  defaultNS: "home",
  interpolation: {
    escapeValue: false
  },
  react: {
    useSuspense: false
  },
  load: 'languageOnly',
  returnNull: false,
  returnEmptyString: false,
  fallbackNS: "other"
};

i18next
  .use(initReactI18next)
  .init(config);

export function I18nextProvider({ children }: { children: React.ReactNode }) {
  return <Provider i18n={i18n}>{children}</Provider>
} 