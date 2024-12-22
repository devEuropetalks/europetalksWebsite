"use client"

import { I18nextProvider as Provider } from "react-i18next"
import i18next from "i18next"
import { initReactI18next } from "react-i18next"
import aboutEN from '@/public/locales/en/about.json'
import homeEN from '@/public/locales/en/home.json'
import contactEN from '@/public/locales/en/contact.json'
import homeFR from '@/public/locales/fr/home.json'
import aboutFR from '@/public/locales/fr/about.json'
import contactFR from '@/public/locales/fr/contact.json'
import homeDE from '@/public/locales/de/home.json'
import aboutDE from '@/public/locales/de/about.json'
import contactDE from '@/public/locales/de/contact.json'
import homeES from '@/public/locales/es/home.json'
import aboutES from '@/public/locales/es/about.json'
import contactES from '@/public/locales/es/contact.json'
import homeIT from '@/public/locales/it/home.json'
import aboutIT from '@/public/locales/it/about.json'
import contactIT from '@/public/locales/it/contact.json'

// Initialize i18next
i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        home: homeEN,
        about: aboutEN,
        contact: contactEN
      },
      fr: {
        home: homeFR,
        about: aboutFR,
        contact: contactFR
      },
      de: {
        home: homeDE,
        about: aboutDE,
        contact: contactDE
      },
      es: {
        home: homeES,
        about: aboutES,
        contact: contactES
      },
      it: {
        home: homeIT,
        about: aboutIT,
        contact: contactIT
      },
      // Add other languages here
    },
    lng: "en", // Default language
    fallbackLng: "en",
    defaultNS: "home",
    interpolation: {
      escapeValue: false
    }
  })

export function I18nextProvider({ children }: { children: React.ReactNode }) {
  return <Provider i18n={i18next}>{children}</Provider>
} 