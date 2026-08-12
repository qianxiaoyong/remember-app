import type { ReactElement } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import type { CatalogPrimaryCategory } from '../catalog/catalog-seed';
import type { CatalogPackItem } from '../catalog/catalog-seed';
import { CATALOG_ALL_VERSION_LABEL } from '../catalog/catalog-seed';
import { MarketCatalogGridTile } from '../components/market/market-catalog-grid-tile';
import { CoverGrid } from '../components/catalog/cover-grid';
import { MarketListSectionHeader } from '../components/market/market-list-section-header';
import { MarketPrimaryTabs } from '../components/market/market-primary-tabs';
import { MarketSecondarySidebar } from '../components/market/market-secondary-sidebar';
import {
  MarketSidebarColumn,
  MarketSidebarToggleButton,
  MARKET_SIDEBAR_WIDTH,
} from '../components/market/market-sidebar-column';
import { MarketVersionDropdown } from '../components/market/market-version-dropdown';
import { AppHeader } from '../components/shell/app-header';
import { ScreenScaffold } from '../components/shell/screen-scaffold';
import { useMarketSidebarCollapsed } from '../hooks/use-market-sidebar-collapsed';
import { useRestoreDrawerOnReturn } from '../hooks/use-restore-drawer-on-return';
import { useShellTabHardwareBackHandler } from '../hooks/use-shell-tab-hardware-back-handler';
import { consumeMarketSearchSelection } from '../shell/market-search-navigation';
import { useShellActions } from '../shell/shell-provider';
import { readApiBaseUrl } from '../data/api/api-client';
import { ApiNetworkError } from '../data/api/api-errors';
import { subscribeCatalogCacheUpdates } from '../data/catalog/catalog-cache-store';
import {
  fetchMarketCatalog,
  readCachedMarketCatalog,
  refreshCatalogTaxonomyFromNetwork,
} from '../use-cases/fetch-market-catalog';
import {
  getPrimaryTabOptions,
  getSecondaryCategoryOptions,
  getVersionFilterOptions,
  readCachedCatalogTaxonomy,
  readCatalogTaxonomyDiskCache,
} from '../data/catalog/catalog-taxonomy-store';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const MARKET_CONTENT_HORIZONTAL_PADDING = spacing.md;

