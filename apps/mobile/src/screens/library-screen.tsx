import type { ReactElement } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { InstalledPackRow } from '../components/library/installed-pack-row';
import { LibraryOverviewCard } from '../components/library/library-overview-card';
import { LibrarySectionHeader } from '../components/library/library-section-header';
import { AppHeader } from '../components/shell/app-header';
import { ScreenScaffold } from '../components/shell/screen-scaffold';
import { PrimaryButton } from '../components/ui/primary-button';
import { useShellActions } from '../shell/shell-provider';
import { useRestoreDrawerOnReturn } from '../hooks/use-restore-drawer-on-return';
import { consumeLibraryNeedsRefresh } from '../shell/library-refresh-signal';
import {
  readCatalogDiskCache,
  subscribeCatalogCacheUpdates,
} from '../data/catalog/catalog-cache-store';
import { navigateShellTab } from '../shell/shell-tab-transition';
import {
  loadLibraryScreenData,
  createEmptyLibraryOverview,
  type InstalledPackSummary,
  type LibraryOverview,
} from '../use-cases/get-library-overview';
import { warmCatalogCacheFromNetwork } from '../use-cases/fetch-market-catalog';
import { deferAfterFirstPaint } from '../lib/defer-after-first-paint';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const EMPTY_OVERVIEW: LibraryOverview = createEmptyLibraryOverview();

export function LibraryScreen(): ReactElement {
  const router = useRouter();
  const { openDrawer } = useShellActions();
  useRestoreDrawerOnReturn();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLibraryLoading, setIsLibraryLoading] = useState(true);
  const [overview, setOverview] = useState<LibraryOverview>(EMPTY_OVERVIEW);
  const [installedPacks, setInstalledPacks] = useState<InstalledPackSummary[]>([]);

  const bumpRefresh = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  useEffect(() => {
    return subscribeCatalogCacheUpdates(bumpRefresh);
  }, [bumpRefresh]);

  useFocusEffect(
    useCallback(() => {
      if (consumeLibraryNeedsRefresh()) {
        bumpRefresh();
      }
    }, [bumpRefresh]),
  );

  const hasLoadedOnceRef = useRef(false);

  useEffect(() => {
    const applyData = (): void => {
      const data = loadLibraryScreenData();
      setOverview(data.overview);
      setInstalledPacks(data.installedPacks);
      setIsLibraryLoading(false);
      hasLoadedOnceRef.current = true;
    };

    if (!hasLoadedOnceRef.current) {
      return deferAfterFirstPaint(applyData);
    }

    applyData();
  }, [refreshKey]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await readCatalogDiskCache();
      await warmCatalogCacheFromNetwork();
      bumpRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [bumpRefresh]);

  return (
    <ScreenScaffold withCapsulePadding>
      <AppHeader
        onMenuPress={openDrawer}
        onSearchPress={() => {
          router.push('/library-search');
        }}
        variant="shell"
      />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            colors={[colors.accent]}
            onRefresh={() => {
              void handleRefresh();
            }}
            refreshing={isRefreshing}
            tintColor={colors.accent}
          />
        }
      >
        <LibraryOverviewCard overview={overview} />

        {isLibraryLoading ? (
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyText}>加载中…</Text>
          </View>
        ) : installedPacks.length === 0 ? (
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyText}>还没有安装知识库</Text>
            <PrimaryButton
              label="去资料看看"
              onPress={() => {
                navigateShellTab(router, 'market');
              }}
            />
          </View>
        ) : (
          <>
            <LibrarySectionHeader />
            <View style={styles.list}>
              {installedPacks.map((pack) => (
                <InstalledPackRow
                  key={pack.packId}
                  onDetailPress={() => {
                    router.push(`/pack/${pack.packId}`);
                  }}
                  onStudyPress={() => {
                    router.push(`/study?packId=${pack.packId}`);
                  }}
                  pack={pack}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  emptyBlock: {
    alignItems: 'stretch',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  list: {
    gap: spacing.md,
  },
});
