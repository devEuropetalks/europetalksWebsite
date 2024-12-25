import useSWR from 'swr';
import { create } from 'zustand';

interface TranslationsStore {
  translations: Record<string, Record<string, string>>;
  setTranslations: (translations: Record<string, Record<string, string>>) => void;
}

const useTranslationsStore = create<TranslationsStore>((set) => ({
  translations: {},
  setTranslations: (translations) => set({ translations }),
}));

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    console.error('Translation fetch error:', error);
    throw new Error(error.details || error.error || 'Failed to fetch translations');
  }
  const data = await res.json();
  
  // Validate the data structure
  if (!data || typeof data !== 'object') {
    console.error('Invalid translation data structure:', data);
    throw new Error('Invalid translation data structure');
  }

  // Log available languages
  console.log('Fetched translations for languages:', Object.keys(data));
  
  return data;
};

export function useTranslations() {
  const { setTranslations } = useTranslationsStore();
  const { data, error, isLoading } = useSWR('/api/translations', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 3600000, // 1 hour
    onSuccess: (data) => {
      console.log('Successfully loaded translations');
      setTranslations(data);
    },
    onError: (err) => {
      console.error('Error loading translations:', err);
    },
  });

  return {
    translations: data,
    isLoading,
    error: error as Error | null,
  };
} 