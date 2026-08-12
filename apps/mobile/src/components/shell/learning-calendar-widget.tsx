import type { ReactElement } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { deferAfterFirstPaint } from '../../lib/defer-after-first-paint';
import { useFocusEffect, useRouter } from 'expo-router';
import type { LearningActivitySummary } from '../../use-cases/get-learning-activity-summary';
import { getLearningActivitySummary } from '../../use-cases/get-learning-activity-summary';
import {
  flushLearningCalendarNeedsRefresh,
  subscribeLearningCalendarRefresh,
} from '../../shell/learning-calendar-refresh-signal';
import { SurfaceCard } from '../ui/surface-card';
import { heatLevelColors } from '../calendar/calendar-theme';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const HEAT_GRID_COLS = 12;
const HEAT_GRID_ROWS = 7;
const HEAT_GRID_GAP = 3;
const MONTH_LABEL_WIDTH = 36;

function estimateHeatGridInnerWidth(): number {
  return Dimensions.get('window').width - spacing.lg * 4;
}

function resolveHeatCellSize(gridWidth: number): number {
  return Math.max(
    8,
    Math.floor((gridWidth - HEAT_GRID_GAP * (HEAT_GRID_COLS - 1)) / HEAT_GRID_COLS),
  );
}

export function LearningCalendarWidget(): ReactElement {
  const router = useRouter();
  const [summary, setSummary] = useState<LearningActivitySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const summaryRef = useRef<LearningActivitySummary | null>(null);
  const [gridWidth, setGridWidth] = useState(estimateHeatGridInnerWidth);
  const heatCellSize = resolveHeatCellSize(gridWidth);
  const heatGridHeight = heatCellSize * HEAT_GRID_ROWS + HEAT_GRID_GAP * (HEAT_GRID_ROWS - 1);

  const loadSummary = useCallback((silent = false) => {
    if (!silent || summaryRef.current === null) {
      setIsLoading(true);
    }
    const cancelDefer = deferAfterFirstPaint(() => {
      const nextSummary = getLearningActivitySummary();
      summaryRef.current = nextSummary;
      setSummary(nextSummary);
      setIsLoading(false);
    });

    return cancelDefer;
  }, []);

  useEffect(() => subscribeLearningCalendarRefresh(() => loadSummary(true)), [loadSummary]);

  useFocusEffect(
    useCallback(() => {
      flushLearningCalendarNeedsRefresh();
      if (summaryRef.current === null) {
        return loadSummary();
      }
    }, [loadSummary]),
  );

  const openCalendar = (localDate?: string): void => {
    if (localDate) {
      router.push(`/record?localDate=${localDate}`);
      return;
    }
    router.push('/record');
  };

  const monthLabels = useMemo(() => summary?.monthLabels ?? [], [summary]);

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
        </View>

        <View style={styles.statsRow}>
          <SummaryStat label="学习天数" loading={isLoading} value={summary?.activeDays ?? 0} />
          <SummaryStat label="新词量" loading={isLoading} value={summary?.firstRevealCount ?? 0} />
          <SummaryStat
            label="复习量"
            loading={isLoading}
            value={summary?.reviewOutcomeCount ?? 0}
          />
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
          {isLoading || !summary ? (
            <HeatGridSkeleton cellSize={heatCellSize} />
          ) : (
            summary.heatGrid.map((row, rowIndex) => (
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
            ))
          )}
        </View>

        {monthLabels.length > 0 ? (
          <View style={styles.monthRow}>
            {monthLabels.map((item) => (
              <Text
                key={item.key}
                style={[
                  styles.monthLabel,
                  {
                    left: `${String(((item.colIndex + 0.5) / HEAT_GRID_COLS) * 100)}%` as `${number}%`,
                    marginLeft: -MONTH_LABEL_WIDTH / 2,
                    width: MONTH_LABEL_WIDTH,
                  },
                ]}
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

function SummaryStat(props: { label: string; value: number; loading?: boolean }): ReactElement {
  return (
    <View style={styles.summaryStat}>
      <Text style={[styles.summaryValue, props.loading ? styles.summaryValueLoading : null]}>
        {props.loading ? '—' : props.value}
      </Text>
      <Text style={styles.summaryLabel}>{props.label}</Text>
    </View>
  );
}

function HeatGridSkeleton(props: { cellSize: number }): ReactElement {
  return (
    <>
      {Array.from({ length: HEAT_GRID_ROWS }, (_, rowIndex) => (
        <View key={`skeleton-row-${String(rowIndex)}`} style={styles.gridRow}>
          {Array.from({ length: HEAT_GRID_COLS }, (_, colIndex) => (
            <View
              key={`skeleton-cell-${String(rowIndex)}-${String(colIndex)}`}
              style={[
                styles.heatCell,
                styles.heatCellSkeleton,
                { height: props.cellSize, width: props.cellSize },
              ]}
            />
          ))}
        </View>
      ))}
    </>
  );
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
  summaryValueLoading: {
    color: colors.textMuted,
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
  heatCellSkeleton: {
    backgroundColor: colors.statTileBackground,
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
    textAlign: 'center',
  },
});
