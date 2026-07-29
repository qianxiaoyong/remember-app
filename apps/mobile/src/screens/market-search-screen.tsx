import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MarketSearchResultCard } from '../components/search/market-search-result-card';
import { SearchPageScaffold } from '../components/search/search-page-scaffold';
import { SearchResultCount } from '../components/search/search-result-count';
import { SearchTopBar } from '../components/search/search-top-bar';
import { setMarketSearchSelection } from '../shell/market-search-navigation';
import { searchMarketCatalog } from '../use-cases/search-market-catalog';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function MarketSearchScreen(): ReactElement {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchMarketCatalog(query), [query]);
  const trimmedQuery = query.trim();

  return (
    <SearchPageScaffold
      topBar={
        <SearchTopBar
          onCancel={() => {
            if (router.canGoBack()) {
              router.back();
              return;
            }
            router.replace('/market');
          }}
          onChangeText={setQuery}
          placeholder="搜索知识库名称"
          value={query}
        />
      }
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {trimmedQuery ? (
          <>
            <SearchResultCount count={results.length} label="资料搜索结果" />
            {results.length === 0 ? (
              <Text style={styles.empty}>没有找到匹配的资料</Text>
            ) : (
              <View style={styles.grid}>
                {results.map((item) => (
                  <MarketSearchResultCard
                    item={item}
                    key={item.packId}
                    keyword={trimmedQuery}
                    onPress={() => {
                      setMarketSearchSelection({
                        highlightPackId: item.packId,
                        primaryCategory: item.primaryCategory,
                        secondaryCategory: item.secondaryCategory,
                        versionFilter: item.version,
                      });
                      router.back();
                    }}
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          <Text style={styles.hint}>输入资料名称开始搜索</Text>
        )}
      </ScrollView>
    </SearchPageScaffold>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
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
});
