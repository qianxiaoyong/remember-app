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

vi.mock('../shell/review-pool-changed-signal', () => ({
  markReviewPoolChanged: vi.fn(),
}));

import { getLearningStateByKnowledgeId } from '../data/repositories/learning-state-repository';
import { markReviewPoolChanged } from '../shell/review-pool-changed-signal';
import { incrementJoinedPoolCount } from '../data/repositories/review-daily-stats-repository';
import { upsertReviewPoolState } from '../data/repositories/learning-state-repository';
import { updateReviewPoolFromPack } from './update-review-pool-from-pack';

const now = new Date('2026-08-06T15:00:00+08:00');

describe('updateReviewPoolFromPack', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('更新复习时清零档位并切换来源包', () => {
    vi.mocked(getLearningStateByKnowledgeId).mockReturnValue({
      knowledgeId: 'remember-test-pack:en:word:hello',
      packId: 'remember-test-pack',
      easiness: 2.5,
      intervalDays: 7,
      repetitions: 3,
      dueAt: '2026-09-01T00:00:00.000Z',
      clientVersion: 4,
      updatedAt: '2026-08-01T00:00:00.000Z',
      inReviewPool: true,
      boxLevel: 3,
      firstAddedFromPackId: 'remember-test-pack',
      lastSeenInPackId: 'remember-test-pack',
      consecutiveLevel3Passes: 2,
    });

    updateReviewPoolFromPack({
      knowledgeId: 'remember-test-pack:en:word:hello',
      catalogPackId: 'story-test-pack',
      now,
    });

    expect(upsertReviewPoolState).toHaveBeenCalledOnce();
    const savedRow = vi.mocked(upsertReviewPoolState).mock.calls[0]?.[0];
    expect(savedRow?.boxLevel).toBe(0);
    expect(savedRow?.consecutiveLevel3Passes).toBe(0);
    expect(savedRow?.firstAddedFromPackId).toBe('story-test-pack');
    expect(savedRow?.dueAt).toBe('2026-08-05T16:00:00.000Z');
    expect(incrementJoinedPoolCount).not.toHaveBeenCalled();
    expect(markReviewPoolChanged).toHaveBeenCalledOnce();
  });
});
