import type { ReactElement } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import type { CatalogPrimaryCategory } from '../catalog/catalog-seed';
import type { CatalogPackItem } from '../catalog/catalog-seed';
import { MarketListSectionHeader } from '../components/market/market-list-section-header';
import { MarketPackCard } from '../components/market/market-pack-card';
import { MarketPrimaryTabs } from '../components/market/market-primary-tabs';
import { MarketSecondarySidebar } from '../components/market/market-secondary-sidebar';
import {
  MarketSidebarColumn,
  MarketSidebarToggleButton,
} from '../components/market/market-sidebar-column';
import { MarketVersionDropdown } from '../components/market/market-version-dropdown';
import { AppHeader } from '../components/shell/app-header';
import { ScreenScaffold } from '../components/shell/screen-scaffold';
import { useMarketSidebarCollapsed } from '../hooks/use-market-sidebar-collapsed';
import { consumeMarketSearchSelection } from '../shell/market-search-navigation';
import { useShellActions } from '../shell/shell-provider';
import { readApiBaseUrl } from '../data/api/api-client';
import { ApiNetworkError } from '../data/api/api-errors';
import {
  fetchMarketCatalog,
  listSecondaryCategories,
  readCachedMarketCatalog,
} from '../use-cases/fetch-market-catalog';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function MarketScreen(): ReactElement {
  const router = useRouter();
  const { openDrawer } = useShellActions();
  const { collapsed: sidebarCollapsed, toggleCollapsed: toggleSidebarCollapsed } =
    useMarketSidebarCollapsed();
  const listRef = useRef<ScrollView>(null);
  const [primaryCategory, setPrimaryCategory] = useState<CatalogPrimaryCategory>('all');
  const [secondaryCategory, setSecondaryCategory] = useState('全部');
  const [versionFilter, setVersionFilter] = useState<string>('全部版本');
  const [highlightPackId, setHighlightPackId] = useState<string | null>(null);
  const [versionDropdownOpen, setVersionDropdownOpen] = useState(false);
  const [items, setItems] = useState<CatalogPackItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  const catalogQuery = useMemo(
    () => ({
      primaryCategory,
      secondaryCategory,
      versionFilter,
      keyword: '',
    }),
    [primaryCategory, secondaryCategory, versionFilter],
  );

  const loadCatalog = useCallback(
    async (options: { showInitialSpinner?: boolean; fromPullRefresh?: boolean } = {}) => {
      const { showInitialSpinner = true, fromPullRefresh = false } = options;
      if (fromPullRefresh) {
        setIsPullRefreshing(true);
      } else if (showInitialSpinner) {
        setIsLoading(true);
      }
      setErrorMessage(null);

      const cachedItems = await readCachedMarketCatalog(catalogQuery);
      if (cachedItems && cachedItems.length > 0) {
        setItems(cachedItems);
        setIsFromCache(true);
      } else if (showInitialSpinner && !fromPullRefresh) {
        setItems([]);
      }

      try {
        const nextItems = await fetchMarketCatalog(catalogQuery);
        setItems(nextItems);
        setIsFromCache(false);
        setErrorMessage(null);
      } catch (error) {
        const hasVisibleItems = cachedItems && cachedItems.length > 0;
        if (!hasVisibleItems) {
          setItems([]);
          setErrorMessage(formatMarketLoadError(error));
        } else {
          setErrorMessage('目录更新失败，当前显示的是上次缓存');
        }
      } finally {
        setIsLoading(false);
        setIsPullRefreshing(false);
      }
    },
    [catalogQuery],
  );

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  useFocusEffect(
    useCallback(() => {
      const selection = consumeMarketSearchSelection();
      if (!selection) {
        return;
      }

      setHighlightPackId(selection.highlightPackId);
      setPrimaryCategory(selection.primaryCategory);
      setSecondaryCategory(selection.secondaryCategory);
      setVersionFilter(selection.versionFilter);
      listRef.current?.scrollTo({ animated: true, y: 0 });
    }, []),
  );

  const secondaryOptions = useMemo(
    () => listSecondaryCategories(primaryCategory),
    [primaryCategory],
  );

  return (
    <ScreenScaffold withCapsulePadding>
      <View style={styles.topSection}>
        <View style={styles.headerPanel}>
          <AppHeader
            onMenuPress={openDrawer}
            onSearchPress={() => {
              router.push('/market-search');
            }}
            variant="shell"
          />

          <MarketPrimaryTabs
            onChange={(value) => {
              setPrimaryCategory(value);
              setSecondaryCategory('全部');
            }}
            value={primaryCategory}
          />
        </View>
      </View>

      <View style={styles.bodyRow}>
        <MarketSidebarColumn collapsed={sidebarCollapsed}>
          <MarketSecondarySidebar
            onChange={setSecondaryCategory}
            options={secondaryOptions}
            value={secondaryCategory}
          />
        </MarketSidebarColumn>

        <View style={[styles.listColumn, versionDropdownOpen ? styles.listColumnRaised : null]}>
          <View style={styles.toolbar}>
            <View style={styles.toolbarLeft}>
              <MarketSidebarToggleButton
                collapsed={sidebarCollapsed}
                onPress={toggleSidebarCollapsed}
              />
              <MarketVersionDropdown
                onChange={setVersionFilter}
                onOpenChange={setVersionDropdownOpen}
                value={versionFilter}
              />
            </View>
            <MarketListSectionHeader count={items.length} />
          </View>

          <ScrollView
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                colors={[colors.accent]}
                onRefresh={() => {
                  void loadCatalog({ showInitialSpinner: false, fromPullRefresh: true });
                }}
                refreshing={isPullRefreshing}
                tintColor={colors.accent}
              />
            }
            ref={listRef}
            showsVerticalScrollIndicator={false}
            style={styles.listScroll}
          >
            {isLoading && items.length === 0 ? (
              <View style={styles.center}>
                <ActivityIndicator color={colors.accent} />
              </View>
            ) : errorMessage && items.length === 0 ? (
              <Text style={styles.empty}>{errorMessage}</Text>
            ) : items.length === 0 ? (
              <Text style={styles.empty}>当前筛选下暂无资料</Text>
            ) : (
              <>
                {errorMessage ? <Text style={styles.cacheHint}>{errorMessage}</Text> : null}
                {isFromCache && isLoading ? (
                  <Text style={styles.cacheHint}>正在更新目录…</Text>
                ) : null}
                {items.map((item) => (
                  <MarketPackCard
                    highlighted={highlightPackId === item.packId}
                    item={item}
                    key={item.packId}
                    onPress={() => {
                      router.push(`/pack/${item.packId}`);
                    }}
                  />
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  topSection: {
    flexGrow: 0,
    flexShrink: 0,
  },
  headerPanel: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.borderStrong,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bodyRow: {
    flex: 1,
    flexDirection: 'row',
  },
  listColumn: {
    flex: 1,
  },
  listColumnRaised: {
    zIndex: 20,
  },
  toolbar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.borderStrong,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 40,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  toolbarLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  listScroll: {
    backgroundColor: colors.background,
    flex: 1,
  },
  listContent: {
    gap: spacing.sm,
    padding: spacing.md,
    paddingBottom: spacing.xl,
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
  cacheHint: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});

function formatMarketLoadError(error: unknown): string {
  const apiBaseUrl = readApiBaseUrl();
  if (error instanceof ApiNetworkError) {
    return `${error.message}（${apiBaseUrl}）`;
  }
  if (error instanceof Error) {
    return `${error.message}（${apiBaseUrl}）`;
  }
  return `加载目录失败（${apiBaseUrl}）`;
}
