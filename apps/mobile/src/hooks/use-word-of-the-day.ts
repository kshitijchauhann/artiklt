import { useEffect, useState } from 'react';

import { fetchWordOfTheDay, type WordLookup } from '@/lib/dictionary';

type WordOfTheDayState = {
  word: WordLookup | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useWordOfTheDay(): WordOfTheDayState {
  const [word, setWord] = useState<WordLookup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const next = await fetchWordOfTheDay();
        if (!cancelled) {
          setWord(next);
        }
      } catch (err) {
        if (!cancelled) {
          setWord(null);
          setError(err instanceof Error ? err.message : 'Failed to load word of the day');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [requestId]);

  return {
    word,
    loading,
    error,
    refresh: () => setRequestId((id) => id + 1),
  };
}
