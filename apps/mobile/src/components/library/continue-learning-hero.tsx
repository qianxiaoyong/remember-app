import type { ReactElement } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { catalogCoverHeroWidth } from '../../catalog/catalog-cover-layout';
import { resolveCatalogItemForPack } from '../../catalog/resolve-catalog-item-for-pack';
import { resolveCatalogCover } from '../../catalog/resolve-catalog-cover';
import type { InstalledPackSummary } from '../../use-cases/get-library-overview';
import { CoverTile } from '../catalog/cover-tile';
import { PrimaryButton } from '../ui/primary-button';
import { SurfaceCard } from '../ui/surface-card';
import { ProgressBar } from '../ui/progress-bar';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface ContinueLearningHeroProps {
  pack: InstalledPackSummary;
  horizontalPadding: number;
  onDetailPress: () => void;
  onStudyPress: () => void;
}

function resolveProgressLabel(pack: InstalledPackSummary): string {
  if (pack.libraryPresentation === 'reader') {
    return `阅读进度 ${String(pack.learnedCount)} / ${String(pack.totalCards)}`;
  }
  return `学习进度 ${String(pack.learnedCount)} / ${String(pack.totalCards)}`;
}

export function ContinueLearningHero(props: ContinueLearningHeroProps): ReactElement {
  const { width: windowWidth } = useWindowDimensions();
  const coverWidth = catalogCoverHeroWidth(windowWidth, props.horizontalPadding);
  const catalogItem = resolveCatalogItemForPack(props.pack.packId, props.pack.displayName);
  const cover = resolveCatalogCover(catalogItem, { imageKind: 'detail' });
  const progress = props.pack.totalCards > 0 ? props.pack.learnedCount / props.pack.totalCards : 0;
  const showProgress = props.pack.totalCards > 0;

  return (
    <SurfaceCard>
      <View style={styles.row}>
        <CoverTile
          onDetailPress={props.onDetailPress}
          source={cover.imageSource}
          width={coverWidth}
        />
        <View style={styles.body}>
          <Text numberOfLines={2} style={styles.title}>
            {props.pack.displayName}
          </Text>
          <Text numberOfLines={2} style={styles.statusHint}>
            {props.pack.statusHint}
          </Text>
          {showProgress ? (
            <View style={styles.progressBlock}>
              <Text style={styles.progressLabel}>{resolveProgressLabel(props.pack)}</Text>
              <ProgressBar color={cover.color} progress={progress} />
            </View>
          ) : null}
          <PrimaryButton label={props.pack.actionLabel} onPress={props.onStudyPress} />
        </View>
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  body: {
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'center',
    minWidth: 0,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  statusHint: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  progressBlock: {
    gap: spacing.xs,
  },
  progressLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 14,
  },
});
