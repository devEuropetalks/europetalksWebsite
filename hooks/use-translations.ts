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
  console.log('Fetching translations...');
  const res = await fetch(url);
  const contentType = res.headers.get('content-type');
  console.log('Response content type:', contentType);
  
  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch {
      errorData = await res.text();
    }
    console.error('Translation fetch error:', errorData);
    throw new Error(typeof errorData === 'object' ? errorData.error : errorData);
  }

  let data;
  try {
    data = await res.json();
    console.log('Raw translation data:', data);
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
    console.log(`Language ${lang} content structure:`, {
      type: typeof content,
      keys: content ? Object.keys(content) : 'no content',
      sample: content ? JSON.stringify(content).slice(0, 100) + '...' : 'empty'
    });
  });

  return data;
};

export function useTranslations() {
  const { setTranslations } = useTranslationsStore();
  const { data, error, isLoading } = useSWR('/api/translations', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 3600000, // 1 hour
    onSuccess: (data) => {
      console.log('Successfully loaded translations:', Object.keys(data));
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