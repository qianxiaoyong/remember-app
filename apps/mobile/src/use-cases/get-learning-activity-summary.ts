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

export interface LearningActivitySummary {
  activeDays: number;
  firstRevealCount: number;
  reviewOutcomeCount: number;
  heatGrid: HeatCell[][];
  rangeStartDate: string;
  rangeEndDate: string;
}

const HEAT_GRID_WEEKS = 12;
const HEAT_GRID_DAYS_PER_WEEK = 7;

function getLocalWeekdayMondayZero(date: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' });
  const weekday = formatter.format(date);
  const map: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
  return map[weekday] ?? 0;
}

function buildHeatGrid(input: {
  now: Date;
  timeZone: string;
  eventsByDate: Map<string, string[]>;
}): HeatCell[][] {
  const today = formatLocalReviewDate(input.now, input.timeZone);
  const todayStart = startOfLocalReviewDay(input.now, input.timeZone);
  const weekday = getLocalWeekdayMondayZero(input.now, input.timeZone);
  const currentWeekMonday = addLocalReviewDays(todayStart, -weekday, input.timeZone);
  const gridStartMonday = addLocalReviewDays(
    currentWeekMonday,
    -(HEAT_GRID_WEEKS - 1) * HEAT_GRID_DAYS_PER_WEEK,
    input.timeZone,
  );
  const rangeStartDate = formatLocalReviewDate(
    addLocalReviewDays(todayStart, -89, input.timeZone),
    input.timeZone,
  );

  const grid: HeatCell[][] = [];
  for (let row = 0; row < HEAT_GRID_DAYS_PER_WEEK; row += 1) {
    const rowCells: HeatCell[] = [];
    for (let col = 0; col < HEAT_GRID_WEEKS; col += 1) {
      const cellDate = addLocalReviewDays(
        gridStartMonday,
        col * HEAT_GRID_DAYS_PER_WEEK + row,
        input.timeZone,
      );
      const localDate = formatLocalReviewDate(cellDate, input.timeZone);
      const isInRange = localDate >= rangeStartDate && localDate <= today;
      const eventTypes = input.eventsByDate.get(localDate) ?? [];
      rowCells.push({
        localDate,
        level: isInRange ? calculateHeatLevel(eventTypes) : 0,
        isToday: localDate === today,
        isInRange,
      });
    }
    grid.push(rowCells);
  }
  return grid;
}

export function getLearningActivitySummary(now: Date = new Date()): LearningActivitySummary {
  const timeZone = getDeviceTimeZone();
  const todayStart = startOfLocalReviewDay(now, timeZone);
  const rangeEndDate = formatLocalReviewDate(now, timeZone);
  const rangeStartDate = formatLocalReviewDate(
    addLocalReviewDays(todayStart, -89, timeZone),
    timeZone,
  );

  const events = listEventsInDateRange(rangeStartDate, rangeEndDate);
  const eventsByDate = new Map<string, string[]>();
  for (const event of events) {
    const list = eventsByDate.get(event.localDate) ?? [];
    list.push(event.eventType);
    eventsByDate.set(event.localDate, list);
  }

  return {
    activeDays: countDistinctActiveDays(rangeStartDate, rangeEndDate),
    firstRevealCount: countEventsByTypeInRange(
      LearningActivityEventType.VOCABULARY_FIRST_REVEAL,
      rangeStartDate,
      rangeEndDate,
    ),
    reviewOutcomeCount: countEventsByTypeInRange(
      LearningActivityEventType.REVIEW_OUTCOME,
      rangeStartDate,
      rangeEndDate,
    ),
    heatGrid: buildHeatGrid({ now, timeZone, eventsByDate }),
    rangeStartDate,
    rangeEndDate,
  };
}
