"use client"

import { I18nextProvider as Provider } from "react-i18next"
import i18next from "i18next"
import { initReactI18next } from "react-i18next"
import { InitOptions } from 'i18next';
import { initialTranslations } from "@/scripts/initial-translations";

export const i18n = i18next;

// Add this function to reload resources
i18n.reloadResources = async (language: string, namespace: string) => {
  // Skip fetching for English - use default translations
  if (language === 'en') {
    const defaultTranslations = initialTranslations.en[namespace];
    i18n.addResourceBundle('en', namespace, defaultTranslations, true, true);
    return;
  }

  try {
    const response = await fetch(
      `/api/translations?language=${language}&namespace=${namespace}`
    );
    if (!response.ok) {
      console.warn(`Warning: Failed to reload translations for ${language}/${namespace}`);
      // Fallback to English if other language fails
      const defaultTranslations = initialTranslations.en[namespace];
      i18n.addResourceBundle(language, namespace, defaultTranslations, true, true);
      return;
    }
    const data = await response.json();
    i18n.addResourceBundle(language, namespace, data, true, true);
  } catch (error) {
    console.warn("Warning: Error reloading translations:", error);
    // Fallback to English on error
    const defaultTranslations = initialTranslations.en[namespace];
    i18n.addResourceBundle(language, namespace, defaultTranslations, true, true);
  }
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