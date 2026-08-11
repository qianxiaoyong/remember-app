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
  getLearningStateByKnowledgeId: vi.fn(),
  upsertReviewPoolState: vi.fn(),
}));

vi.mock('../data/repositories/study-session-repository', () => ({
  listPendingQueueItemsForSession: vi.fn(),
  listQueueItemsForSession: vi.fn(() => []),
  markQueueItemDone: vi.fn(),
  touchSessionUpdatedAt: vi.fn(),
  updateSessionStatus: vi.fn(),
}));

vi.mock('../data/repositories/review-daily-stats-repository', () => ({
  incrementReviewCompletedCount: vi.fn(),
}));

vi.mock('../data/repositories/sync-outbox-repository', () => ({
  insertSyncOutboxItem: vi.fn(),
}));

vi.mock('../data/sync/build-sync-outbox-payload', () => ({
  buildSyncOutboxPayload: vi.fn(() => '{"outcome":"passed"}'),
}));

vi.mock('../data/create-record-id', () => ({
  createRecordId: vi.fn(() => 'sync-test'),
}));

vi.mock('../lib/get-device-time-zone', () => ({
  getDeviceTimeZone: vi.fn(() => 'Asia/Shanghai'),
}));

vi.mock('./sync/upload-pending-sync-outbox', () => ({
  uploadPendingSyncOutbox: vi.fn(),
}));

vi.mock('./write-activity-event-from-review', () => ({
  writeReviewOutcomeActivityEvent: vi.fn(),
}));

import { getLearningStateByKnowledgeId } from '../data/repositories/learning-state-repository';
import { incrementReviewCompletedCount } from '../data/repositories/review-daily-stats-repository';
import { upsertReviewPoolState } from '../data/repositories/learning-state-repository';
import { listPendingQueueItemsForSession } from '../data/repositories/study-session-repository';
import { findActiveReviewSession } from './find-active-review-session';
import { confirmReviewOutcome } from './confirm-review-outcome';

const now = new Date('2026-08-06T15:00:00+08:00');

describe('confirmReviewOutcome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(findActiveReviewSession).mockReturnValue({
      sessionId: 'session-1',
      packId: '__review_pool__',
      status: 'active',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    vi.mocked(listPendingQueueItemsForSession).mockReturnValue([
      {
        itemId: 'queue-1',
        sessionId: 'session-1',
        knowledgeId: 'remember-test-pack:en:word:hello',
        itemType: 'review',
        sortOrder: 1,
        status: 'pending',
      },
    ]);
    vi.mocked(getLearningStateByKnowledgeId).mockReturnValue({
      knowledgeId: 'remember-test-pack:en:word:hello',
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
    });
  });

  it('passed 升档并递增今日复习完成数', () => {
    confirmReviewOutcome({
      sessionId: 'session-1',
      knowledgeId: 'remember-test-pack:en:word:hello',
      outcome: 'passed',
      now,
    });

    const savedRow = vi.mocked(upsertReviewPoolState).mock.calls[0]?.[0];
    expect(savedRow?.boxLevel).toBe(1);
    expect(savedRow?.dueAt).toBe('2026-08-06T16:00:00.000Z');
    expect(incrementReviewCompletedCount).toHaveBeenCalledOnce();
  });

  it('failed 保持或降档且 due 为明日', () => {
    confirmReviewOutcome({
      sessionId: 'session-1',
      knowledgeId: 'remember-test-pack:en:word:hello',
      outcome: 'failed',
      now,
    });

    const savedRow = vi.mocked(upsertReviewPoolState).mock.calls[0]?.[0];
    expect(savedRow?.boxLevel).toBe(0);
    expect(savedRow?.dueAt).toBe('2026-08-06T16:00:00.000Z');
  });
});
