import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { LibraryOverview } from '../../use-cases/get-library-overview';
import { formatLearningCount } from '../../use-cases/get-library-overview';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface LibraryStatsStripProps {
  overview: LibraryOverview;
}

export function LibraryStatsStrip(props: LibraryStatsStripProps): ReactElement {
  const { overview } = props;
  const reviewTile = overview.statTiles.find((tile) => tile.key === 'todayReviewCompleted');
  const joinedTile = overview.statTiles.find((tile) => tile.key === 'todayJoinedPool');
  const poolTile = overview.statTiles.find((tile) => tile.key === 'reviewPoolTotal');

  const segments = [
    `共 ${formatLearningCount(overview.totalCards)} 条`,
    reviewTile ? `${reviewTile.label} ${reviewTile.value}${reviewTile.unit}` : null,
    joinedTile ? `${joinedTile.label} ${joinedTile.value}${joinedTile.unit}` : null,
    poolTile ? `${poolTile.label} ${poolTile.value}${poolTile.unit}` : null,
  ].filter((segment): segment is string => segment !== null);

  return (
    <View style={styles.root}>
      <Text numberOfLines={2} style={styles.text}>
        {segments.join(' · ')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingVertical: spacing.xs,
  },
  text: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
});
