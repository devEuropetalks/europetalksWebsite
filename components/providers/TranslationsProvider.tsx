'use client';

import { useTranslations } from '@/hooks/use-translations';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TranslationObject } from '@/types/translations';

interface TranslationsProviderProps {
  children: React.ReactNode;
}

export function TranslationsProvider({ children }: TranslationsProviderProps) {
  const { translations, isLoading, error } = useTranslations();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!isLoading) {
      // Always try to add translations, even if empty (database might be empty)
      if (translations && Object.keys(translations).length > 0) {
        // Adding database translations to i18next
        // Add all resources to i18next (these will override JSON fallbacks if they exist)
        Object.entries(translations).forEach(([lang, resources]) => {
          if (typeof resources === 'object' && resources !== null) {
            Object.entries(resources).forEach(([namespace, content]) => {
              if (content && typeof content === 'object' && Object.keys(content).length > 0) {
                // Adding translations from database
                i18n.addResourceBundle(lang, namespace, content as TranslationObject, true, true);
              }
            });
          }
        });
      } else {
        // No database translations found, using JSON file fallbacks
      }
    }
  }, [translations, isLoading, i18n]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[100px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    console.error('Translation loading error:', error);
    // Don't show error to user - JSON fallbacks are already loaded via initialTranslations
    // The app will continue to work with the JSON file translations
    // Using JSON file fallbacks from initialTranslations
  }

  return <>{children}</>;
} 