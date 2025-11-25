"use client";

import { I18nextProvider as Provider } from "react-i18next";
import i18next, { TFunction } from "i18next";
import { initReactI18next } from "react-i18next";
import { InitOptions } from "i18next";
import { initialTranslations, loadLanguage } from "@/translations/initial-translations";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { X } from "lucide-react";

export const i18n = i18next;

// Cache for loaded translations
const loadedLanguages = new Set<string>(["en"]);
const prefetchingLanguages = new Set<string>();

// Prefetch a language without switching to it
export async function prefetchLanguage(langCode: string): Promise<void> {
  // Skip if already loaded or currently prefetching
  if (loadedLanguages.has(langCode) || prefetchingLanguages.has(langCode)) {
    return;
  }

  prefetchingLanguages.add(langCode);
  
  try {
    const translations = await loadLanguage(langCode);
    if (translations) {
      Object.entries(translations).forEach(([ns, content]) => {
        i18n.addResourceBundle(langCode, ns, content, true, true);
      });
      loadedLanguages.add(langCode);
    }
  } finally {
    prefetchingLanguages.delete(langCode);
  }
}

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
  pt: {
    available: "Este site está disponível em sua língua!",
    switchTo: "Mudar para {{language}}",
  },
  nl: {
    available: "Deze website is beschikbaar in uw taal!",
    switchTo: "Wijzigen naar {{language}}",
  },
  uk: {
    available: "Цей сайт доступний у вашій мові!",
    switchTo: "Перейти на {{language}}",
  },
  lv: {
    available: "Šī vietne ir pieejama jūsu valodā!",
    switchTo: "Pāriet uz {{language}}",
  },
  lt: {
    available: "Ši svetainė pasiekiama jūsų kalba!",
    switchTo: "Perjungti į {{language}}",
  },
  hr: {
    available: "Ova stranica je dostupna na vašoj jeziku!",
    switchTo: "Prelazak na {{language}}",
  },
  hu: {
    available: "Ez az oldal elérhető a nyelveden!",
    switchTo: "Átváltás {{language}} nyelvre",
  },
  el: {
    available: "Αυτή η σελίδα είναι διαθέσιμη στην γλώσσα σας!",
    switchTo: "Αλλαγή στη {{language}}",
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

// Load resources for a specific language (with dynamic import)
i18n.reloadResources = async (language: string, namespace?: string) => {
  if (typeof window === "undefined") return;

  // If language not loaded yet, fetch it dynamically
  if (!loadedLanguages.has(language)) {
    const translations = await loadLanguage(language);
    if (translations) {
      // Add all namespaces from the loaded translations
      Object.entries(translations).forEach(([ns, content]) => {
        i18n.addResourceBundle(language, ns, content, true, true);
      });
      loadedLanguages.add(language);
    }
    return;
  }

  // Language already loaded, just ensure resources are available
  if (namespace) {
    const bundle = i18n.getResourceBundle(language, namespace);
    if (bundle) {
      i18n.addResourceBundle(language, namespace, bundle, true, true);
    }
  }
};

// Extend i18next to load all resources when changing language
const originalChangeLanguage = i18n.changeLanguage.bind(i18n);
i18n.changeLanguage = async (
  lng: string | undefined,
  callback?: (error: unknown, t: TFunction) => void
) => {
  if (lng) {
    await i18n.reloadResources(lng);
  }
  return originalChangeLanguage(lng, callback);
};

// Initialize i18next with only English loaded initially
const config: InitOptions = {
  resources: initialTranslations,
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

  const languageNames = {
    en: "English",
    de: "Deutsch",
    fr: "Français",
    es: "Español",
    it: "Italiano",
    pt: "Português",
    nl: "Nederlands",
    uk: "Українська",
    lv: "Latviešu",
    lt: "Lietuvių",
    hr: "Hrvatski",
    hu: "Magyar",
    el: "Greek",
  } as const;

  useEffect(() => {
    const detectLanguage = async () => {
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

      // Prefetch the detected language in background
      loadLanguage(browserLang).then((translations) => {
        if (translations) {
          Object.entries(translations).forEach(([ns, content]) => {
            i18n.addResourceBundle(browserLang, ns, content, true, true);
          });
          loadedLanguages.add(browserLang);
        }
      });

      setDetectedLanguage(browserLang);
      setShowLanguageHint(true);
    };

    detectLanguage();
  }, []);

  const handleLanguageSwitch = async () => {
    if (detectedLanguage) {
      try {
        await i18n.changeLanguage(detectedLanguage);
        setShowLanguageHint(false);
      } catch (error) {
        console.error("Failed to switch language:", error);
      }
    }
  };

  return (
    <Provider i18n={i18n}>
      {showLanguageHint && detectedLanguage && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-background border rounded-lg shadow-lg p-4">
          <button
            onClick={() => setShowLanguageHint(false)}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="mb-3">
            {popupTranslations[
              detectedLanguage as keyof typeof popupTranslations
            ]?.available || popupTranslations.en.available}
          </p>
          <Button onClick={handleLanguageSwitch} className="w-full">
            {(
              popupTranslations[
                detectedLanguage as keyof typeof popupTranslations
              ]?.switchTo || popupTranslations.en.switchTo
            ).replace(
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
