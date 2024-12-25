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
  if (!res.ok) throw new Error('Failed to fetch translations');
  return res.json();
};

export function useTranslations() {
  const { setTranslations } = useTranslationsStore();
  const { data, error, isLoading } = useSWR('/api/translations', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 3600000, // 1 hour
    onSuccess: (data) => {
      setTranslations(data);
    },
  });

  return {
    translations: data,
    isLoading,
    error: error as Error | null,
  };
} 