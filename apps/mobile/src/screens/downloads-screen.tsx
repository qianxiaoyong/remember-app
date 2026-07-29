import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '../components/shell/app-header';
import { ScreenScaffold } from '../components/shell/screen-scaffold';
import { SurfaceCard } from '../components/ui/surface-card';
import { listInstalledPacksUseCase } from '../use-cases/list-installed-packs';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function DownloadsScreen(): ReactElement {
  const router = useRouter();
  const installedPacks = useMemo(() => listInstalledPacksUseCase(), []);

  return (
    <ScreenScaffold>
      <AppHeader
        onBackPress={() => {
          router.back();
        }}
        variant="back"
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>下载管理</Text>
        {installedPacks.length === 0 ? (
          <Text style={styles.empty}>暂无已安装知识库</Text>
        ) : (
          installedPacks.map((pack) => (
            <SurfaceCard key={pack.packId}>
              <Text style={styles.name}>{pack.displayName}</Text>
              <Text style={styles.meta}>
                {pack.packVersion} · 已安装 · {pack.installedAt.slice(0, 10)}
              </Text>
            </SurfaceCard>
          ))
        )}
      </ScrollView>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.xs,
  },
});
