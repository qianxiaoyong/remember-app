import type { ReactElement } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import type { CatalogPrimaryCategory } from '../catalog/catalog-seed';
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
import { listMarketCatalog, listSecondaryCategories } from '../use-cases/list-market-catalog';
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

  const items = useMemo(
    () =>
      listMarketCatalog({
        primaryCategory,
        secondaryCategory,
        versionFilter,
        keyword: '',
      }),
    [primaryCategory, secondaryCategory, versionFilter],
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
            ref={listRef}
            showsVerticalScrollIndicator={false}
            style={styles.listScroll}
          >
            {items.length === 0 ? (
              <Text style={styles.empty}>当前筛选下暂无资料</Text>
            ) : (
              items.map((item) => (
                <MarketPackCard
                  highlighted={highlightPackId === item.packId}
                  item={item}
                  key={item.packId}
                  onPress={() => {
                    router.push(`/pack/${item.packId}`);
                  }}
                />
              ))
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
});
