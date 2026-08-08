import { describe, expect, it } from 'vitest';
import {
  applyBoxReview,
  createInitialReviewPoolState,
  formatBoxInterval,
  previewBoxReviewOutcomes,
} from './review-box-scheduler';

describe('applyBoxReview', () => {
  it('passed from level 0 sets due +1 local day', () => {
    const now = new Date('2026-08-06T15:00:00+08:00');
    const next = applyBoxReview({
      previous: { inReviewPool: true, boxLevel: 0, dueAt: now.toISOString() },
      outcome: 'passed',
      now,
      timeZone: 'Asia/Shanghai',
    });
    expect(next.boxLevel).toBe(1);
    expect(next.dueAt).toBe('2026-08-06T16:00:00.000Z');
  });

  it('failed keeps level 0 and due tomorrow', () => {
    const now = new Date('2026-08-06T15:00:00+08:00');
    const next = applyBoxReview({
      previous: { inReviewPool: true, boxLevel: 0, dueAt: now.toISOString() },
      outcome: 'failed',
      now,
      timeZone: 'Asia/Shanghai',
    });
    expect(next.boxLevel).toBe(0);
    expect(next.dueAt).toBe('2026-08-06T16:00:00.000Z');
  });

  it('passed from level 1 sets due +3 local days', () => {
    const now = new Date('2026-08-06T15:00:00+08:00');
    const next = applyBoxReview({
      previous: { inReviewPool: true, boxLevel: 1, dueAt: now.toISOString() },
      outcome: 'passed',
      now,
      timeZone: 'Asia/Shanghai',
    });
    expect(next.boxLevel).toBe(2);
    expect(next.dueAt).toBe('2026-08-08T16:00:00.000Z');
  });

  it('failed from level 2 drops to level 1 and due tomorrow', () => {
    const now = new Date('2026-08-06T15:00:00+08:00');
    const next = applyBoxReview({
      previous: { inReviewPool: true, boxLevel: 2, dueAt: now.toISOString() },
      outcome: 'failed',
      now,
      timeZone: 'Asia/Shanghai',
    });
    expect(next.boxLevel).toBe(1);
    expect(next.dueAt).toBe('2026-08-06T16:00:00.000Z');
  });

  it('passed at level 3 first time schedules +21 days', () => {
    const now = new Date('2026-08-06T15:00:00+08:00');
    const next = applyBoxReview({
      previous: {
        inReviewPool: true,
        boxLevel: 3,
        dueAt: now.toISOString(),
        consecutiveLevel3Passes: 0,
      },
      outcome: 'passed',
      now,
      timeZone: 'Asia/Shanghai',
    });
    expect(next.boxLevel).toBe(3);
    expect(next.consecutiveLevel3Passes).toBe(1);
    expect(next.dueAt).toBe('2026-08-26T16:00:00.000Z');
  });

  it('passed at level 3 second time schedules +45 days', () => {
    const now = new Date('2026-08-06T15:00:00+08:00');
    const next = applyBoxReview({
      previous: {
        inReviewPool: true,
        boxLevel: 3,
        dueAt: now.toISOString(),
        consecutiveLevel3Passes: 1,
      },
      outcome: 'passed',
      now,
      timeZone: 'Asia/Shanghai',
    });
    expect(next.consecutiveLevel3Passes).toBe(2);
    expect(next.dueAt).toBe('2026-09-19T16:00:00.000Z');
  });

  it('passed at level 3 third time schedules +90 days', () => {
    const now = new Date('2026-08-06T15:00:00+08:00');
    const next = applyBoxReview({
      previous: {
        inReviewPool: true,
        boxLevel: 3,
        dueAt: now.toISOString(),
        consecutiveLevel3Passes: 2,
      },
      outcome: 'passed',
      now,
      timeZone: 'Asia/Shanghai',
    });
    expect(next.consecutiveLevel3Passes).toBe(3);
    expect(next.dueAt).toBe('2026-11-03T16:00:00.000Z');
  });
});

describe('createInitialReviewPoolState', () => {
  it('sets box level 0 and due today anchor', () => {
    const now = new Date('2026-08-06T15:00:00+08:00');
    const state = createInitialReviewPoolState({ now, timeZone: 'Asia/Shanghai' });
    expect(state).toEqual({
      inReviewPool: true,
      boxLevel: 0,
      dueAt: '2026-08-05T16:00:00.000Z',
      consecutiveLevel3Passes: 0,
    });
  });
});

describe('formatBoxInterval', () => {
  it('returns Chinese interval labels', () => {
    expect(formatBoxInterval(0, 0)).toBe('1 天后');
    expect(formatBoxInterval(1, 0)).toBe('3 天后');
    expect(formatBoxInterval(2, 0)).toBe('7 天后');
    expect(formatBoxInterval(3, 0)).toBe('21 天后');
    expect(formatBoxInterval(3, 1)).toBe('45 天后');
    expect(formatBoxInterval(3, 2)).toBe('90 天后');
  });
});

describe('previewBoxReviewOutcomes', () => {
  it('returns due labels for passed and failed outcomes', () => {
    const now = new Date('2026-08-06T15:00:00+08:00');
    const labels = previewBoxReviewOutcomes(
      {
        inReviewPool: true,
        boxLevel: 1,
        dueAt: now.toISOString(),
        consecutiveLevel3Passes: 0,
      },
      now,
      'Asia/Shanghai',
    );
    expect(labels.passed).toBe('3天后');
    expect(labels.failed).toBe('明天');
  });
});
