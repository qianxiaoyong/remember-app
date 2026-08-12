import type { ReactElement } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LibraryHomeWhiteCard } from '../components/library/library-home-white-card';
import { LibraryHomeEmptyWhiteCard } from '../components/library/library-home-empty-white-card';
import { LibraryInstalledPackShelf } from '../components/library/library-installed-pack-shelf';
import { LibraryEmptyPackShelfPlaceholder } from '../components/library/library-empty-pack-shelf-placeholder';
import { LibrarySectionHeader } from '../components/library/library-section-header';
import { AppHeader } from '../components/shell/app-header';
import { ScreenScaffold } from '../components/shell/screen-scaffold';
import { useShellTabHardwareBackHandler } from '../hooks/use-shell-tab-hardware-back-handler';
import { consumeLibraryNeedsRefresh } from '../shell/library-refresh-signal';
import {
  readCatalogDiskCache,
  subscribeCatalogCacheUpdates,
} from '../data/catalog/catalog-cache-store';
import { touchInstalledPackLastOpened } from '../data/repositories/touch-installed-pack-last-opened';
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
const CONTENT_HORIZONTAL_PADDING = spacing.lg;
const GRADIENT_FALLBACK_HEIGHT = 320;

function resolveDefaultActivePackId(packs: InstalledPackSummary[]): string | null {
  return packs[0]?.packId ?? null;
}

export function LibraryScreen(): ReactElement {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  useShellTabHardwareBackHandler();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLibraryLoading, setIsLibraryLoading] = useState(true);
  const [overview, setOverview] = useState<LibraryOverview>(EMPTY_OVERVIEW);
  const [installedPacks, setInstalledPacks] = useState<InstalledPackSummary[]>([]);
  const [activePackId, setActivePackId] = useState<string | null>(null);
  const [gradientHeight, setGradientHeight] = useState(GRADIENT_FALLBACK_HEIGHT);

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
      void readCatalogDiskCache().then(() => {
        void warmCatalogCacheFromNetwork().then(bumpRefresh);
      });
    }, [bumpRefresh]),
  );

  const hasLoadedOnceRef = useRef(false);

  useEffect(() => {
    const applyData = (): void => {
      const data = loadLibraryScreenData();
      setOverview(data.overview);
      setInstalledPacks(data.installedPacks);
      setActivePackId((current) => {
        if (data.installedPacks.length === 0) {
          return null;
        }
        if (current && data.installedPacks.some((pack) => pack.packId === current)) {
          return current;
        }
        return resolveDefaultActivePackId(data.installedPacks);
      });
      setIsLibraryLoading(false);
      hasLoadedOnceRef.current = true;
    };

    if (!hasLoadedOnceRef.current) {
      return deferAfterFirstPaint(applyData);
    }

    applyData();
  }, [refreshKey]);

  const activePack =
    installedPacks.find((pack) => pack.packId === activePackId) ?? installedPacks[0] ?? null;

  const openStudy = useCallback(
    (pack: InstalledPackSummary) => {
      touchInstalledPackLastOpened(pack.packId);
      setActivePackId(pack.packId);
      router.push(`/study?packId=${pack.packId}`);
    },
    [router],
  );

  const openPackDetail = useCallback(
    (pack: InstalledPackSummary) => {
      router.push(`/pack/${pack.packId}`);
    },
    [router],
  );

  const handleWhiteCardLayout = useCallback(
    (offsetY: number, height: number) => {
      setGradientHeight(insets.top + offsetY + height * (2 / 3));
    },
    [insets.top],
  );

  return (
    <ScreenScaffold safeAreaEdges={['left', 'right']} withTabBarPadding>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[colors.libraryGradientStart, colors.libraryGradientEnd]}
            end={{ x: 0.5, y: 1 }}
            pointerEvents="none"
            start={{ x: 0.5, y: 0 }}
            style={[styles.gradientBackground, { height: gradientHeight }]}
          />

          <View style={[styles.heroContent, { paddingTop: insets.top }]}>
            <AppHeader
              onMarketPress={() => {
                router.push('/market');
              }}
              onSearchPress={() => {
                router.push('/library-search');
              }}
              tone="onGradient"
              variant="shell"
            />

            {isLibraryLoading ? (
              <View style={styles.gradientPlaceholder}>
                <Text style={styles.placeholderText}>加载中…</Text>
              </View>
            ) : installedPacks.length === 0 ? (
              <View
                onLayout={(event) => {
                  handleWhiteCardLayout(
                    event.nativeEvent.layout.y,
                    event.nativeEvent.layout.height,
                  );
                }}
                style={styles.whiteCardWrap}
              >
                <LibraryHomeEmptyWhiteCard overview={overview} />
              </View>
            ) : activePack ? (
              <View
                onLayout={(event) => {
                  handleWhiteCardLayout(
                    event.nativeEvent.layout.y,
                    event.nativeEvent.layout.height,
                  );
                }}
                style={styles.whiteCardWrap}
              >
                <LibraryHomeWhiteCard
                  activePack={activePack}
                  onContinuePress={() => {
                    openStudy(activePack);
                  }}
                  onDetailPress={() => {
                    openPackDetail(activePack);
                  }}
                  overview={overview}
                />
              </View>
            ) : null}
          </View>
        </View>

        {!isLibraryLoading ? (
          <View style={styles.installedSection}>
            <View style={styles.installedHeaderWrap}>
              <LibrarySectionHeader totalCards={overview.totalCards} />
            </View>
            {installedPacks.length > 0 ? (
              <LibraryInstalledPackShelf
                onDetailPress={openPackDetail}
                onPackPress={openStudy}
                packs={installedPacks}
              />
            ) : (
              <LibraryEmptyPackShelfPlaceholder
                onBrowsePress={() => {
                  router.push('/market');
                }}
              />
            )}
          </View>
        ) : null}
      </ScrollView>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.md,
  },
  heroSection: {
    position: 'relative',
  },
  gradientBackground: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
  },
  whiteCardWrap: {
    paddingBottom: spacing.xl,
    paddingHorizontal: CONTENT_HORIZONTAL_PADDING,
    paddingTop: spacing.sm,
  },
  gradientPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
    paddingBottom: spacing.lg,
    paddingHorizontal: CONTENT_HORIZONTAL_PADDING,
  },
  placeholderText: {
    color: colors.textPrimary,
    fontSize: 14,
    textAlign: 'center',
  },
  installedSection: {
    backgroundColor: colors.background,
    gap: spacing.md,
    paddingBottom: spacing.xl,
    paddingTop: spacing.lg,
  },
  installedHeaderWrap: {
    paddingHorizontal: CONTENT_HORIZONTAL_PADDING,
  },
});
