import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { catalogCoverHeight } from '../../catalog/catalog-cover-layout';
import { resolveCatalogItemForPack } from '../../catalog/resolve-catalog-item-for-pack';
import { resolveCatalogCover } from '../../catalog/resolve-catalog-cover';
import type { InstalledPackSummary } from '../../use-cases/get-library-overview';
import { CoverTile } from '../catalog/cover-tile';
import { ProgressBar } from '../ui/progress-bar';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const ACTIVE_COVER_WIDTH = 64;

interface LibraryActivePackSummaryProps {
  pack: InstalledPackSummary;
  onDetailPress: () => void;
}

export function LibraryActivePackSummary(props: LibraryActivePackSummaryProps): ReactElement {
  const { pack } = props;
  const catalogItem = resolveCatalogItemForPack(pack.packId, pack.displayName);
  const cover = resolveCatalogCover(catalogItem, { imageKind: 'list' });
  const progress = pack.totalCards > 0 ? pack.learnedCount / pack.totalCards : 0;
  const showProgress = pack.totalCards > 0;
  const progressText = `${String(pack.learnedCount)} / ${String(pack.totalCards)}`;
  const trailingHint = pack.statusHint !== '尚未开始' ? pack.statusHint : pack.actionLabel;

  return (
    <View style={styles.root}>
      <CoverTile
        onDetailPress={props.onDetailPress}
        source={cover.imageSource}
        width={ACTIVE_COVER_WIDTH}
      />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text ellipsizeMode="tail" numberOfLines={1} style={styles.title}>
            {pack.displayName}
          </Text>
          <Pressable
            accessibilityLabel="查看详情"
            accessibilityRole="button"
            hitSlop={8}
            onPress={props.onDetailPress}
          >
            <Text style={styles.detailLinkText}>详情 ›</Text>
          </Pressable>
        </View>

        {showProgress ? (
          <ProgressBar color={cover.color} progress={progress} />
        ) : (
          <View style={styles.progressPlaceholder} />
        )}

        <View style={styles.footerRow}>
          <Text numberOfLines={1} style={styles.progressText}>
            {showProgress ? progressText : '尚未开始'}
          </Text>
          <Text ellipsizeMode="tail" numberOfLines={1} style={styles.statusHint}>
            {trailingHint}
          </Text>
        </View>
      </View>
    </View>
  );
}

export const libraryActivePackSummaryHeight = catalogCoverHeight(ACTIVE_COVER_WIDTH);

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  body: {
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'center',
    minWidth: 0,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  detailLinkText: {
    color: colors.textSecondary,
    flexShrink: 0,
    fontSize: 12,
    lineHeight: 16,
  },
  progressPlaceholder: {
    height: 4,
  },
  footerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    color: colors.textSecondary,
    flexShrink: 0,
    fontSize: 12,
    lineHeight: 16,
  },
  statusHint: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    marginLeft: spacing.sm,
    textAlign: 'right',
  },
});
