import { describe, expect, it, vi } from 'vitest';

vi.mock('../user-db/open-user-database', () => ({
  openUserDatabase: vi.fn(),
}));

import {
  getReviewDailyStats,
  incrementJoinedPoolCount,
  incrementReviewCompletedCount,
} from './review-daily-stats-repository';

describe('review-daily-stats-repository', () => {
  it('缺失日期返回零计数', () => {
    const db = {
      getFirstSync: vi.fn(() => null),
      runSync: vi.fn(),
    };

    expect(getReviewDailyStats('2026-08-06', db as never)).toEqual({
      localDate: '2026-08-06',
      joinedPoolCount: 0,
      reviewCompletedCount: 0,
      updatedAt: new Date(0).toISOString(),
    });
  });

  it('incrementJoinedPoolCount 递增 joinedPoolCount', () => {
    const runCalls: string[] = [];
    const db = {
      getFirstSync: vi.fn(() => ({
        localDate: '2026-08-06',
        joinedPoolCount: 1,
        reviewCompletedCount: 0,
        updatedAt: '2026-08-06T00:00:00.000Z',
      })),
      runSync: vi.fn((sql: string) => {
        runCalls.push(sql);
      }),
    };

    incrementJoinedPoolCount('2026-08-06', '2026-08-06T12:00:00.000Z', db as never);

    expect(runCalls.some((sql) => sql.includes('joinedPoolCount = joinedPoolCount + 1'))).toBe(
      true,
    );
  });

  it('incrementReviewCompletedCount 递增 reviewCompletedCount', () => {
    const runCalls: string[] = [];
    const db = {
      getFirstSync: vi.fn(() => null),
      runSync: vi.fn((sql: string) => {
        runCalls.push(sql);
      }),
    };

    incrementReviewCompletedCount('2026-08-06', '2026-08-06T12:00:00.000Z', db as never);

    expect(
      runCalls.some((sql) => sql.includes('reviewCompletedCount = reviewCompletedCount + 1')),
    ).toBe(true);
  });
});
