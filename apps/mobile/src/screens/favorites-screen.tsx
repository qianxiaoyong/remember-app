import type { ReactElement } from 'react';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { listSavedLexiconItemsUseCase } from '../use-cases/toggle-saved-lexicon-item';
import type { SavedLexiconItemRow } from '../data/repositories/saved-lexicon-repository';

export function FavoritesScreen(): ReactElement {
  const [items, setItems] = useState<SavedLexiconItemRow[]>(() => listSavedLexiconItemsUseCase());

  const refresh = useCallback(() => {
    setItems(listSavedLexiconItemsUseCase());
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Link asChild href="/">
        <Pressable accessibilityRole="button">
          <Text style={styles.back}>← 返回</Text>
        </Pressable>
      </Link>
      <Text style={styles.title}>收藏本</Text>
      <Text style={styles.subtitle}>学习分组 · 点词收藏词条</Text>
      <Pressable accessibilityRole="button" onPress={refresh} style={styles.refreshButton}>
        <Text style={styles.refreshLabel}>刷新</Text>
      </Pressable>
      {items.length === 0 ? (
        <Text style={styles.empty}>还没有收藏词条</Text>
      ) : (
        items.map((item) => (
          <View key={`${item.packId}:${item.surfaceForm}`} style={styles.row}>
            <Text style={styles.word}>{item.surfaceForm}</Text>
            <Text style={styles.meta}>
              {item.packId} · {item.savedAt.slice(0, 10)}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    flexGrow: 1,
    padding: 24,
    paddingTop: 64,
  },
  back: {
    color: '#2563EB',
    fontSize: 14,
    marginBottom: 16,
  },
  title: {
    color: '#171717',
    fontSize: 22,
    fontWeight: '600',
  },
  subtitle: {
    color: '#737373',
    fontSize: 14,
    marginBottom: 16,
    marginTop: 4,
  },
  refreshButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  refreshLabel: {
    color: '#2563EB',
    fontSize: 14,
  },
  empty: {
    color: '#737373',
    fontSize: 14,
  },
  row: {
    borderColor: '#E5E5E5',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  word: {
    color: '#171717',
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    color: '#737373',
    fontSize: 13,
    marginTop: 4,
  },
});
