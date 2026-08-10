import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Pressable } from 'react-native';
import type { HeatLevel } from '@remember/domain';
import { heatLevelColors } from './calendar-theme';
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
  const cells = buildMonthCells(props.year, props.month);
  const today = formatTodayLocalDate();

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" hitSlop={12} onPress={props.onPrevMonth}>
          <Text style={styles.nav}>‹</Text>
        </Pressable>
        <Text style={styles.monthTitle}>
          {props.year} 年 {props.month} 月
        </Text>
        <Pressable accessibilityRole="button" hitSlop={12} onPress={props.onNextMonth}>
          <Text style={styles.nav}>›</Text>
        </Pressable>
      </View>

      <View style={styles.weekdayHeader}>
        {['日', '一', '二', '三', '四', '五', '六'].map((label) => (
          <Text key={label} style={styles.weekday}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell) => {
          if (!cell.localDate) {
            return <View key={cell.key} style={styles.cellEmpty} />;
          }

          const heat = props.heatByDate.get(cell.localDate) ?? 0;
          const isSelected = cell.localDate === props.selectedDate;
          const isToday = cell.localDate === today;

          return (
            <Pressable
              key={cell.key}
              accessibilityRole="button"
              onPress={() => {
                if (cell.localDate) {
                  props.onSelectDate(cell.localDate);
                }
              }}
              style={[styles.cell, isSelected ? styles.cellSelected : null]}
            >
              <Text style={[styles.dayNumber, isSelected ? styles.dayNumberSelected : null]}>
                {cell.day}
              </Text>
              <View
                style={[
                  styles.heatDot,
                  { backgroundColor: heatLevelColors[heat] },
                  isToday ? styles.heatDotToday : null,
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

function buildMonthCells(
  year: number,
  month: number,
): { key: string; localDate: string | null; day: number | null }[] {
  const firstDay = new Date(year, month - 1, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: { key: string; localDate: string | null; day: number | null }[] = [];

  for (let i = 0; i < startWeekday; i += 1) {
    cells.push({ key: `pad-${String(i)}`, localDate: null, day: null });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const m = String(month).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    cells.push({
      key: `${String(year)}-${m}-${d}`,
      localDate: `${String(year)}-${m}-${d}`,
      day,
    });
  }

  return cells;
}

const styles = StyleSheet.create({
  wrap: {
    flexShrink: 0,
    marginBottom: spacing.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  nav: {
    color: colors.accent,
    fontSize: 22,
    fontWeight: '600',
    paddingHorizontal: spacing.xs,
  },
  monthTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  weekdayHeader: {
    flexDirection: 'row',
    marginBottom: 2,
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
    height: 36,
    justifyContent: 'center',
    width: `${String(100 / 7)}%`,
  },
  cellEmpty: {
    height: 36,
    width: `${String(100 / 7)}%`,
  },
  cellSelected: {
    backgroundColor: colors.accentSoft,
    borderRadius: 10,
  },
  dayNumber: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  dayNumberSelected: {
    color: colors.accent,
    fontWeight: '700',
  },
  heatDot: {
    borderRadius: 3,
    height: 6,
    marginTop: 2,
    width: 6,
  },
  heatDotToday: {
    borderColor: colors.accent,
    borderWidth: 1,
  },
});
