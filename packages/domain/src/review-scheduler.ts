export type ReviewRating = 'forgot' | 'hard' | 'good';

export interface StudyState {
  easiness: number;
  intervalDays: number;
  repetitions: number;
  dueAt: string;
}

export interface ReviewSchedulerConfig {
  initialEasiness: number;
  minEasiness: number;
  relearnDelayMinutes: number;
  dailyNewCardQuota: number;
}

export const DEFAULT_REVIEW_SCHEDULER_CONFIG: ReviewSchedulerConfig = {
  initialEasiness: 2.5,
  minEasiness: 1.3,
  relearnDelayMinutes: 10,
  dailyNewCardQuota: 10,
};

const QUALITY_BY_RATING: Record<ReviewRating, number> = {
  forgot: 1,
  hard: 3,
  good: 5,
};

export interface ApplyReviewInput {
  previous: StudyState | null;
  rating: ReviewRating;
  now: Date;
  config?: ReviewSchedulerConfig;
}

export function applyReview(input: ApplyReviewInput): StudyState {
  const config = input.config ?? DEFAULT_REVIEW_SCHEDULER_CONFIG;
  const { previous, rating, now } = input;
  const quality = QUALITY_BY_RATING[rating];
  let easiness = previous?.easiness ?? config.initialEasiness;
  let intervalDays = previous?.intervalDays ?? 0;
  let repetitions = previous?.repetitions ?? 0;

  if (quality < 3) {
    return {
      easiness,
      intervalDays: 0,
      repetitions: 0,
      dueAt: addMinutes(now, config.relearnDelayMinutes).toISOString(),
    };
  }

  easiness = Math.max(
    config.minEasiness,
    easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  if (repetitions === 0) {
    intervalDays = 1;
  } else if (repetitions === 1) {
    intervalDays = rating === 'hard' ? 1 : 6;
  } else {
    const multiplier = rating === 'hard' ? 0.5 : 1;
    intervalDays = Math.max(1, Math.round(intervalDays * easiness * multiplier));
  }

  repetitions += 1;

  const dueAt =
    intervalDays === 0
      ? addMinutes(now, config.relearnDelayMinutes).toISOString()
      : addDays(now, intervalDays).toISOString();

  return {
    easiness,
    intervalDays,
    repetitions,
    dueAt,
  };
}

export function previewReviewIntervals(
  previous: StudyState | null,
  now: Date,
  config: ReviewSchedulerConfig = DEFAULT_REVIEW_SCHEDULER_CONFIG,
): Record<ReviewRating, string> {
  const nextStates = {
    forgot: applyReview({ previous, rating: 'forgot', now, config }),
    hard: applyReview({ previous, rating: 'hard', now, config }),
    good: applyReview({ previous, rating: 'good', now, config }),
  };

  return {
    forgot: formatReviewRatingLabel('forgot', nextStates.forgot, now),
    hard: formatReviewRatingLabel('hard', nextStates.hard, now),
    good: formatReviewRatingLabel('good', nextStates.good, now),
  };
}

export function formatReviewRatingLabel(
  rating: ReviewRating,
  nextState: StudyState,
  now: Date,
): string {
  const timeLabel = formatReviewInterval(nextState.dueAt, now);

  if (rating === 'forgot') {
    return `${timeLabel} · 重学`;
  }

  if (rating === 'hard') {
    if (nextState.intervalDays <= 1 && nextState.repetitions <= 1) {
      return `${timeLabel} · 巩固`;
    }
    return `${timeLabel} · 缩短间隔`;
  }

  return `${timeLabel} · 复习`;
}

export function formatReviewInterval(dueAtIso: string, now: Date): string {
  const dueAt = new Date(dueAtIso);
  const diffMs = dueAt.getTime() - now.getTime();
  if (diffMs <= 0) {
    return '现在';
  }

  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 60) {
    return `约${String(minutes)}分钟后`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `约${String(hours)}小时后`;
  }

  const days = Math.round(hours / 24);
  if (days === 1) {
    return '明天';
  }

  return `${String(days)}天后`;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}
