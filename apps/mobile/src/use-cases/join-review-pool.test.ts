import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../data/user-db/open-user-database', () => ({
  openUserDatabase: vi.fn(() => ({
    execSync: vi.fn(),
  })),
}));

vi.mock('../data/repositories/learning-state-repository', () => ({
  getLearningStateByKnowledgeId: vi.fn(),
  upsertReviewPoolState: vi.fn(),
}));

vi.mock('../data/repositories/review-daily-stats-repository', () => ({
  incrementJoinedPoolCount: vi.fn(),
}));

vi.mock('../data/repositories/sync-outbox-repository', () => ({
  insertSyncOutboxItem: vi.fn(),
}));

vi.mock('../data/sync/build-sync-outbox-payload', () => ({
  buildSyncOutboxPayload: vi.fn(() => '{"inReviewPool":true}'),
}));

vi.mock('../data/create-record-id', () => ({
  createRecordId: vi.fn(() => 'sync-test'),
}));

vi.mock('../lib/get-device-time-zone', () => ({
  getDeviceTimeZone: vi.fn(() => 'Asia/Shanghai'),
}));

vi.mock('./resolve-content-pack-id', () => ({
  resolveContentPackId: vi.fn((packId: string) => packId),
}));

vi.mock('./counts-as-reviewable-due-badge-item', () => ({
  countsAsReviewableDueBadgeItem: vi.fn(() => true),
}));

vi.mock('../shell/review-pool-changed-signal', () => ({
  markReviewPoolChanged: vi.fn(),
}));

import { getLearningStateByKnowledgeId } from '../data/repositories/learning-state-repository';
import { incrementJoinedPoolCount } from '../data/repositories/review-daily-stats-repository';
import { insertSyncOutboxItem } from '../data/repositories/sync-outbox-repository';
import { upsertReviewPoolState } from '../data/repositories/learning-state-repository';
import { markReviewPoolChanged } from '../shell/review-pool-changed-signal';
import { joinReviewPool } from './join-review-pool';

const now = new Date('2026-08-06T15:00:00+08:00');

describe('joinReviewPool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('首次入池写入状态、统计与 outbox', () => {
    vi.mocked(getLearningStateByKnowledgeId).mockReturnValue(null);

    const result = joinReviewPool({
      knowledgeId: 'remember-test-pack:en:word:hello',
      catalogPackId: 'remember-test-pack',
      now,
    });

    expect(result).toEqual({ status: 'created' });
    expect(upsertReviewPoolState).toHaveBeenCalledOnce();
    expect(incrementJoinedPoolCount).toHaveBeenCalledOnce();
    expect(insertSyncOutboxItem).toHaveBeenCalledOnce();
    expect(markReviewPoolChanged).toHaveBeenCalledWith('join_due');
  });

  it('已在复习池时返回 already_in_pool 且不改数据', () => {
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
      boxLevel: 1,
      firstAddedFromPackId: 'remember-test-pack',
      lastSeenInPackId: null,
      consecutiveLevel3Passes: 0,
    });

    const result = joinReviewPool({
      knowledgeId: 'remember-test-pack:en:word:hello',
      catalogPackId: 'remember-test-pack',
      now,
    });

    expect(result).toEqual({ status: 'already_in_pool' });
    expect(upsertReviewPoolState).not.toHaveBeenCalled();
    expect(incrementJoinedPoolCount).not.toHaveBeenCalled();
    expect(markReviewPoolChanged).not.toHaveBeenCalled();
  });
});
