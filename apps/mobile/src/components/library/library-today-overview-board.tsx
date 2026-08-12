import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatLearningCount, type LibraryOverview } from '../../use-cases/get-library-overview';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface LibraryTodayOverviewBoardProps {
  overview: LibraryOverview;
}

const HOME_STAT_SPECS = [
  { key: 'todayReviewCompleted', label: '已复习' },
  { key: 'todayJoinedPool', label: '新加词' },
  { key: 'reviewPoolTotal', label: '词总数' },
] as const;

function resolveStatDisplay(
  spec: (typeof HOME_STAT_SPECS)[number],
  overview: LibraryOverview,
  tile: { value: string; unit: string },
): { value: string; unit: string } {
  if (spec.key === 'todayReviewCompleted') {
    return {
      value: formatLearningCount(overview.todayReviewCompleted),
      unit: tile.unit,
    };
  }
  return { value: tile.value, unit: tile.unit };
}

function resolveValueFontSize(value: string): number {
  if (value.length >= 7) {
    return 18;
  }
  if (value.length >= 5) {
    return 22;
  }
  return 26;
}

export function LibraryTodayOverviewBoard(props: LibraryTodayOverviewBoardProps): ReactElement {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>今日一览</Text>
      <View style={styles.columns}>
        {HOME_STAT_SPECS.map((spec) => {
          const tile = props.overview.statTiles.find((item) => item.key === spec.key);
          if (!tile) {
            return null;
          }

          const display = resolveStatDisplay(spec, props.overview, tile);
          const valueFontSize = resolveValueFontSize(display.value);

          return (
            <View key={spec.key} style={styles.column}>
              <Text numberOfLines={1} style={styles.label}>
                {spec.label}
              </Text>
              <View style={styles.valueRow}>
                <Text
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}
                  numberOfLines={1}
                  style={[styles.value, { fontSize: valueFontSize, lineHeight: valueFontSize + 4 }]}
                >
                  {display.value}
                </Text>
                <Text style={styles.unit}>{display.unit}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    width: '100%',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
  columns: {
    flexDirection: 'row',
    width: '100%',
  },
  column: {
    alignItems: 'flex-start',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
    overflow: 'hidden',
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'left',
    width: '100%',
  },
  valueRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: 2,
    justifyContent: 'flex-start',
    minWidth: 0,
    width: '100%',
  },
  value: {
    color: colors.textPrimary,
    flexShrink: 1,
    fontStyle: 'italic',
    fontWeight: '700',
    minWidth: 0,
  },
  unit: {
    color: colors.textPrimary,
    flexShrink: 0,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
});
