import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { resolveCatalogItemForPack } from '../../catalog/resolve-catalog-item-for-pack';
import { PackCoverThumbnail, resolvePackCoverAccent } from '../catalog/pack-cover-thumbnail';
import { ProgressBar } from '../ui/progress-bar';
import { SurfaceCard } from '../ui/surface-card';
import type { InstalledPackSummary } from '../../use-cases/get-library-overview';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

/** 与进度文案 + 进度条块等高，保证无进度时标题起始位置一致。 */
const PROGRESS_SLOT_MIN_HEIGHT = 26;

interface InstalledPackRowProps {
  pack: InstalledPackSummary;
  onDetailPress: () => void;
  onStudyPress: () => void;
}

function resolveProgressLabel(pack: InstalledPackSummary): string {
  const progressText = `${String(pack.learnedCount)} / ${String(pack.totalCards)}`;
  if (pack.libraryPresentation === 'reader') {
    return `阅读进度 ${progressText}`;
  }
  return `学习进度 ${progressText}`;
}

export function InstalledPackRow(props: InstalledPackRowProps): ReactElement {
  const { pack } = props;
  const catalogItem = resolveCatalogItemForPack(pack.packId, pack.displayName);
  const accentColor = resolvePackCoverAccent(catalogItem);
  const progress = pack.totalCards > 0 ? pack.learnedCount / pack.totalCards : 0;
  const showProgress = pack.totalCards > 0;

  return (
    <SurfaceCard>
      <View style={styles.container}>
        <Pressable
          accessibilityLabel="查看详情"
          accessibilityRole="button"
          hitSlop={8}
          onPress={props.onDetailPress}
          style={styles.detailIconButton}
        >
          <Text style={styles.detailIconGlyph}>详</Text>
        </Pressable>

        <Pressable
          accessibilityLabel={pack.actionLabel}
          accessibilityRole="button"
          onPress={props.onStudyPress}
          style={styles.studyPressable}
        >
          <View style={styles.topRow}>
            <PackCoverThumbnail item={catalogItem} size={72} />
            <View style={styles.content}>
              <Text numberOfLines={2} style={styles.title}>
                {pack.displayName}
              </Text>
              <View style={styles.progressSlot}>
                {showProgress ? (
                  <>
                    <Text style={styles.progressLabel}>{resolveProgressLabel(pack)}</Text>
                    <ProgressBar color={accentColor} progress={progress} />
                  </>
                ) : null}
              </View>
            </View>
          </View>
          <View style={styles.footerRow}>
            <Text numberOfLines={1} style={styles.statusHint}>
              {pack.statusHint}
            </Text>
            <Text style={styles.actionLabel}>{pack.actionLabel} ›</Text>
          </View>
        </Pressable>
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  detailIconButton: {
    alignItems: 'center',
    backgroundColor: colors.statTileBackground,
    borderRadius: 11,
    height: 22,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
    width: 22,
    zIndex: 1,
  },
  detailIconGlyph: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '400',
  },
  studyPressable: {
    gap: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingRight: 26,
  },
  content: {
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'flex-start',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  progressSlot: {
    gap: spacing.sm,
    minHeight: PROGRESS_SLOT_MIN_HEIGHT,
  },
  progressLabel: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  footerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusHint: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: 11,
    marginRight: spacing.md,
  },
  actionLabel: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
});
