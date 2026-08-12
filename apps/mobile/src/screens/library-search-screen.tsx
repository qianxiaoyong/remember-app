import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { CoverGrid } from '../components/catalog/cover-grid';
import { InstalledPackGridTile } from '../components/library/installed-pack-grid-tile';
import { SearchPageScaffold } from '../components/search/search-page-scaffold';
import { SearchResultCount } from '../components/search/search-result-count';
import { SearchTopBar } from '../components/search/search-top-bar';
import { searchInstalledPackSummaries } from '../use-cases/search-installed-packs';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const SEARCH_HORIZONTAL_PADDING = spacing.lg;

export function LibrarySearchScreen(): ReactElement {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const results = useMemo(() => searchInstalledPackSummaries(query), [query]);
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
            router.replace('/library');
          }}
          onChangeText={setQuery}
          placeholder="搜索已安装知识库名称"
          value={query}
        />
      }
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {trimmedQuery ? (
          <>
            <SearchResultCount count={results.length} label="已安装资料搜索结果" />
            {results.length === 0 ? (
              <Text style={styles.empty}>没有找到匹配的知识库</Text>
            ) : (
              <CoverGrid
                horizontalPadding={SEARCH_HORIZONTAL_PADDING}
                items={results}
                keyExtractor={(pack) => pack.packId}
                renderItem={(pack, tileWidth) => (
                  <InstalledPackGridTile
                    onDetailPress={() => {
                      router.push(`/pack/${pack.packId}`);
                    }}
                    onStudyPress={() => {
                      router.back();
                      router.push(`/study?packId=${pack.packId}`);
                    }}
                    pack={pack}
                    tileWidth={tileWidth}
                  />
                )}
              />
            )}
          </>
        ) : (
          <Text style={styles.hint}>输入知识库名称开始搜索</Text>
        )}
      </ScrollView>
    </SearchPageScaffold>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
    paddingHorizontal: SEARCH_HORIZONTAL_PADDING,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 14,
    paddingTop: spacing.xl,
    textAlign: 'center',
  },
  hint: {
    color: colors.textMuted,
    fontSize: 14,
    paddingTop: spacing.xl,
    textAlign: 'center',
  },
});
