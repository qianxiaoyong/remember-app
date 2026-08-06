import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../data/user-db/open-user-database', () => ({
  openUserDatabase: vi.fn(() => ({
    execSync: vi.fn(),
  })),
}));

vi.mock('./find-active-review-session', () => ({
  findActiveReviewSession: vi.fn(),
}));

vi.mock('../data/repositories/learning-state-repository', () => ({
  listDueReviewPoolItems: vi.fn(),
}));

vi.mock('../data/repositories/review-daily-stats-repository', () => ({
  getReviewDailyStats: vi.fn(() => ({
    localDate: '2026-08-06',
    joinedPoolCount: 0,
    reviewCompletedCount: 18,
    updatedAt: '2026-08-06T00:00:00.000Z',
  })),
}));

vi.mock('../data/repositories/user-preferences-repository', () => ({
  getDailyReviewLimit: vi.fn(() => 20),
}));

vi.mock('../data/repositories/study-session-repository', () => ({
  insertQueueItems: vi.fn(),
  insertStudySession: vi.fn(),
  listPendingQueueItemsForSession: vi.fn(),
  listQueueItemsForSession: vi.fn(),
  updateSessionStatus: vi.fn(),
}));

vi.mock('../data/create-record-id', () => ({
  createRecordId: vi
    .fn()
    .mockReturnValueOnce('session-1')
    .mockReturnValueOnce('queue-1')
    .mockReturnValueOnce('queue-2'),
}));

vi.mock('../lib/get-device-time-zone', () => ({
  getDeviceTimeZone: vi.fn(() => 'Asia/Shanghai'),
}));

vi.mock('./resolve-review-card-context', () => ({
  resolveReviewCardContext: vi.fn(() => ({ sourcePackId: 'remember-test-pack' })),
}));

import { listDueReviewPoolItems } from '../data/repositories/learning-state-repository';
import { insertQueueItems } from '../data/repositories/study-session-repository';
import { findActiveReviewSession } from './find-active-review-session';
import { resumeOrStartReviewSession } from './resume-or-start-review-session';

const now = new Date('2026-08-06T15:00:00+08:00');

describe('resumeOrStartReviewSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(findActiveReviewSession).mockReturnValue(null);
    vi.mocked(listDueReviewPoolItems).mockReturnValue(
      Array.from({ length: 10 }, (_, index) => ({
        knowledgeId: `word-${String(index + 1)}`,
        packId: 'remember-test-pack',
        easiness: 2.5,
        intervalDays: 0,
        repetitions: 0,
        dueAt: '2026-08-06T07:00:00.000Z',
        clientVersion: 1,
        updatedAt: '2026-08-06T07:00:00.000Z',
        inReviewPool: true,
        boxLevel: 0,
        firstAddedFromPackId: 'remember-test-pack',
        lastSeenInPackId: null,
        consecutiveLevel3Passes: 0,
      })),
    );
  });

  it('按剩余配额创建复习 session', () => {
    const session = resumeOrStartReviewSession(now);

    expect(session.sessionId).toBe('session-1');
    expect(session.totalCount).toBe(2);
    expect(insertQueueItems).toHaveBeenCalledOnce();
  });
});
