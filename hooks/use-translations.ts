import useSWR from 'swr';
import { create } from 'zustand';
import { Translations } from '@/types/translations';

interface TranslationsStore {
  translations: Translations;
  setTranslations: (translations: Translations) => void;
}

const useTranslationsStore = create<TranslationsStore>((set) => ({
  translations: {},
  setTranslations: (translations) => set({ translations }),
}));

const fetcher = async (url: string) => {
  // Fetching translations
  const res = await fetch(url);
  
  // Handle 404 gracefully - database might be empty, fall back to JSON files
  if (res.status === 404) {
    // No translations in database, using JSON file fallbacks
    return {}; // Return empty object, JSON fallbacks are already loaded via initialTranslations
  }
  
  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch {
      errorData = await res.text();
    }
    console.error('Translation fetch error:', errorData);
    // For other errors, still throw but log that JSON fallbacks will be used
    console.warn('Translation API error, falling back to JSON files');
    throw new Error(typeof errorData === 'object' ? errorData.error : errorData);
  }

  let data;
  try {
    data = await res.json();
    // Raw translation data received
  } catch (e) {
    console.error('Failed to parse response as JSON:', e);
    throw new Error('Invalid JSON response');
  }

  // Validate the data structure
  if (!data || typeof data !== 'object') {
    console.error('Invalid translation data structure:', data);
    throw new Error('Invalid translation data structure');
  }

  // Log each language's content structure
  Object.entries(data).forEach(([lang, content]) => {
    if (typeof content !== 'object' || content === null) {
      console.error(`Invalid content structure for language ${lang}:`, content);
      throw new Error(`Invalid content structure for language ${lang}`);
    }

    // Language content structure validated

    // Validate each namespace's content
    Object.entries(content as Record<string, unknown>).forEach(([namespace, translations]) => {
      if (typeof translations !== 'object' || translations === null) {
        console.error(`Invalid translations for ${lang}/${namespace}:`, translations);
        throw new Error(`Invalid translations for ${lang}/${namespace}`);
      }
    });
  });

  return data as Translations;
};

export function useTranslations() {
  const { setTranslations } = useTranslationsStore();
  const { data, error, isLoading, mutate } = useSWR('/api/translations', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 3600000, // 1 hour
    onSuccess: (data) => {
      // Successfully loaded translations
      setTranslations(data);
    },
    onError: (err) => {
      console.error('Error loading translations:', err);
    },
    retryCount: 3,
    retryDelay: (retryCount) => Math.min(1000 * 2 ** retryCount, 30000), // Exponential backoff with max 30s
  });

  return {
    translations: data,
    isLoading,
    error: error as Error | null,
    reload: () => mutate(),
  };
} 