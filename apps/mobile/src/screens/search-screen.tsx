import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PackCardSearchResultRow } from '../components/search/pack-card-search-result-row';
import { SearchPageScaffold } from '../components/search/search-page-scaffold';
import { SearchResultCount } from '../components/search/search-result-count';
import { SearchTopBar } from '../components/search/search-top-bar';
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

  const trimmedQuery = query.trim();
  const results = useMemo(() => {
    if (!trimmedQuery) {
      return [];
    }
    try {
      return searchPackCardsUseCase(props.packId, query);
    } catch {
      return [];
    }
  }, [props.packId, query, trimmedQuery]);

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
    <SearchPageScaffold
      topBar={
        <SearchTopBar
          onCancel={() => {
            if (router.canGoBack()) {
              router.back();
              return;
            }
            router.replace(`/study?packId=${props.packId}`);
          }}
          onChangeText={(value) => {
            setMessage(null);
            setQuery(value);
          }}
          placeholder="输入单词或短语"
          value={query}
        />
      }
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {trimmedQuery ? (
          <>
            <SearchResultCount count={results.length} label="当前知识库搜索结果" />
            {results.length === 0 ? (
              <Text style={styles.empty}>没有找到匹配内容</Text>
            ) : (
              <View style={styles.list}>
                {results.map((card) => (
                  <PackCardSearchResultRow
                    card={card}
                    key={card.knowledgeId}
                    keyword={trimmedQuery}
                    onRejoinPress={() => {
                      handleRejoin(card.knowledgeId, card.headword);
                    }}
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          <Text style={styles.hint}>输入单词或短语开始搜索</Text>
        )}
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </ScrollView>
    </SearchPageScaffold>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  list: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 14,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    textAlign: 'center',
  },
  hint: {
    color: colors.textMuted,
    fontSize: 14,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    textAlign: 'center',
  },
  message: {
    color: colors.textSecondary,
    fontSize: 14,
    paddingHorizontal: spacing.lg,
    textAlign: 'center',
  },
});
