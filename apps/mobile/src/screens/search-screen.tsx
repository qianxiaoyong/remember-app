import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '../components/shell/app-header';
import { ScreenScaffold } from '../components/shell/screen-scaffold';
import { SurfaceCard } from '../components/ui/surface-card';
import { rejoinCardReview } from '../use-cases/rejoin-card-review';
import { searchPackCardsUseCase } from '../use-cases/search-pack-cards';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface SearchScreenProps {
  packId: string;
}

export function SearchScreen(props: SearchScreenProps): ReactElement {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const results = useMemo(() => {
    if (!query.trim()) {
      return [];
    }
    try {
      return searchPackCardsUseCase(props.packId, query);
    } catch {
      return [];
    }
  }, [props.packId, query]);

  const handleRejoin = (knowledgeId: string, headword: string): void => {
    try {
      const result = rejoinCardReview({ packId: props.packId, knowledgeId });
      if (result.alreadyPending) {
        setMessage(`${headword} 已在当前任务队列中`);
        return;
      }
      if (result.addedToQueue) {
        setMessage(`${headword} 已重新加入复习`);
        return;
      }
      setMessage(`${headword} 已设为到期复习`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '加入复习失败');
    }
  };

  return (
    <ScreenScaffold>
      <AppHeader onBackPress={() => router.back()} variant="back" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>搜索当前知识库</Text>
        <TextInput
          onChangeText={setQuery}
          placeholder="输入单词或短语"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          value={query}
        />
        {results.map((card) => (
          <SurfaceCard key={card.knowledgeId}>
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.headword}>{card.headword}</Text>
                <Text style={styles.definition}>
                  {card.content.reveal.definitions[0]?.text ?? ''}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  handleRejoin(card.knowledgeId, card.headword);
                }}
                style={styles.rejoinButton}
              >
                <Text style={styles.rejoinLabel}>加入复习</Text>
              </Pressable>
            </View>
          </SurfaceCard>
        ))}
        {query.trim() && results.length === 0 ? (
          <Text style={styles.empty}>没有找到匹配内容</Text>
        ) : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}
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
    fontSize: 18,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
  },
  headword: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  definition: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  rejoinButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rejoinLabel: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: '600',
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  message: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
