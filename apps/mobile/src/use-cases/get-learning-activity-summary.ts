import {
  addLocalReviewDays,
  calculateHeatLevel,
  formatLocalReviewDate,
  startOfLocalReviewDay,
  type HeatLevel,
} from '@remember/domain';
import { LearningActivityEventType } from '@remember/contracts';
import {
  countDistinctActiveDays,
  countEventsByTypeInRange,
  listEventsInDateRange,
} from '../data/repositories/learning-activity-event-repository';
import { getDeviceTimeZone } from '../lib/get-device-time-zone';

export interface HeatCell {
  localDate: string;
  level: HeatLevel;
  isToday: boolean;
  isInRange: boolean;
}

export interface HeatGridMonthLabel {
  key: string;
  label: string;
  /** 0-based 列中心，用于与第 N 个格子对齐 */
  colIndex: number;
}

export interface LearningActivitySummary {
  activeDays: number;
  firstRevealCount: number;
  reviewOutcomeCount: number;
  heatGrid: HeatCell[][];
  monthLabels: HeatGridMonthLabel[];
  rangeStartDate: string;
  rangeEndDate: string;
}

const HEAT_GRID_WEEKS = 12;
const HEAT_GRID_DAYS_PER_WEEK = 7;
const HEAT_GRID_CELL_COUNT = HEAT_GRID_WEEKS * HEAT_GRID_DAYS_PER_WEEK;
const HEAT_RANGE_DAYS = 90;

function daysInLocalMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function endOfLocalReviewMonth(now: Date, timeZone: string): Date {
  const todayLocal = formatLocalReviewDate(now, timeZone);
  const year = Number(todayLocal.slice(0, 4));
  const month = Number(todayLocal.slice(5, 7));
  const dayOfMonth = Number(todayLocal.slice(8, 10));
  const monthStart = addLocalReviewDays(
    startOfLocalReviewDay(now, timeZone),
    -(dayOfMonth - 1),
    timeZone,
  );
  return addLocalReviewDays(monthStart, daysInLocalMonth(year, month) - 1, timeZone);
}

export function buildHeatGridMonthLabels(monthEndDate: string): HeatGridMonthLabel[] {
  const endYear = Number(monthEndDate.slice(0, 4));
  const endMonth = Number(monthEndDate.slice(5, 7));

  const monthKeys: string[] = [];
  for (let offset = 2; offset >= 0; offset -= 1) {
    let month = endMonth - offset;
    let year = endYear;
    while (month <= 0) {
      month += 12;
      year -= 1;
    }
    monthKeys.push(`${String(year)}-${String(month).padStart(2, '0')}`);
  }

  const formatMonth = (monthKey: string): string => `${String(Number(monthKey.slice(5, 7)))}月`;
  const [first, middle, last] = monthKeys;
  if (!first || !middle || !last) {
    return [];
  }

  return [
    { key: first, label: formatMonth(first), colIndex: 2 },
    { key: middle, label: formatMonth(middle), colIndex: 5.5 },
    { key: last, label: formatMonth(last), colIndex: 9 },
  ];
}

function buildHeatGrid(input: {
  now: Date;
  timeZone: string;
  eventsByDate: Map<string, string[]>;
  rangeStartDate: string;
}): HeatCell[][] {
  const today = formatLocalReviewDate(input.now, input.timeZone);
  const monthEnd = endOfLocalReviewMonth(input.now, input.timeZone);

  const grid: HeatCell[][] = Array.from({ length: HEAT_GRID_DAYS_PER_WEEK }, () =>
    Array.from({ length: HEAT_GRID_WEEKS }, () => ({
      localDate: '',
      level: 0,
      isToday: false,
      isInRange: false,
    })),
  );

  for (let offset = 0; offset < HEAT_GRID_CELL_COUNT; offset += 1) {
    const col = HEAT_GRID_WEEKS - 1 - Math.floor(offset / HEAT_GRID_DAYS_PER_WEEK);
    const row = HEAT_GRID_DAYS_PER_WEEK - 1 - (offset % HEAT_GRID_DAYS_PER_WEEK);
    const cellDate = addLocalReviewDays(monthEnd, -offset, input.timeZone);
    const localDate = formatLocalReviewDate(cellDate, input.timeZone);
    const isInRange = localDate >= input.rangeStartDate && localDate <= today;
    const eventTypes = input.eventsByDate.get(localDate) ?? [];
    const cell: HeatCell = {
      localDate,
      level: isInRange ? calculateHeatLevel(eventTypes) : 0,
      isToday: localDate === today,
      isInRange,
    };
    const rowCells = grid[row];
    if (rowCells) {
      rowCells[col] = cell;
    }
  }

  return grid;
}

export function getLearningActivitySummary(now: Date = new Date()): LearningActivitySummary {
  const timeZone = getDeviceTimeZone();
  const todayStart = startOfLocalReviewDay(now, timeZone);
  const rangeEndDate = formatLocalReviewDate(now, timeZone);
  const rangeStartDate = formatLocalReviewDate(
    addLocalReviewDays(todayStart, -(HEAT_RANGE_DAYS - 1), timeZone),
    timeZone,
  );
  const monthEndDate = formatLocalReviewDate(endOfLocalReviewMonth(now, timeZone), timeZone);

  const events = listEventsInDateRange(rangeStartDate, rangeEndDate);
  const eventsByDate = new Map<string, string[]>();
  for (const event of events) {
    const list = eventsByDate.get(event.localDate) ?? [];
    list.push(event.eventType);
    eventsByDate.set(event.localDate, list);
  }

  return {
    activeDays: countDistinctActiveDays(rangeStartDate, rangeEndDate),
    firstRevealCount: countEventsByTypeInRange({
      eventType: LearningActivityEventType.VOCABULARY_FIRST_REVEAL,
      startDate: rangeStartDate,
      endDate: rangeEndDate,
    }),
    reviewOutcomeCount: countEventsByTypeInRange({
      eventType: LearningActivityEventType.REVIEW_OUTCOME,
      startDate: rangeStartDate,
      endDate: rangeEndDate,
    }),
    heatGrid: buildHeatGrid({ now, timeZone, eventsByDate, rangeStartDate }),
    monthLabels: buildHeatGridMonthLabels(monthEndDate),
    rangeStartDate,
    rangeEndDate,
  };
}
