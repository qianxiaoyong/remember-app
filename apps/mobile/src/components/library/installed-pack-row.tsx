import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  CATALOG_COVER_WIDTH_HOME,
  CATALOG_PACK_ROW_HEIGHT,
} from '../../catalog/catalog-cover-layout';
import { resolveCatalogItemForPack } from '../../catalog/resolve-catalog-item-for-pack';
import { PackCoverThumbnail, resolvePackCoverAccent } from '../catalog/pack-cover-thumbnail';
import { ProgressBar } from '../ui/progress-bar';
import { SurfaceCard } from '../ui/surface-card';
import type { InstalledPackSummary } from '../../use-cases/get-library-overview';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const COVER_HEIGHT = CATALOG_PACK_ROW_HEIGHT;
const DETAIL_ICON_SIZE = 22;

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
    <SurfaceCard compact>
      <Pressable
        accessibilityLabel={pack.actionLabel}
        accessibilityRole="button"
        onPress={props.onStudyPress}
        style={styles.pressable}
      >
        <View style={styles.topRow}>
          <PackCoverThumbnail item={catalogItem} size={CATALOG_COVER_WIDTH_HOME} />
          <View style={styles.content}>
            <View style={styles.mainBlock}>
              <Text numberOfLines={2} style={styles.title}>
                {pack.displayName}
              </Text>
              {showProgress ? (
                <View style={styles.progressBlock}>
                  <Text style={styles.progressLabel}>{resolveProgressLabel(pack)}</Text>
                  <ProgressBar color={accentColor} progress={progress} />
                </View>
              ) : null}
            </View>
            <View style={styles.footerRow}>
              <Text numberOfLines={1} style={styles.statusHint}>
                {pack.statusHint}
              </Text>
              <Text style={styles.actionLabel}>{pack.actionLabel} ›</Text>
            </View>
          </View>
          <Pressable
            accessibilityLabel="查看详情"
            accessibilityRole="button"
            hitSlop={8}
            onPress={(event) => {
              event.stopPropagation();
              props.onDetailPress();
            }}
            style={styles.detailIconButton}
          >
            <Text style={styles.detailIconGlyph}>详</Text>
          </Pressable>
        </View>
      </Pressable>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    height: COVER_HEIGHT,
    position: 'relative',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    minWidth: 0,
  },
  mainBlock: {
    gap: spacing.xs,
    paddingRight: DETAIL_ICON_SIZE,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  progressBlock: {
    gap: spacing.xs,
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
    marginRight: spacing.xs,
    minWidth: 0,
  },
  actionLabel: {
    color: colors.textPrimary,
    flexShrink: 0,
    fontSize: 12,
    fontWeight: '600',
  },
  detailIconButton: {
    alignItems: 'center',
    backgroundColor: colors.statTileBackground,
    borderRadius: 11,
    height: DETAIL_ICON_SIZE,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
    width: DETAIL_ICON_SIZE,
    zIndex: 1,
  },
  detailIconGlyph: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '400',
  },
});
