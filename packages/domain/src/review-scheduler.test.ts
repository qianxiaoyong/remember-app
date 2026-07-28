import { describe, expect, it } from 'vitest';
import {
  applyReview,
  DEFAULT_REVIEW_SCHEDULER_CONFIG,
  formatReviewInterval,
  previewReviewIntervals,
} from './review-scheduler';

describe('applyReview', () => {
  const now = new Date('2026-07-28T12:00:00.000Z');

  it('首次记得：间隔 1 天', () => {
    const next = applyReview({ previous: null, rating: 'good', now });
    expect(next.repetitions).toBe(1);
    expect(next.intervalDays).toBe(1);
    expect(next.dueAt).toBe('2026-07-29T12:00:00.000Z');
  });

  it('首次忘记：10 分钟后重学', () => {
    const next = applyReview({ previous: null, rating: 'forgot', now });
    expect(next.repetitions).toBe(0);
    expect(next.dueAt).toBe('2026-07-28T12:10:00.000Z');
  });

  it('连续记得：SM-2 间隔递增', () => {
    const first = applyReview({ previous: null, rating: 'good', now });
    const second = applyReview({ previous: first, rating: 'good', now });
    expect(second.repetitions).toBe(2);
    expect(second.intervalDays).toBe(6);

    const third = applyReview({ previous: second, rating: 'good', now });
    expect(third.repetitions).toBe(3);
    expect(third.intervalDays).toBeGreaterThan(6);
  });

  it('记得后忘记：重置 repetitions', () => {
    const learned = applyReview({ previous: null, rating: 'good', now });
    const relearn = applyReview({ previous: learned, rating: 'forgot', now });
    expect(relearn.repetitions).toBe(0);
    expect(relearn.intervalDays).toBe(0);
  });
});

describe('previewReviewIntervals', () => {
  it('三按钮均返回中文间隔文案', () => {
    const now = new Date('2026-07-28T12:00:00.000Z');
    const labels = previewReviewIntervals(null, now, DEFAULT_REVIEW_SCHEDULER_CONFIG);
    expect(labels.forgot).toBe('10分钟后');
    expect(labels.good).toBe('1天后');
    expect(labels.hard).toMatch(/分钟|小时|天/);
  });
});

describe('formatReviewInterval', () => {
  const now = new Date('2026-07-28T12:00:00.000Z');

  it('格式化分钟、小时、天', () => {
    expect(formatReviewInterval('2026-07-28T12:10:00.000Z', now)).toBe('10分钟后');
    expect(formatReviewInterval('2026-07-28T18:00:00.000Z', now)).toBe('6小时后');
    expect(formatReviewInterval('2026-07-30T12:00:00.000Z', now)).toBe('2天后');
  });
});
