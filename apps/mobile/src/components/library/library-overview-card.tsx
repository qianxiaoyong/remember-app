import type { ReactElement } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import logoImage from '../../../assets/images/icon_108x108.png';
import { SurfaceCard } from '../ui/surface-card';
import type { LibraryOverview } from '../../use-cases/get-library-overview';
import { formatLearningCount } from '../../use-cases/get-library-overview';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface LibraryOverviewCardProps {
  overview: LibraryOverview;
}

export function LibraryOverviewCard(props: LibraryOverviewCardProps): ReactElement {
  const { overview } = props;

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

      <View style={styles.statsRow}>
        <StatTile label="待复习" value={overview.todayTaskCount} />
        <StatTile label="学习中" value={overview.learningCount} />
        <StatTile label="已掌握" value={overview.masteredCount} />
      </View>
    </SurfaceCard>
  );
}

function StatTile(props: { label: string; value: number }): ReactElement {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statLabel}>{props.label}</Text>
      <Text style={styles.statValue}>
        {formatLearningCount(props.value)} <Text style={styles.statUnit}>条</Text>
      </Text>
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
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statTile: {
    backgroundColor: colors.statTileBackground,
    borderRadius: 14,
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  statUnit: {
    fontSize: 13,
    fontWeight: '500',
  },
});
