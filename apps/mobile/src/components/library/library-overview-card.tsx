import type { ReactElement } from 'react';
import { Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import logoImage from '../../../assets/images/icon_108x108.png';
import { SurfaceCard } from '../ui/surface-card';
import type { LibraryOverview } from '../../use-cases/get-library-overview';
import { formatLearningCount } from '../../use-cases/get-library-overview';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface LibraryOverviewCardProps {
  overview: LibraryOverview;
}

const STAT_TILE_GAP = spacing.sm;
const STAT_TILE_MIN_WIDTH = 96;
const STAT_TILE_HEIGHT = 68;

export function LibraryOverviewCard(props: LibraryOverviewCardProps): ReactElement {
  const { overview } = props;
  const { width: windowWidth } = useWindowDimensions();
  const horizontalPadding = spacing.lg * 2 + spacing.md * 2;
  const visibleMinWidth = Math.floor((windowWidth - horizontalPadding - STAT_TILE_GAP * 2) / 3);
  const statTileMinWidth = Math.max(STAT_TILE_MIN_WIDTH, visibleMinWidth);

  return (
    <SurfaceCard>
      <View style={styles.introRow}>
        <Image accessibilityLabel="记得" source={logoImage} style={styles.logo} />
        <Text style={styles.introText}>今天也继续一点，把学过的内容记得更牢。</Text>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalText}>
          共 <Text style={styles.totalNumber}>{formatLearningCount(overview.totalCards)}</Text>{' '}
          条学习内容
        </Text>
        <View accessibilityLabel="同步状态预留" style={styles.syncPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.statsRowContent}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsRow}
      >
        {overview.statTiles.map((tile) => (
          <StatTile
            key={tile.key}
            label={tile.label}
            minWidth={statTileMinWidth}
            unit={tile.unit}
            value={tile.value}
          />
        ))}
      </ScrollView>
    </SurfaceCard>
  );
}

function StatTile(props: {
  label: string;
  value: string;
  unit: string;
  minWidth: number;
}): ReactElement {
  return (
    <View style={[styles.statTile, { minWidth: props.minWidth }]}>
      <Text numberOfLines={1} style={styles.statLabel}>
        {props.label}
      </Text>
      <View style={styles.statValueRow}>
        <Text numberOfLines={1} style={styles.statValue}>
          {props.value}
        </Text>
        <Text style={styles.statUnit}>{props.unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  introRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  logo: {
    borderRadius: 12,
    height: 44,
    width: 44,
  },
  introText: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },
  totalRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  totalText: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  },
  totalNumber: {
    fontSize: 28,
    fontWeight: '700',
  },
  syncPlaceholder: {
    minHeight: 24,
    minWidth: 72,
  },
  statsRow: {
    flexGrow: 0,
  },
  statsRowContent: {
    flexDirection: 'row',
    gap: STAT_TILE_GAP,
  },
  statTile: {
    backgroundColor: colors.statTileBackground,
    borderRadius: 14,
    flexShrink: 0,
    height: STAT_TILE_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: spacing.xs,
  },
  statValueRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  statValue: {
    color: colors.textPrimary,
    flexShrink: 0,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  statUnit: {
    flexShrink: 0,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    marginLeft: spacing.xs,
  },
});
