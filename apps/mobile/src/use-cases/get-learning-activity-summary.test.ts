import { describe, expect, it, vi } from 'vitest';

vi.mock('../lib/get-device-time-zone', () => ({
  getDeviceTimeZone: vi.fn(() => 'Asia/Shanghai'),
}));

vi.mock('../data/repositories/learning-activity-event-repository', () => ({
  countDistinctActiveDays: vi.fn(() => 3),
  countEventsByTypeInRange: vi.fn((input: { eventType: string }) => {
    if (input.eventType === 'vocabulary_first_reveal') {
      return 5;
    }
    if (input.eventType === 'review_outcome') {
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

import {
  buildHeatGridMonthLabels,
  getLearningActivitySummary,
} from './get-learning-activity-summary';

describe('buildHeatGridMonthLabels', () => {
  it('places first, middle and last months on fixed columns', () => {
    expect(buildHeatGridMonthLabels('2026-08-31')).toEqual([
      { key: '2026-06', label: '6月', colIndex: 2 },
      { key: '2026-07', label: '7月', colIndex: 5.5 },
      { key: '2026-08', label: '8月', colIndex: 9 },
    ]);
  });
});

describe('getLearningActivitySummary', () => {
  it('returns 90-day counts and heat grid anchored to month end', () => {
    const now = new Date('2026-08-09T15:00:00+08:00');
    const summary = getLearningActivitySummary(now);

    expect(summary.activeDays).toBe(3);
    expect(summary.firstRevealCount).toBe(5);
    expect(summary.reviewOutcomeCount).toBe(2);
    expect(summary.heatGrid).toHaveLength(7);
    expect(summary.heatGrid[0]).toHaveLength(12);

    const bottomRight = summary.heatGrid[6]?.[11];
    expect(bottomRight?.localDate).toBe('2026-08-31');

    const aug30 = summary.heatGrid[5]?.[11];
    expect(aug30?.localDate).toBe('2026-08-30');

    const todayCell = summary.heatGrid.flat().find((cell) => cell.localDate === '2026-08-09');
    expect(todayCell?.isToday).toBe(true);
    expect(todayCell?.level).toBe(2);

    expect(summary.monthLabels).toEqual([
      { key: '2026-06', label: '6月', colIndex: 2 },
      { key: '2026-07', label: '7月', colIndex: 5.5 },
      { key: '2026-08', label: '8月', colIndex: 9 },
    ]);
  });
});
