import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WordOfTheDayCard } from '@/components/word-of-the-day-card';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useWordOfTheDay } from '@/hooks/use-word-of-the-day';

// Placeholder until auth session is wired.
const displayName = 'Alex';

export default function HomeScreen() {
  const { word, loading, error, refresh } = useWordOfTheDay();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <ThemedText type="title" style={styles.greeting}>
          Hello, {displayName}
        </ThemedText>

        <WordOfTheDayCard word={word} loading={loading} error={error} onRetry={refresh} />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.four,
  },
  greeting: {
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.6,
  },
});
