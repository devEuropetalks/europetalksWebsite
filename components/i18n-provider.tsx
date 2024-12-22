"use client"

import { I18nextProvider as Provider } from "react-i18next"
import i18next from "i18next"
import { initReactI18next } from "react-i18next"
import homeEN from '@/public/locales/en/home.json'
import headerEN from '@/public/locales/en/header.json'
import componentsEN from '@/public/locales/en/components.json'
import aboutEN from '@/public/locales/en/about.json'
import contactEN from '@/public/locales/en/contact.json'
import eventsEN from '@/public/locales/en/events.json'
import galleryEN from '@/public/locales/en/gallery.json'
import homeFR from '@/public/locales/fr/home.json'
import headerFR from '@/public/locales/fr/header.json'
import componentsFR from '@/public/locales/fr/components.json'
import aboutFR from '@/public/locales/fr/about.json'
import contactFR from '@/public/locales/fr/contact.json'
import eventsFR from '@/public/locales/fr/events.json'
import galleryFR from '@/public/locales/fr/gallery.json'
import homeDE from '@/public/locales/de/home.json'
import headerDE from '@/public/locales/de/header.json'
import componentsDE from '@/public/locales/de/components.json'
import aboutDE from '@/public/locales/de/about.json'
import contactDE from '@/public/locales/de/contact.json'
import eventsDE from '@/public/locales/de/events.json'
import galleryDE from '@/public/locales/de/gallery.json'
import homeES from '@/public/locales/es/home.json'
import headerES from '@/public/locales/es/header.json'
import componentsES from '@/public/locales/es/components.json'
import aboutES from '@/public/locales/es/about.json'
import contactES from '@/public/locales/es/contact.json'
import eventsES from '@/public/locales/es/events.json'
import galleryES from '@/public/locales/es/gallery.json'
import homeIT from '@/public/locales/it/home.json'
import headerIT from '@/public/locales/it/header.json'
import componentsIT from '@/public/locales/it/components.json'
import aboutIT from '@/public/locales/it/about.json'
import contactIT from '@/public/locales/it/contact.json'
import eventsIT from '@/public/locales/it/events.json'
import galleryIT from '@/public/locales/it/gallery.json'
import authEN from '@/public/locales/en/auth.json'
import authDE from '@/public/locales/de/auth.json'
import authFR from '@/public/locales/fr/auth.json'
import authES from '@/public/locales/es/auth.json'
import authIT from '@/public/locales/it/auth.json'
import { InitOptions } from 'i18next';

export const i18n = i18next;

// Add this function to reload resources
i18n.reloadResources = async (language: string, namespace: string) => {
  try {
    const response = await fetch(
      `/api/translations?language=${language}&namespace=${namespace}`
    );
    if (!response.ok) {
      console.warn(`Warning: Failed to reload translations for ${language}/${namespace}`);
      return;
    }
    const data = await response.json();
    i18n.addResourceBundle(language, namespace, data, true, true);
  } catch (error) {
    console.warn("Warning: Error reloading translations:", error);
  }
};

// Initialize i18next
const config: InitOptions = {
  resources: {
    en: {
      home: homeEN,
      about: aboutEN,
      contact: contactEN,
      header: headerEN,
      components: componentsEN,
      events: eventsEN,
      gallery: galleryEN,
      auth: authEN,
      other: {}
    },
    fr: {
      home: homeFR,
      about: aboutFR,
      contact: contactFR,
      header: headerFR,
      components: componentsFR,
      events: eventsFR,
      gallery: galleryFR,
      auth: authFR
    },
    de: {
      home: homeDE,
      about: aboutDE,
      contact: contactDE,
      header: headerDE,
      components: componentsDE,
      events: eventsDE,
      gallery: galleryDE,
      auth: authDE
    },
    es: {
      home: homeES,
      about: aboutES,
      contact: contactES,
      header: headerES,
      components: componentsES,
      events: eventsES,
      gallery: galleryES,
      auth: authES
    },
    it: {
      home: homeIT,
      about: aboutIT,
      contact: contactIT,
      header: headerIT,
      components: componentsIT,
      events: eventsIT,
      gallery: galleryIT,
      auth: authIT
    },
    // Add other languages here
  },
  lng: "en", // Default language
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