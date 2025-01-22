"use client";

import { I18nextProvider as Provider } from "react-i18next";
import i18next, { TFunction } from "i18next";
import { initReactI18next } from "react-i18next";
import { InitOptions } from "i18next";
import { initialTranslations } from "@/translations/initial-translations";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";

export const i18n = i18next;

// Static translations for the language detection popup
const popupTranslations = {
  en: {
    available: "This website is available in your language!",
    switchTo: "Switch to {{language}}",
  },
  de: {
    available: "Diese Website ist in Ihrer Sprache verfügbar!",
    switchTo: "Zu {{language}} wechseln",
  },
  fr: {
    available: "Ce site est disponible dans votre langue !",
    switchTo: "Passer à {{language}}",
  },
  es: {
    available: "¡Este sitio web está disponible en su idioma!",
    switchTo: "Cambiar a {{language}}",
  },
  it: {
    available: "Questo sito è disponibile nella tua lingua!",
    switchTo: "Passa a {{language}}",
  },
} as const;

const namespaces = [
  "home",
  "about",
  "contact",
  "events",
  "gallery",
  "header",
  "components",
  "auth",
  "other",
];

// Add this function to reload resources
i18n.reloadResources = async (language: string, namespace?: string) => {
  try {
    // Skip on server-side
    if (typeof window === "undefined") {
      return;
    }

    // Skip API calls for English - use translations.json directly
    if (language === "en") {
      if (namespace) {
        // Add single namespace for English
        i18n.addResourceBundle(
          "en",
          namespace,
          initialTranslations.en[namespace],
          true,
          true
        );
      } else {
        // Add all namespaces for English
        Object.entries(initialTranslations.en).forEach(([ns, translations]) => {
          i18n.addResourceBundle("en", ns, translations, true, true);
        });
      }
      return;
    }

    // If no specific namespace is provided, load all namespaces
    const namespacesToLoad = namespace ? [namespace] : namespaces;

    for (const ns of namespacesToLoad) {
      const response = await fetch(
        `/api/translations?language=${language}&namespace=${ns}`
      );

      if (!response.ok) {
        console.warn(
          `Warning: Failed to reload translations for ${language}/${ns}`
        );
        // Fallback to English if other language fails
        const defaultTranslations = initialTranslations.en[ns];
        i18n.addResourceBundle(language, ns, defaultTranslations, true, true);
        continue;
      }

      const data = await response.json();
      // The response is now the namespace content directly when requesting a specific namespace
      const content = namespace ? data : data[ns];
      if (content) {
        console.log(`Adding ${language}/${ns} translations:`, content);
        i18n.addResourceBundle(language, ns, content, true, true);
      }
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
i18n.changeLanguage = async (
  lng: string | undefined,
  callback?: (error: unknown, t: TFunction) => void
) => {
  await i18n.reloadResources(lng as string);
  return originalChangeLanguage(lng, callback);
};

// Initialize i18next
const config: InitOptions = {
  resources: {
    en: initialTranslations.en, // Load all English translations immediately
  },
  lng: "en",
  fallbackLng: "en",
  defaultNS: "home",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  load: "languageOnly",
  returnNull: false,
  returnEmptyString: false,
  fallbackNS: "other",
  ns: namespaces,
};

i18next.use(initReactI18next).init(config);

export function I18nextProvider({ children }: { children: React.ReactNode }) {
  const [showLanguageHint, setShowLanguageHint] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const { reload: reloadTranslations } = useTranslations();

  const languageNames = {
    en: "English",
    de: "Deutsch",
    fr: "Français",
    es: "Español",
    it: "Italiano",
  } as const;

  useEffect(() => {
    const detectAndPrefetchLanguage = async () => {
      // Get browser language (first 2 characters only)
      const browserLang = navigator.language.slice(0, 2).toLowerCase();

      // Skip if browser language is English (already loaded) or already using detected language
      if (
        browserLang === "en" ||
        browserLang === i18n.language ||
        !(browserLang in popupTranslations)
      ) {
        return;
      }

      setDetectedLanguage(browserLang);
      setShowLanguageHint(true);
    };

    detectAndPrefetchLanguage();
  }, []);

  const handleLanguageSwitch = async () => {
    if (detectedLanguage) {
      try {
        // First, fetch all translations for the new language
        const response = await fetch(
          `/api/translations?language=${detectedLanguage}`
        );
        if (!response.ok) throw new Error("Failed to fetch translations");

        const data = await response.json();

        // Add all resources to i18next
        Object.entries(data).forEach(([namespace, content]) => {
          i18n.addResourceBundle(
            detectedLanguage,
            namespace,
            content,
            true,
            true
          );
        });

        // Change the language after resources are loaded
        await i18n.changeLanguage(detectedLanguage);
        await reloadTranslations();
        setShowLanguageHint(false);
      } catch (error) {
        console.error("Failed to switch language:", error);
      }
    }
  };

  return (
    <Provider i18n={i18n}>
      {showLanguageHint && detectedLanguage && (
        <div className="fixed bottom-4 right-4 p-4 bg-primary text-primary-foreground rounded-lg shadow-lg z-50 max-w-sm">
          <button
            onClick={() => setShowLanguageHint(false)}
            className="absolute top-2 right-2 text-primary-foreground/80 hover:text-primary-foreground"
          >
            <X size={16} />
          </button>
          <p className="mb-3">
            {
              popupTranslations[
                detectedLanguage as keyof typeof popupTranslations
              ].available
            }
          </p>
          <Button
            onClick={handleLanguageSwitch}
            variant="secondary"
            className="w-full"
          >
            {popupTranslations[
              detectedLanguage as keyof typeof popupTranslations
            ].switchTo.replace(
              "{{language}}",
              languageNames[detectedLanguage as keyof typeof languageNames] ||
                detectedLanguage
            )}
          </Button>
        </div>
      )}
      {children}
    </Provider>
  );
}
