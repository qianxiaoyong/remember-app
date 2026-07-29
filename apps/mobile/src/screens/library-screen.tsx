import type { ReactElement } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { InstalledPackRow } from '../components/library/installed-pack-row';
import { LibraryOverviewCard } from '../components/library/library-overview-card';
import { LibrarySectionHeader } from '../components/library/library-section-header';
import { AppHeader } from '../components/shell/app-header';
import { ScreenScaffold } from '../components/shell/screen-scaffold';
import { PrimaryButton } from '../components/ui/primary-button';
import { useShellActions } from '../shell/shell-provider';
import { consumeLibraryNeedsRefresh } from '../shell/library-refresh-signal';
import { navigateShellTab } from '../shell/shell-tab-transition';
import { getLibraryOverview, listInstalledPackSummaries } from '../use-cases/get-library-overview';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function LibraryScreen(): ReactElement {
  const router = useRouter();
  const { openDrawer } = useShellActions();
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (consumeLibraryNeedsRefresh()) {
        setRefreshKey((value) => value + 1);
      }
    }, []),
  );

  const overview = useMemo(() => getLibraryOverview(), [refreshKey]);
  const installedPacks = useMemo(() => listInstalledPackSummaries(), [refreshKey]);

  return (
    <ScreenScaffold withCapsulePadding>
      <AppHeader
        onMenuPress={openDrawer}
        onSearchPress={() => {
          router.push('/library-search');
        }}
        variant="shell"
      />
      <ScrollView contentContainerStyle={styles.content}>
        <LibraryOverviewCard overview={overview} />

        {installedPacks.length === 0 ? (
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
