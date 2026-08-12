import { describe, expect, it, vi } from 'vitest';

vi.mock('../data/repositories/learning-state-repository', () => ({
  countDueReviewPoolItems: vi.fn(() => 12),
  listDueReviewPoolItems: vi.fn(() => [
    { knowledgeId: 'a:en:word:one', packId: 'a', firstAddedFromPackId: 'a' },
    { knowledgeId: 'b:en:word:two', packId: 'b', firstAddedFromPackId: 'b' },
  ]),
}));

vi.mock('../data/repositories/installed-pack-repository', () => ({
  listInstalledPacks: vi.fn(() => [{ packId: 'a' }]),
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

vi.mock('./resolve-review-card-context', () => ({
  resolveReviewCardContext: vi.fn((knowledgeId: string) =>
    knowledgeId.startsWith('a:')
      ? { cardDetail: {}, sourcePackId: 'a', sourcePackDisplayName: 'A' }
      : null,
  ),
}));

import { getReviewTabSummary } from './get-review-tab-summary';

describe('getReviewTabSummary', () => {
  it('汇总到期数、可复习到期数、限额与今日进度', () => {
    const summary = getReviewTabSummary(new Date('2026-08-06T15:00:00+08:00'));
    expect(summary).toEqual({
      dueTotal: 12,
      reviewableDueTotal: 1,
      dailyReviewLimit: 20,
      todayReviewCompleted: 8,
      remainingQuota: 12,
      joinedPoolCountToday: 3,
    });
  });
});
