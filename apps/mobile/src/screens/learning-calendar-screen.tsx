import type { ReactElement } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { calculateHeatLevel } from '@remember/domain';
import type { HeatLevel } from '@remember/domain';
import { formatLocalReviewDate } from '@remember/domain';
import { AppHeader } from '../components/shell/app-header';
import { ScreenScaffold } from '../components/shell/screen-scaffold';
import { LearningCalendarDayDetailPanel } from '../components/calendar/learning-calendar-day-detail';
import { LearningCalendarMonth } from '../components/calendar/learning-calendar-month';
import { listEventsInDateRange } from '../data/repositories/learning-activity-event-repository';
import { getLearningCalendarDayDetail } from '../use-cases/get-learning-calendar-day-detail';
import { getDeviceTimeZone } from '../lib/get-device-time-zone';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface LearningCalendarScreenProps {
  initialLocalDate?: string;
}

export function LearningCalendarScreen(props: LearningCalendarScreenProps): ReactElement {
  const router = useRouter();
  const timeZone = getDeviceTimeZone();
  const today = formatLocalReviewDate(new Date(), timeZone);
  const [selectedDate, setSelectedDate] = useState(props.initialLocalDate ?? today);
  const initialParts = parseLocalDate(selectedDate);
  const [year, setYear] = useState(initialParts.year);
  const [month, setMonth] = useState(initialParts.month);

  const heatByDate = useMemo(() => buildMonthHeatMap(year, month), [year, month]);
  const dayDetail = useMemo(() => getLearningCalendarDayDetail(selectedDate), [selectedDate]);

  const goBack = useCallback((): void => {
    router.back();
  }, [router]);

  const shiftMonth = useCallback(
    (delta: number) => {
      const next = new Date(year, month - 1 + delta, 1);
      setYear(next.getFullYear());
      setMonth(next.getMonth() + 1);
    },
    [month, year],
  );

  return (
    <ScreenScaffold safeAreaEdges={['top', 'left', 'right', 'bottom']}>
      <AppHeader
        centerContent={<Text style={styles.headerTitle}>学习日历</Text>}
        onBackPress={goBack}
        variant="back"
      />
      <View style={styles.body}>
        <LearningCalendarMonth
          heatByDate={heatByDate}
          month={month}
          onNextMonth={() => shiftMonth(1)}
          onPrevMonth={() => shiftMonth(-1)}
          onSelectDate={(localDate) => {
            setSelectedDate(localDate);
            const parts = parseLocalDate(localDate);
            setYear(parts.year);
            setMonth(parts.month);
          }}
          selectedDate={selectedDate}
          year={year}
        />
        <LearningCalendarDayDetailPanel detail={dayDetail} />
      </View>
    </ScreenScaffold>
  );
}

function parseLocalDate(localDate: string): { year: number; month: number; day: number } {
  const [year, month, day] = localDate.split('-').map(Number);
  return { year: year ?? 2026, month: month ?? 1, day: day ?? 1 };
}

function buildMonthHeatMap(year: number, month: number): Map<string, HeatLevel> {
  const monthStr = String(month).padStart(2, '0');
  const startDate = `${String(year)}-${monthStr}-01`;
  const endDate = `${String(year)}-${monthStr}-${String(new Date(year, month, 0).getDate()).padStart(2, '0')}`;
  const events = listEventsInDateRange(startDate, endDate);
  const byDate = new Map<string, string[]>();

  for (const event of events) {
    const list = byDate.get(event.localDate) ?? [];
    list.push(event.eventType);
    byDate.set(event.localDate, list);
  }

  const heatMap = new Map<string, HeatLevel>();
  for (const [localDate, eventTypes] of byDate) {
    heatMap.set(localDate, calculateHeatLevel(eventTypes));
  }
  return heatMap;
}

const styles = StyleSheet.create({
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
  },
  body: {
    flex: 1,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
});
