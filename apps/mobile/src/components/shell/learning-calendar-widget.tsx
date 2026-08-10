import type { ReactElement } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import type { HeatCell } from '../../use-cases/get-learning-activity-summary';
import { getLearningActivitySummary } from '../../use-cases/get-learning-activity-summary';
import { consumeLearningCalendarNeedsRefresh } from '../../shell/learning-calendar-refresh-signal';
import { SurfaceCard } from '../ui/surface-card';
import { heatLevelColors, weekdayLabels } from '../calendar/calendar-theme';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export function LearningCalendarWidget(): ReactElement {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const summary = useMemo(() => getLearningActivitySummary(), [refreshKey]);
  const monthLabels = useMemo(() => buildMonthLabels(summary.heatGrid), [summary.heatGrid]);

  useFocusEffect(
    useCallback(() => {
      if (consumeLearningCalendarNeedsRefresh()) {
        setRefreshKey((key) => key + 1);
      }
    }, []),
  );

  const openCalendar = (localDate?: string): void => {
    if (localDate) {
      router.push(`/learning-calendar?localDate=${localDate}`);
      return;
    }
    router.push('/learning-calendar');
  };

  return (
    <Pressable accessibilityRole="button" onPress={() => openCalendar()}>
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
              event.stopPropagation?.();
              openCalendar();
            }}
          >
            <Text style={styles.viewAll}>查看全部 ›</Text>
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <SummaryStat label="学习天数" value={summary.activeDays} />
          <SummaryStat label="新接触" value={summary.firstRevealCount} />
          <SummaryStat label="复习词数" value={summary.reviewOutcomeCount} />
        </View>

        <View style={styles.gridWrap}>
          {summary.heatGrid.map((row, rowIndex) => (
            <View key={`row-${String(rowIndex)}`} style={styles.gridRow}>
              {row.map((cell) => (
                <Pressable
                  key={cell.localDate}
                  accessibilityLabel={`${cell.localDate} 学习记录`}
                  accessibilityRole="button"
                  disabled={!cell.isInRange}
                  onPress={(event) => {
                    event.stopPropagation?.();
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
                    },
                    cell.isToday ? styles.heatCellToday : null,
                  ]}
                />
              ))}
            </View>
          ))}
        </View>

        <View style={styles.weekdayRow}>
          {weekdayLabels.map((label) => (
            <Text key={label} style={styles.weekdayLabel}>
              {label}
            </Text>
          ))}
        </View>

        {monthLabels.length > 0 ? (
          <View style={styles.monthRow}>
            {monthLabels.map((item) => (
              <Text key={item.key} style={[styles.monthLabel, { left: `${item.leftPercent}%` }]}>
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
    const cell = heatGrid[0]?.[col];
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
      label: `${Number(month)}月`,
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
    alignItems: 'center',
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
    color: colors.accent,
    fontSize: 13,
    fontWeight: '500',
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
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  gridWrap: {
    gap: 3,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 3,
  },
  heatCell: {
    borderRadius: 3,
    flex: 1,
    height: 12,
    minWidth: 8,
  },
  heatCellToday: {
    borderColor: colors.accent,
    borderWidth: 1,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  weekdayLabel: {
    color: colors.textMuted,
    flex: 1,
    fontSize: 10,
    textAlign: 'center',
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
