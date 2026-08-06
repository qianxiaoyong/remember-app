import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PackCardSearchResultRow } from '../components/search/pack-card-search-result-row';
import { UpdateReviewConfirmDialog } from '../components/study/update-review-confirm-dialog';
import { SearchPageScaffold } from '../components/search/search-page-scaffold';
import { SearchResultCount } from '../components/search/search-result-count';
import { SearchTopBar } from '../components/search/search-top-bar';
import { getLearningStateByKnowledgeId } from '../data/repositories/learning-state-repository';
import { joinReviewPool } from '../use-cases/join-review-pool';
import { updateReviewPoolFromPack } from '../use-cases/update-review-pool-from-pack';
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
  const [updateTarget, setUpdateTarget] = useState<{ knowledgeId: string; headword: string } | null>(
    null,
  );
  const [refreshKey, setRefreshKey] = useState(0);

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
  }, [props.packId, query, trimmedQuery, refreshKey]);

  const handleJoinReview = (knowledgeId: string, headword: string): void => {
    try {
      const state = getLearningStateByKnowledgeId(knowledgeId);
      if (state?.inReviewPool) {
        setUpdateTarget({ knowledgeId, headword });
        return;
      }
      const result = joinReviewPool({ knowledgeId, catalogPackId: props.packId });
      if (result.status === 'created') {
        setMessage(`${headword} 已加入复习`);
        setRefreshKey((value) => value + 1);
        return;
      }
      setUpdateTarget({ knowledgeId, headword });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '加入复习失败');
    }
  };

  const handleConfirmUpdate = (): void => {
    if (!updateTarget) {
      return;
    }
    try {
      updateReviewPoolFromPack({
        knowledgeId: updateTarget.knowledgeId,
        catalogPackId: props.packId,
      });
      setMessage(`${updateTarget.headword} 已更新复习`);
      setUpdateTarget(null);
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '更新复习失败');
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
                {results.map((card) => {
                  const inReviewPool =
                    getLearningStateByKnowledgeId(card.knowledgeId)?.inReviewPool ?? false;
                  return (
                    <PackCardSearchResultRow
                      card={card}
                      inReviewPool={inReviewPool}
                      key={card.knowledgeId}
                      keyword={trimmedQuery}
                      onReviewPress={() => {
                        handleJoinReview(card.knowledgeId, card.headword);
                      }}
                    />
                  );
                })}
              </View>
            )}
          </>
        ) : (
          <Text style={styles.hint}>输入单词或短语开始搜索</Text>
        )}
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </ScrollView>

      <UpdateReviewConfirmDialog
        onCancel={() => {
          setUpdateTarget(null);
        }}
        onConfirm={handleConfirmUpdate}
        visible={updateTarget !== null}
      />
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
