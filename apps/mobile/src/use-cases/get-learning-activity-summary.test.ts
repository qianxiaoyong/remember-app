import { describe, expect, it, vi } from 'vitest';

vi.mock('../lib/get-device-time-zone', () => ({
  getDeviceTimeZone: vi.fn(() => 'Asia/Shanghai'),
}));

vi.mock('../data/repositories/learning-activity-event-repository', () => ({
  countDistinctActiveDays: vi.fn(() => 3),
  countEventsByTypeInRange: vi.fn((eventType: string) => {
    if (eventType === 'vocabulary_first_reveal') {
      return 5;
    }
    if (eventType === 'review_outcome') {
      return 2;
    }
    return 0;
  }),
  listEventsInDateRange: vi.fn(() => [
    { localDate: '2026-08-09', eventType: 'vocabulary_first_reveal' },
    { localDate: '2026-08-09', eventType: 'review_outcome' },
    { localDate: '2026-08-08', eventType: 'vocabulary_join_review' },
  ]),
}));

import { getLearningActivitySummary } from './get-learning-activity-summary';

describe('getLearningActivitySummary', () => {
  it('returns 90-day counts and 7x12 heat grid', () => {
    const now = new Date('2026-08-09T15:00:00+08:00');
    const summary = getLearningActivitySummary(now);

    expect(summary.activeDays).toBe(3);
    expect(summary.firstRevealCount).toBe(5);
    expect(summary.reviewOutcomeCount).toBe(2);
    expect(summary.heatGrid).toHaveLength(7);
    expect(summary.heatGrid[0]).toHaveLength(12);

    const todayCell = summary.heatGrid.flat().find((cell) => cell.localDate === '2026-08-09');
    expect(todayCell?.isToday).toBe(true);
    expect(todayCell?.level).toBe(2);
  });
});
