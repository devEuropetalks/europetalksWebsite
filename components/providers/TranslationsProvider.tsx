'use client';

import { useTranslations } from '@/hooks/use-translations';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from '@/components/ui/alert';
import { TranslationObject } from '@/types/translations';

interface TranslationsProviderProps {
  children: React.ReactNode;
}

export function TranslationsProvider({ children }: TranslationsProviderProps) {
  const { translations, isLoading, error } = useTranslations();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!isLoading && translations) {
      console.log('Adding translations to i18next:', Object.keys(translations));
      // Add all resources to i18next
      Object.entries(translations).forEach(([lang, resources]) => {
        if (typeof resources === 'object' && resources !== null) {
          Object.entries(resources).forEach(([namespace, content]) => {
            if (content && typeof content === 'object') {
              console.log(`Adding ${lang}/${namespace} translations:`, content);
              i18n.addResourceBundle(lang, namespace, content as TranslationObject, true, true);
            }
          });
        }
      });
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
    return (
      <Alert variant="destructive" className="m-4">
        <p>Failed to load translations. Using fallback language.</p>
      </Alert>
    );
  }

  return <>{children}</>;
} 