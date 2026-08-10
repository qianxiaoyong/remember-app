import type { ReactElement } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import type { HeatCell } from '../../use-cases/get-learning-activity-summary';
import { getLearningActivitySummary } from '../../use-cases/get-learning-activity-summary';
import { consumeLearningCalendarNeedsRefresh } from '../../shell/learning-calendar-refresh-signal';
import { markDrawerReturnPending } from '../../shell/drawer-return-intent';
import { useShellActions } from '../../shell/shell-provider';
import { SurfaceCard } from '../ui/surface-card';
import { heatLevelColors } from '../calendar/calendar-theme';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const HEAT_GRID_COLS = 12;
const HEAT_GRID_ROWS = 7;
const HEAT_GRID_GAP = 3;
const DRAWER_WIDTH_RATIO = 0.86;

function estimateHeatGridInnerWidth(): number {
  const panelWidth = Dimensions.get('window').width * DRAWER_WIDTH_RATIO;
  return panelWidth - spacing.lg * 2 - spacing.lg * 2;
}

function resolveHeatCellSize(gridWidth: number): number {
  return Math.max(
    8,
    Math.floor((gridWidth - HEAT_GRID_GAP * (HEAT_GRID_COLS - 1)) / HEAT_GRID_COLS),
  );
}

export function LearningCalendarWidget(): ReactElement {
  const router = useRouter();
  const { dismissDrawer } = useShellActions();
  const [refreshKey, setRefreshKey] = useState(0);
  const [gridWidth, setGridWidth] = useState(estimateHeatGridInnerWidth);
  const summary = useMemo(() => getLearningActivitySummary(), [refreshKey]);
  const monthLabels = useMemo(() => buildMonthLabels(summary.heatGrid), [summary.heatGrid]);
  const heatCellSize = resolveHeatCellSize(gridWidth);
  const heatGridHeight = heatCellSize * HEAT_GRID_ROWS + HEAT_GRID_GAP * (HEAT_GRID_ROWS - 1);

  useFocusEffect(
    useCallback(() => {
      if (consumeLearningCalendarNeedsRefresh()) {
        setRefreshKey((key) => key + 1);
      }
    }, []),
  );

  const openCalendar = (localDate?: string): void => {
    markDrawerReturnPending();
    dismissDrawer();
    if (localDate) {
      router.push(`/learning-calendar?localDate=${localDate}`);
      return;
    }
    router.push('/learning-calendar');
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        openCalendar();
      }}
    >
      <SurfaceCard>
        <View style={styles.headerRow}>
          <View style={styles.titleGroup}>
            <Text style={styles.title}>学习日历</Text>
            <Text style={styles.rangeHint}>近90天</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={(event) => {
              event.stopPropagation();
              openCalendar();
            }}
          >
            <Text style={styles.viewAll}>查看全部 ›</Text>
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <SummaryStat label="学习天数" value={summary.activeDays} />
          <SummaryStat label="新词量" value={summary.firstRevealCount} />
          <SummaryStat label="复习量" value={summary.reviewOutcomeCount} />
        </View>

        <View
          onLayout={(event) => {
            const nextWidth = event.nativeEvent.layout.width;
            if (nextWidth > 0 && Math.abs(nextWidth - gridWidth) > 1) {
              setGridWidth(nextWidth);
            }
          }}
          style={[styles.gridWrap, { height: heatGridHeight }]}
        >
          {summary.heatGrid.map((row, rowIndex) => (
            <View key={`row-${String(rowIndex)}`} style={styles.gridRow}>
              {row.map((cell) => (
                <Pressable
                  key={cell.localDate}
                  accessibilityLabel={`${cell.localDate} 学习记录`}
                  accessibilityRole="button"
                  disabled={!cell.isInRange}
                  onPress={(event) => {
                    event.stopPropagation();
                    if (cell.isInRange) {
                      openCalendar(cell.localDate);
                    }
                  }}
                  style={[
                    styles.heatCell,
                    {
                      backgroundColor: cell.isInRange
                        ? heatLevelColors[cell.level]
                        : heatLevelColors[0],
                      height: heatCellSize,
                      width: heatCellSize,
                    },
                    cell.isToday ? styles.heatCellToday : null,
                  ]}
                />
              ))}
            </View>
          ))}
        </View>

        {monthLabels.length > 0 ? (
          <View style={styles.monthRow}>
            {monthLabels.map((item) => (
              <Text
                key={item.key}
                style={[styles.monthLabel, { left: `${String(item.leftPercent)}%` }]}
              >
                {item.label}
              </Text>
            ))}
          </View>
        ) : null}
      </SurfaceCard>
    </Pressable>
  );
}

function SummaryStat(props: { label: string; value: number }): ReactElement {
  return (
    <View style={styles.summaryStat}>
      <Text style={styles.summaryValue}>{props.value}</Text>
      <Text style={styles.summaryLabel}>{props.label}</Text>
    </View>
  );
}

function buildMonthLabels(
  heatGrid: HeatCell[][],
): { key: string; label: string; leftPercent: number }[] {
  if (heatGrid.length === 0 || !heatGrid[0]) {
    return [];
  }

  const colCount = heatGrid[0].length;
  const labels: { key: string; label: string; leftPercent: number }[] = [];
  let lastMonth = '';

  for (let col = 0; col < colCount; col += 1) {
    const cell = heatGrid[0][col];
    if (!cell?.isInRange) {
      continue;
    }
    const month = cell.localDate.slice(5, 7);
    if (month === lastMonth) {
      continue;
    }
    lastMonth = month;
    labels.push({
      key: `${cell.localDate.slice(0, 7)}-${String(col)}`,
      label: `${String(Number(month))}月`,
      leftPercent: (col / colCount) * 100,
    });
  }

  return filterCrowdedMonthLabels(labels);
}

const MIN_MONTH_LABEL_GAP_PERCENT = 10;

function filterCrowdedMonthLabels(
  labels: { key: string; label: string; leftPercent: number }[],
): { key: string; label: string; leftPercent: number }[] {
  if (labels.length <= 1) {
    return labels;
  }

  const filtered: { key: string; label: string; leftPercent: number }[] = [];
  for (let i = 0; i < labels.length; i += 1) {
    const current = labels[i];
    const next = labels[i + 1];
    if (current && next && next.leftPercent - current.leftPercent < MIN_MONTH_LABEL_GAP_PERCENT) {
      continue;
    }
    if (current) {
      filtered.push(current);
    }
  }
  return filtered;
}

const styles = StyleSheet.create({
  headerRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  titleGroup: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  rangeHint: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '400',
  },
  viewAll: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '400',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  summaryStat: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    color: colors.textSecondary,
    fontSize: 22,
    fontWeight: '700',
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  gridWrap: {
    gap: HEAT_GRID_GAP,
  },
  gridRow: {
    flexDirection: 'row',
    gap: HEAT_GRID_GAP,
  },
  heatCell: {
    borderRadius: 3,
  },
  heatCellToday: {
    borderColor: colors.accent,
    borderWidth: 1,
  },
  monthRow: {
    height: 16,
    marginTop: spacing.xs,
    position: 'relative',
  },
  monthLabel: {
    color: colors.textMuted,
    fontSize: 10,
    position: 'absolute',
  },
});
