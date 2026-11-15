import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import * as Speech from 'expo-speech';

import type { WordLookup } from '@/lib/dictionary';

type WordOfTheDayCardProps = {
  word: WordLookup | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

const CARD_BG = '#FF6B3D';
const CARD_TEXT = '#1A120E';
const CARD_MUTED = 'rgba(26, 18, 14, 0.72)';

/**
 * Client-only: Web Speech / native TTS aren't available during SSR.
 * Dictionary CDN audio URLs currently 403, so we speak the word instead.
 */
function PronunciationSoundButton({ word }: { word: string }) {
  async function playSound() {
    try {
      await Speech.stop();
      Speech.speak(word, {
        language: 'en-US',
        rate: 0.85,
        pitch: 1,
      });
    } catch {
      // Ignore transient speech errors for now.
    }
  }

  return (
    <Pressable
      accessibilityLabel={`Play pronunciation of ${word}`}
      accessibilityRole="button"
      hitSlop={12}
      onPress={() => {
        void playSound();
      }}
      style={({ pressed }) => [styles.soundButton, pressed && styles.soundButtonPressed]}>
      <SymbolView
        name={{ ios: 'speaker.wave.2.fill', android: 'volume_up', web: 'volume_up' }}
        size={22}
        tintColor={CARD_TEXT}
      />
    </Pressable>
  );
}

export function WordOfTheDayCard({ word, loading, error, onRetry }: WordOfTheDayCardProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (loading) {
    return (
      <View style={[styles.card, styles.centered]}>
        <ActivityIndicator color={CARD_TEXT} />
        <Text style={styles.loadingLabel}>Finding today’s word…</Text>
      </View>
    );
  }

  if (error || !word) {
    return (
      <View style={[styles.card, styles.centered]}>
        <Text style={styles.eyebrow}>Word of the day</Text>
        <Text style={styles.errorText}>{error ?? 'Could not load today’s word.'}</Text>
        {onRetry ? (
          <Pressable
            accessibilityRole="button"
            onPress={onRetry}
            style={({ pressed }) => [styles.retryButton, pressed && styles.soundButtonPressed]}>
            <Text style={styles.retryLabel}>Try again</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Word of the day</Text>
      <Text style={styles.word}>{word.word}</Text>

      <View style={styles.pronunciationRow}>
        <Text style={styles.pronunciation}>{word.pronunciation}</Text>
        {isClient ? <PronunciationSoundButton word={word.word} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    backgroundColor: CARD_BG,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 28,
    gap: 10,
  },
  centered: {
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    color: CARD_MUTED,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  word: {
    color: CARD_TEXT,
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -0.8,
    lineHeight: 44,
    textTransform: 'lowercase',
  },
  pronunciationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  pronunciation: {
    color: CARD_MUTED,
    fontSize: 18,
    fontWeight: '500',
    flexShrink: 1,
  },
  soundButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  soundButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  loadingLabel: {
    color: CARD_MUTED,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
  },
  errorText: {
    color: CARD_TEXT,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  retryLabel: {
    color: CARD_TEXT,
    fontSize: 14,
    fontWeight: '700',
  },
});
