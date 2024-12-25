'use client';

import { useTranslations } from '@/hooks/use-translations';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface TranslationsProviderProps {
  children: React.ReactNode;
}

export function TranslationsProvider({ children }: TranslationsProviderProps) {
  const { translations, isLoading } = useTranslations();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!isLoading && translations) {
      // Add all resources to i18next
      Object.entries(translations).forEach(([lang, resources]) => {
        i18n.addResourceBundle(lang, 'translation', resources, true, true);
      });
    }
  }, [translations, isLoading, i18n]);

  if (isLoading) {
    return <div>Loading translations...</div>;
  }

  return <>{children}</>;
} 