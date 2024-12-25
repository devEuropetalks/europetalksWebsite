import { useEffect, useState } from 'react';
import { create } from 'zustand';

interface TranslationsStore {
  translations: Record<string, Record<string, string>>;
  setTranslations: (translations: Record<string, Record<string, string>>) => void;
}

const useTranslationsStore = create<TranslationsStore>((set) => ({
  translations: {},
  setTranslations: (translations) => set({ translations }),
}));

export function useTranslations() {
  const { translations, setTranslations } = useTranslationsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchTranslations() {
      try {
        // Only fetch if we haven't already
        if (Object.keys(translations).length === 0) {
          const response = await fetch('/api/translations');
          if (!response.ok) throw new Error('Failed to fetch translations');
          const data = await response.json();
          setTranslations(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchTranslations();
  }, [translations, setTranslations]);

  return { translations, isLoading, error };
} 