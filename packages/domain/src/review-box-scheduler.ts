import {
  addLocalReviewDays,
  formatLocalIsoDateTime,
  nextLocalReviewDayAnchor,
  startOfLocalReviewDay,
} from './local-review-day.js';

export type ReviewOutcome = 'passed' | 'failed';
export type BoxLevel = 0 | 1 | 2 | 3;

export interface ReviewPoolState {
  inReviewPool: boolean;
  boxLevel: BoxLevel;
  dueAt: string;
  consecutiveLevel3Passes?: number;
}

export interface ApplyBoxReviewInput {
  previous: ReviewPoolState | null;
  outcome: ReviewOutcome;
  now: Date;
  timeZone?: string;
}

const DEFAULT_TIME_ZONE = 'UTC';

const PASSED_INTERVAL_DAYS: Record<Exclude<BoxLevel, 3>, number> = {
  0: 1,
  1: 3,
  2: 7,
};

function clampBoxLevel(value: number): BoxLevel {
  if (value <= 0) {
    return 0;
  }
  if (value >= 3) {
    return 3;
  }
  return value as BoxLevel;
}

function passedIntervalDays(previousLevel: BoxLevel, consecutiveLevel3Passes: number): number {
  if (previousLevel < 3) {
    return PASSED_INTERVAL_DAYS[previousLevel as 0 | 1 | 2];
  }

  if (consecutiveLevel3Passes === 0) {
    return 21;
  }
  if (consecutiveLevel3Passes === 1) {
    return 45;
  }
  return 90;
}

function dueAtAfterPassedDays(now: Date, days: number, timeZone: string): string {
  const reviewDayStart = startOfLocalReviewDay(now, timeZone);
  const dueDate = addLocalReviewDays(reviewDayStart, days, timeZone);
  return formatLocalIsoDateTime(dueDate, timeZone);
}

export function applyBoxReview(input: ApplyBoxReviewInput): ReviewPoolState {
  const timeZone = input.timeZone ?? DEFAULT_TIME_ZONE;
  const previous = input.previous ?? {
    inReviewPool: true,
    boxLevel: 0 as BoxLevel,
    dueAt: input.now.toISOString(),
    consecutiveLevel3Passes: 0,
  };

  if (input.outcome === 'failed') {
    return {
      inReviewPool: true,
      boxLevel: clampBoxLevel(previous.boxLevel - 1),
      dueAt: nextLocalReviewDayAnchor(input.now, timeZone),
      consecutiveLevel3Passes: previous.consecutiveLevel3Passes ?? 0,
    };
  }

  const previousLevel3Passes = previous.consecutiveLevel3Passes ?? 0;
  const nextBoxLevel = clampBoxLevel(previous.boxLevel + 1);
  const intervalDays = passedIntervalDays(previous.boxLevel, previousLevel3Passes);
  const nextLevel3Passes =
    previous.boxLevel === 3 ? previousLevel3Passes + 1 : previousLevel3Passes;

  return {
    inReviewPool: true,
    boxLevel: nextBoxLevel,
    dueAt: dueAtAfterPassedDays(input.now, intervalDays, timeZone),
    consecutiveLevel3Passes: nextLevel3Passes,
  };
}

export function formatBoxInterval(boxLevel: BoxLevel, consecutiveLevel3Passes: number): string {
  if (boxLevel < 3) {
    const days = PASSED_INTERVAL_DAYS[boxLevel as 0 | 1 | 2];
    if (days === 1) {
      return '1 天后';
    }
    return `${String(days)} 天后`;
  }

  const days = passedIntervalDays(3, consecutiveLevel3Passes);
  if (days === 21) {
    return '21 天后';
  }
  if (days === 45) {
    return '45 天后';
  }
  return '90 天后';
}

export function createInitialReviewPoolState(input: {
  now: Date;
  timeZone?: string;
}): ReviewPoolState {
  const timeZone = input.timeZone ?? DEFAULT_TIME_ZONE;

  return {
    inReviewPool: true,
    boxLevel: 0,
    dueAt: nextLocalReviewDayAnchor(input.now, timeZone),
    consecutiveLevel3Passes: 0,
  };
}