export function MarketScreen(): ReactElement {
  const router = useRouter();
  const { openDrawer } = useShellActions();
  useRestoreDrawerOnReturn();
  useShellTabHardwareBackHandler();
  const { collapsed: sidebarCollapsed, toggleCollapsed: toggleSidebarCollapsed } =
    useMarketSidebarCollapsed();
  const listRef = useRef<ScrollView>(null);
  const isFocusedRef = useRef(false);
  const [primaryCategory, setPrimaryCategory] = useState<CatalogPrimaryCategory>('all');
  const [secondaryCategory, setSecondaryCategory] = useState('全部');
  const [versionFilter, setVersionFilter] = useState<string>(CATALOG_ALL_VERSION_LABEL);
  const [highlightPackId, setHighlightPackId] = useState<string | null>(null);
  const [versionDropdownOpen, setVersionDropdownOpen] = useState(false);
  const [items, setItems] = useState<CatalogPackItem[]>([]);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cacheHint, setCacheHint] = useState<string | null>(null);
  const [hasLoadedCache, setHasLoadedCache] = useState(false);
  const [taxonomyRevision, setTaxonomyRevision] = useState(0);
  const [taxonomyError, setTaxonomyError] = useState<string | null>(null);

  const cachedTaxonomy = useMemo(() => readCachedCatalogTaxonomy(), [taxonomyRevision]);
  const primaryTabOptions = useMemo(() => getPrimaryTabOptions(cachedTaxonomy), [cachedTaxonomy]);
  const versionOptions = useMemo(() => getVersionFilterOptions(cachedTaxonomy), [cachedTaxonomy]);

  const catalogQuery = useMemo(
    () => ({
      primaryCategory,
      secondaryCategory,
      versionFilter,
      keyword: '',
    }),
    [primaryCategory, secondaryCategory, versionFilter],
  );

  const loadCatalogFromCache = useCallback(async () => {
    const cachedItems = await readCachedMarketCatalog(catalogQuery);
    if (cachedItems && cachedItems.length > 0) {
      setItems(cachedItems);
      setErrorMessage(null);
      setHasLoadedCache(true);
      return;
    }

    setItems([]);
    setHasLoadedCache(false);
    setErrorMessage(null);
  }, [catalogQuery]);

  const refreshCatalogFromNetwork = useCallback(async () => {
    setIsPullRefreshing(true);
    setErrorMessage(null);
    setCacheHint(null);
    setTaxonomyError(null);

    const cachedItems = await readCachedMarketCatalog(catalogQuery);

    try {
      const taxonomyUpdated = await refreshCatalogTaxonomyFromNetwork();
      if (taxonomyUpdated) {
        setTaxonomyRevision((value) => value + 1);
      } else if (!readCachedCatalogTaxonomy()) {
        setTaxonomyError(`分类加载失败，请确认服务器可访问（${readApiBaseUrl()}）`);
      } else {
        setTaxonomyError('分类更新失败，版本列表可能不是最新');
      }

      const nextItems = await fetchMarketCatalog(catalogQuery);
      setItems(nextItems);
      setHasLoadedCache(true);
      setErrorMessage(null);
    } catch (error) {
      const hasVisibleItems = cachedItems && cachedItems.length > 0;
      if (!hasVisibleItems) {
        setItems([]);
        setErrorMessage(formatMarketLoadError(error));
      } else {
        setCacheHint('目录更新失败，当前显示的是上次缓存');
      }
    } finally {
      setIsPullRefreshing(false);
    }
  }, [catalogQuery]);

  useEffect(() => {
    void readCatalogTaxonomyDiskCache().then(() => {
      setTaxonomyRevision((value) => value + 1);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true;
      void loadCatalogFromCache();

      const selection = consumeMarketSearchSelection();
      if (selection) {
        setHighlightPackId(selection.highlightPackId);
        setPrimaryCategory(selection.primaryCategory);
        setSecondaryCategory(selection.secondaryCategory);
        setVersionFilter(selection.versionFilter);
        listRef.current?.scrollTo({ animated: true, y: 0 });
      }

      return () => {
        isFocusedRef.current = false;
      };
    }, [loadCatalogFromCache]),
  );

  useEffect(() => {
    if (!isFocusedRef.current) {
      return;
    }
    void loadCatalogFromCache();
  }, [loadCatalogFromCache]);

  useEffect(() => {
    return subscribeCatalogCacheUpdates(() => {
      if (!isFocusedRef.current) {
        return;
      }
      void loadCatalogFromCache();
    });
  }, [loadCatalogFromCache]);

  const secondaryOptions = useMemo(
    () => getSecondaryCategoryOptions(cachedTaxonomy, primaryCategory),
    [cachedTaxonomy, primaryCategory],
  );

  const handlePressPack = useCallback(
    (packId: string) => {
      router.push(`/pack/${packId}`);
    },
    [router],
  );

  const { width: windowWidth } = useWindowDimensions();
  const listColumnWidth = windowWidth - (sidebarCollapsed ? 0 : MARKET_SIDEBAR_WIDTH);

  const emptyMessage =
    !hasLoadedCache && items.length === 0
      ? '暂无目录缓存，下拉刷新加载最新资料'
      : '当前筛选下暂无资料';

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
            options={primaryTabOptions}
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
                options={versionOptions}
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
                  void refreshCatalogFromNetwork();
                }}
                refreshing={isPullRefreshing}
                tintColor={colors.accent}
              />
            }
            ref={listRef}
            showsVerticalScrollIndicator={false}
            style={styles.listScroll}
          >
            {errorMessage && items.length === 0 ? (
              <Text style={styles.empty}>{errorMessage}</Text>
            ) : items.length === 0 ? (
              <Text style={styles.empty}>{emptyMessage}</Text>
            ) : (
              <>
                {taxonomyError ? <Text style={styles.cacheHint}>{taxonomyError}</Text> : null}
                {cacheHint ? <Text style={styles.cacheHint}>{cacheHint}</Text> : null}
                <CoverGrid
                  contentWidth={listColumnWidth}
                  horizontalPadding={MARKET_CONTENT_HORIZONTAL_PADDING}
                  items={items}
                  keyExtractor={(item) => item.packId}
                  renderItem={(item, tileWidth) => (
                    <MarketCatalogGridTile
                      highlighted={highlightPackId === item.packId}
                      item={item}
                      onPress={() => {
                        handlePressPack(item.packId);
                      }}
                      tileWidth={tileWidth}
                    />
                  )}
                />
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
