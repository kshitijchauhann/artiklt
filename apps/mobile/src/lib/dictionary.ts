const DICTIONARY_BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

export type DictionaryPhonetic = {
  text?: string;
  audio?: string;
};

export type DictionaryMeaning = {
  partOfSpeech: string;
  definitions: {
    definition: string;
    example?: string;
  }[];
};

export type DictionaryEntry = {
  word: string;
  phonetic?: string;
  phonetics: DictionaryPhonetic[];
  meanings: DictionaryMeaning[];
};

export type WordLookup = {
  word: string;
  pronunciation: string;
  audioUrl: string | null;
  definition: string | null;
  partOfSpeech: string | null;
};

/** Curated bank — one word is chosen per local calendar day. */
export const WORD_OF_THE_DAY_BANK = [
  'serendipity',
  'ephemeral',
  'luminous',
  'resilience',
  'eloquent',
  'quintessential',
  'mellifluous',
  'sonder',
  'petrichor',
  'aurora',
  'cascade',
  'verdant',
  'halcyon',
  'solace',
  'vivid',
  'zenith',
  'amber',
  'clarity',
  'glimpse',
  'harbor',
  'kindle',
  'nuance',
  'radiant',
  'stillness',
  'thrive',
  'wonder',
  'echo',
  'flourish',
  'gentle',
  'horizon',
] as const;

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Stable daily pick from the word bank (local timezone). */
export function getWordOfTheDaySlug(date = new Date()): string {
  const key = localDateKey(date);
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return WORD_OF_THE_DAY_BANK[hash % WORD_OF_THE_DAY_BANK.length]!;
}

function normalizeAudioUrl(url: string | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return null;
}

export function pickPronunciation(entry: DictionaryEntry): {
  pronunciation: string;
  audioUrl: string | null;
} {
  const withAudio = entry.phonetics.find((p) => Boolean(p.audio?.trim()));
  const withText = entry.phonetics.find((p) => Boolean(p.text?.trim()));
  const pronunciation =
    withAudio?.text ?? withText?.text ?? entry.phonetic ?? entry.word;

  return {
    pronunciation,
    // Note: dictionaryapi.dev media CDN often 403s; UI uses expo-speech instead.
    audioUrl: normalizeAudioUrl(withAudio?.audio),
  };
}

export async function lookupWord(word: string): Promise<WordLookup> {
  const response = await fetch(`${DICTIONARY_BASE_URL}/${encodeURIComponent(word)}`);

  if (!response.ok) {
    throw new Error(`Dictionary lookup failed (${response.status})`);
  }

  const entries = (await response.json()) as DictionaryEntry[];
  const entry = entries[0];
  if (!entry) {
    throw new Error(`No dictionary entry for "${word}"`);
  }

  const { pronunciation, audioUrl } = pickPronunciation(entry);
  const firstMeaning = entry.meanings[0];
  const firstDefinition = firstMeaning?.definitions[0]?.definition ?? null;

  return {
    word: entry.word,
    pronunciation,
    audioUrl,
    definition: firstDefinition,
    partOfSpeech: firstMeaning?.partOfSpeech ?? null,
  };
}

export async function fetchWordOfTheDay(date = new Date()): Promise<WordLookup> {
  const slug = getWordOfTheDaySlug(date);
  return lookupWord(slug);
}
