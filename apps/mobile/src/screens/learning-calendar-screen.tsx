import type { ReactElement } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { calculateHeatLevel } from '@remember/domain';
import type { HeatLevel } from '@remember/domain';
import { formatLocalReviewDate } from '@remember/domain';
import { AppHeader } from '../components/shell/app-header';
import { ScreenScaffold } from '../components/shell/screen-scaffold';
import { TabPageTopSpacer } from '../components/shell/tab-page-top-spacer';
import { LearningCalendarDayDetailPanel } from '../components/calendar/learning-calendar-day-detail';
import { buildMonthGridCells } from '../components/calendar/learning-calendar-month-grid';
import { LearningCalendarMonth } from '../components/calendar/learning-calendar-month';
import { SurfaceCard } from '../components/ui/surface-card';
import { listEventsInDateRange } from '../data/repositories/learning-activity-event-repository';
import { getLearningCalendarDayDetail } from '../use-cases/get-learning-calendar-day-detail';
import { getDeviceTimeZone } from '../lib/get-device-time-zone';
import {
  flushLearningCalendarNeedsRefresh,
  subscribeLearningCalendarRefresh,
} from '../shell/learning-calendar-refresh-signal';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface LearningCalendarScreenProps {
  initialLocalDate?: string;
  variant?: 'tab' | 'stack';
}

export function LearningCalendarScreen(props: LearningCalendarScreenProps): ReactElement {
  const variant = props.variant ?? 'stack';
  const router = useRouter();
  const timeZone = getDeviceTimeZone();
  const today = formatLocalReviewDate(new Date(), timeZone);
  const [selectedDate, setSelectedDate] = useState(props.initialLocalDate ?? today);
  const initialParts = parseLocalDate(selectedDate);
  const [year, setYear] = useState(initialParts.year);
  const [month, setMonth] = useState(initialParts.month);
  const [refreshKey, setRefreshKey] = useState(0);
  const bumpRefresh = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  useEffect(() => subscribeLearningCalendarRefresh(bumpRefresh), [bumpRefresh]);

  useFocusEffect(
    useCallback(() => {
      flushLearningCalendarNeedsRefresh();
    }, []),
  );

  const heatByDate = useMemo(() => buildMonthHeatMap(year, month), [year, month, refreshKey]);
  const dayDetail = useMemo(
    () => getLearningCalendarDayDetail(selectedDate),
    [selectedDate, refreshKey],
  );

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

  const headerTitle = variant === 'tab' ? '记录' : '学习日历';

  return (
    <ScreenScaffold
      safeAreaEdges={variant === 'tab' ? ['left', 'right'] : ['top', 'left', 'right', 'bottom']}
      withTabBarPadding={variant === 'tab'}
    >
      {variant === 'tab' ? <TabPageTopSpacer /> : null}
      {variant === 'stack' ? (
        <AppHeader
          centerContent={<Text style={styles.headerTitle}>{headerTitle}</Text>}
          onBackPress={goBack}
          variant="back"
        />
      ) : null}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <SurfaceCard contentPadding={spacing.lg}>
          <LearningCalendarMonth
            heatByDate={heatByDate}
            month={month}
            onNextMonth={() => {
              shiftMonth(1);
            }}
            onPrevMonth={() => {
              shiftMonth(-1);
            }}
            onSelectDate={(localDate) => {
              setSelectedDate(localDate);
              const parts = parseLocalDate(localDate);
              setYear(parts.year);
              setMonth(parts.month);
            }}
            selectedDate={selectedDate}
            year={year}
          />
        </SurfaceCard>
        <LearningCalendarDayDetailPanel detail={dayDetail} />
      </ScrollView>
    </ScreenScaffold>
  );
}

function parseLocalDate(localDate: string): { year: number; month: number; day: number } {
  const [year, month, day] = localDate.split('-').map(Number);
  return { year: year ?? 2026, month: month ?? 1, day: day ?? 1 };
}

function buildMonthHeatMap(year: number, month: number): Map<string, HeatLevel> {
  const cells = buildMonthGridCells(year, month);
  const firstCell = cells[0];
  const lastCell = cells[cells.length - 1];
  if (!firstCell || !lastCell) {
    return new Map();
  }

  const events = listEventsInDateRange(firstCell.localDate, lastCell.localDate);
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
  },
});
