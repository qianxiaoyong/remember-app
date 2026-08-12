import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View, type DimensionValue } from 'react-native';
import type { HeatLevel } from '@remember/domain';
import { AppIcon } from '../ui/app-icon';
import { heatLevelColors, weekdayLabels } from './calendar-theme';
import { buildMonthGridCells } from './learning-calendar-month-grid';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface LearningCalendarMonthProps {
  year: number;
  month: number;
  selectedDate: string;
  heatByDate: Map<string, HeatLevel>;
  onSelectDate: (localDate: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function LearningCalendarMonth(props: LearningCalendarMonthProps): ReactElement {
  const cells = buildMonthGridCells(props.year, props.month);
  const today = formatTodayLocalDate();
  const monthLabel = `${String(props.year)}.${String(props.month).padStart(2, '0')}`;

  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>学习记录</Text>
        <View style={styles.navGroup}>
          <Pressable accessibilityRole="button" hitSlop={12} onPress={props.onPrevMonth}>
            <AppIcon color={colors.textSecondary} name="chevron-back" size="sm" />
          </Pressable>
          <Text style={styles.monthNavLabel}>{monthLabel}</Text>
          <Pressable accessibilityRole="button" hitSlop={12} onPress={props.onNextMonth}>
            <AppIcon color={colors.textSecondary} name="chevron-forward" size="sm" />
          </Pressable>
        </View>
      </View>

      <View style={styles.weekdayHeader}>
        {weekdayLabels.map((label) => (
          <Text key={label} style={styles.weekday}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell) => {
          const heat = props.heatByDate.get(cell.localDate) ?? 0;
          const isSelected = cell.localDate === props.selectedDate;
          const isToday = cell.localDate === today;

          return (
            <Pressable
              key={cell.key}
              accessibilityRole="button"
              onPress={() => {
                props.onSelectDate(cell.localDate);
              }}
              style={[
                styles.cell,
                isSelected && !isToday ? styles.cellSelected : null,
                isToday ? styles.cellToday : null,
              ]}
            >
              <Text
                style={[
                  styles.dayNumber,
                  !cell.isCurrentMonth ? styles.dayNumberOtherMonth : null,
                  isSelected && !isToday ? styles.dayNumberSelected : null,
                  isToday ? styles.dayNumberToday : null,
                ]}
              >
                {isToday ? '今' : String(cell.day)}
              </Text>
              <View
                style={[
                  styles.heatDot,
                  { backgroundColor: heatLevelColors[heat] },
                  !cell.isCurrentMonth && heat === 0 ? styles.heatDotOtherMonth : null,
                ]}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function formatTodayLocalDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${String(y)}-${m}-${d}`;
}

const styles = StyleSheet.create({
  wrap: {
    flexShrink: 0,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  navGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  monthNavLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
    minWidth: 72,
    textAlign: 'center',
  },
  weekdayHeader: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekday: {
    color: colors.textMuted,
    flex: 1,
    fontSize: 11,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: `${String(100 / 7)}%` as DimensionValue,
  },
  cellSelected: {
    backgroundColor: colors.accentSoft,
    borderRadius: 8,
  },
  cellToday: {
    backgroundColor: colors.calendarToday,
    borderRadius: 8,
  },
  dayNumber: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  dayNumberOtherMonth: {
    color: colors.calendarOtherMonth,
  },
  dayNumberSelected: {
    color: colors.accent,
    fontWeight: '700',
  },
  dayNumberToday: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  heatDot: {
    borderRadius: 3,
    height: 6,
    marginTop: 2,
    width: 6,
  },
  heatDotOtherMonth: {
    backgroundColor: colors.statTileBackground,
  },
});
