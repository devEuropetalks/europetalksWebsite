"use client"

import { I18nextProvider as Provider } from "react-i18next"
import i18next from "i18next"
import { initReactI18next } from "react-i18next"

// Initialize i18next
i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          // English translations
        }
      },
      fr: {
        translation: {
          // French translations
        }
      },
      // Add more languages as needed
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  })

export function I18nextProvider({ children }: { children: React.ReactNode }) {
  return <Provider i18n={i18next}>{children}</Provider>
} 