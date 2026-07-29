import type { ReactElement } from 'react';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '../components/shell/app-header';
import { ScreenScaffold } from '../components/shell/screen-scaffold';
import { SurfaceCard } from '../components/ui/surface-card';
import type { SavedLexiconItemRow } from '../data/repositories/saved-lexicon-repository';
import { listSavedLexiconItemsUseCase } from '../use-cases/toggle-saved-lexicon-item';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function FavoritesScreen(): ReactElement {
  const router = useRouter();
  const [items, setItems] = useState<SavedLexiconItemRow[]>(() => listSavedLexiconItemsUseCase());

  const refresh = useCallback(() => {
    setItems(listSavedLexiconItemsUseCase());
  }, []);

  return (
    <ScreenScaffold>
      <AppHeader onBackPress={() => router.back()} variant="back" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>收藏本</Text>
        <Text style={styles.subtitle} onPress={refresh}>
          点词收藏的词条 · 点此刷新
        </Text>
        {items.length === 0 ? (
          <Text style={styles.empty}>还没有收藏词条</Text>
        ) : (
          items.map((item) => (
            <SurfaceCard key={`${item.packId}:${item.surfaceForm}`}>
              <Text style={styles.word}>{item.surfaceForm}</Text>
              <Text style={styles.meta}>
                {item.packId} · {item.savedAt.slice(0, 10)}
              </Text>
            </SurfaceCard>
          ))
        )}
      </ScrollView>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  word: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.xs,
  },
});
