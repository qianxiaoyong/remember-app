import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { resolveCatalogItemForPack } from '../../catalog/resolve-catalog-item-for-pack';
import { PackCoverThumbnail, resolvePackCoverAccent } from '../catalog/pack-cover-thumbnail';
import { ProgressBar } from '../ui/progress-bar';
import { SurfaceCard } from '../ui/surface-card';
import type { InstalledPackSummary } from '../../use-cases/get-library-overview';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface InstalledPackRowProps {
  pack: InstalledPackSummary;
  onDetailPress: () => void;
  onStudyPress: () => void;
}

export function InstalledPackRow(props: InstalledPackRowProps): ReactElement {
  const { pack } = props;
  const catalogItem = resolveCatalogItemForPack(pack.packId, pack.displayName);
  const accentColor = resolvePackCoverAccent(catalogItem);
  const progress = pack.totalCards > 0 ? pack.learnedCount / pack.totalCards : 0;
  const showProgress = pack.libraryPresentation === 'study';

  return (
    <SurfaceCard>
      <Pressable accessibilityRole="button" onPress={props.onDetailPress}>
        <View style={styles.topRow}>
          <PackCoverThumbnail item={catalogItem} size={72} />
          <View style={styles.content}>
            <Text numberOfLines={2} style={styles.title}>
              {pack.displayName}
            </Text>
            {showProgress ? (
              <>
                <Text style={styles.progressLabel}>
                  总学习进度 {pack.learnedCount} / {pack.totalCards}
                </Text>
                <ProgressBar color={accentColor} progress={progress} />
              </>
            ) : null}
          </View>
        </View>
      </Pressable>
      <View style={styles.footerRow}>
        <Pressable
          accessibilityRole="button"
          onPress={props.onDetailPress}
          style={styles.statusPressable}
        >
          <Text style={styles.statusHint}>{pack.statusHint}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={props.onStudyPress}>
          <Text style={styles.actionLabel}>{pack.actionLabel} ›</Text>
        </Pressable>
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  content: {
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  progressLabel: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  footerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  statusPressable: {
    flex: 1,
    marginRight: spacing.md,
  },
  statusHint: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  actionLabel: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
});
