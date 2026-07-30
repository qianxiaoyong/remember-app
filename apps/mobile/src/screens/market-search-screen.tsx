import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { CatalogPackItem } from '../catalog/catalog-seed';
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
  const [results, setResults] = useState<CatalogPackItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const trimmedQuery = query.trim();

  useEffect(() => {
    if (!trimmedQuery) {
      setResults([]);
      return;
    }

    const cancelledRef = { current: false };
    setIsSearching(true);

    void (async () => {
      try {
        const items = await searchMarketCatalog(trimmedQuery);
        if (!cancelledRef.current) {
          setResults(items);
        }
      } catch {
        if (!cancelledRef.current) {
          setResults([]);
        }
      } finally {
        if (!cancelledRef.current) {
          setIsSearching(false);
        }
      }
    })();

    return () => {
      cancelledRef.current = true;
    };
  }, [trimmedQuery]);

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
            {isSearching ? (
              <View style={styles.center}>
                <ActivityIndicator color={colors.accent} />
              </View>
            ) : results.length === 0 ? (
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
    gap: spacing.md,
  },
  center: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 14,
    paddingVertical: spacing.xl,
    textAlign: 'center',
  },
  hint: {
    color: colors.textMuted,
    fontSize: 14,
    paddingTop: spacing.xl,
    textAlign: 'center',
  },
});
