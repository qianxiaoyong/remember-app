import { describe, expect, it, vi } from 'vitest';

vi.mock('../data/repositories/learning-state-repository', () => ({
  countDueReviewPoolItems: vi.fn(() => 12),
}));

vi.mock('../data/repositories/review-daily-stats-repository', () => ({
  getReviewDailyStats: vi.fn(() => ({
    localDate: '2026-08-06',
    joinedPoolCount: 3,
    reviewCompletedCount: 8,
    updatedAt: '2026-08-06T00:00:00.000Z',
  })),
}));

vi.mock('../data/repositories/user-preferences-repository', () => ({
  getDailyReviewLimit: vi.fn(() => 20),
}));

vi.mock('../lib/get-device-time-zone', () => ({
  getDeviceTimeZone: vi.fn(() => 'Asia/Shanghai'),
}));

import { getReviewTabSummary } from './get-review-tab-summary';

describe('getReviewTabSummary', () => {
  it('汇总到期数、限额与今日进度', () => {
    const summary = getReviewTabSummary(new Date('2026-08-06T15:00:00+08:00'));
    expect(summary).toEqual({
      dueTotal: 12,
      dailyReviewLimit: 20,
      todayReviewCompleted: 8,
      remainingQuota: 12,
      joinedPoolCountToday: 3,
    });
  });
});
