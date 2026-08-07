import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../repositories/learning-state-repository', () => ({
  getLearningStateByKnowledgeId: vi.fn(),
}));

import {
  getLearningStateByKnowledgeId,
  type LearningStateRow,
} from '../repositories/learning-state-repository';
import { resolveSyncOutboxPayload } from './resolve-sync-outbox-payload';

const sampleState: LearningStateRow = {
  knowledgeId: 'remember-test-pack:en:word:hello',
  packId: 'remember-test-pack',
  easiness: 2.5,
  intervalDays: 1,
  repetitions: 1,
  dueAt: '2026-07-30T01:00:00.000Z',
  clientVersion: 1,
  updatedAt: '2026-07-30T00:00:00.000Z',
  inReviewPool: true,
  boxLevel: 1,
  firstAddedFromPackId: 'remember-test-pack',
  lastSeenInPackId: null,
  consecutiveLevel3Passes: 0,
};

describe('resolveSyncOutboxPayload', () => {
  beforeEach(() => {
    vi.mocked(getLearningStateByKnowledgeId).mockReset();
  });

  it('完整 payload 在缺少 learning_states 时仍可通过', () => {
    vi.mocked(getLearningStateByKnowledgeId).mockReturnValue(null);

    const row = {
      eventId: 'sync-full',
      knowledgeId: 'remember-test-pack:en:word:hello',
      clientVersion: 1,
      payload: JSON.stringify({
        inReviewPool: true,
        boxLevel: 1,
        dueAt: '2026-07-30T01:00:00.000Z',
        firstAddedFromPackId: 'remember-test-pack',
        updatedAt: '2026-07-30T00:00:00.000Z',
        outcome: 'passed',
      }),
      createdAt: '2026-07-30T00:00:00.000Z',
    };

    const payload = resolveSyncOutboxPayload(row);
    expect(payload?.boxLevel).toBe(1);
    expect(getLearningStateByKnowledgeId).toHaveBeenCalled();
  });

  it('优先使用 learning_states 的最新字段', () => {
    vi.mocked(getLearningStateByKnowledgeId).mockReturnValue({
      ...sampleState,
      boxLevel: 2,
      dueAt: '2026-07-30T02:00:00.000Z',
      updatedAt: '2026-07-30T01:00:00.000Z',
    });

    const row = {
      eventId: 'sync-stale-payload',
      knowledgeId: 'remember-test-pack:en:word:hello',
      clientVersion: 1,
      payload: JSON.stringify({
        inReviewPool: true,
        boxLevel: 1,
        dueAt: '2026-07-30T01:00:00.000Z',
        firstAddedFromPackId: 'remember-test-pack',
        updatedAt: '2026-07-30T00:00:00.000Z',
      }),
      createdAt: '2026-07-30T00:00:00.000Z',
    };

    const payload = resolveSyncOutboxPayload(row);
    expect(payload?.boxLevel).toBe(2);
    expect(payload?.dueAt).toBe('2026-07-30T02:00:00.000Z');
  });

  it('旧 outbox payload 可从 learning_states 补全', () => {
    vi.mocked(getLearningStateByKnowledgeId).mockReturnValue(sampleState);

    const row = {
      eventId: 'sync-old',
      knowledgeId: 'remember-test-pack:en:word:hello',
      clientVersion: 1,
      payload: JSON.stringify({
        outcome: 'passed',
      }),
      createdAt: '2026-07-30T00:00:00.000Z',
    };

    const payload = resolveSyncOutboxPayload(row);
    expect(payload?.inReviewPool).toBe(true);
    expect(payload?.outcome).toBe('passed');
  });

  it('无法补全时返回 null', () => {
    vi.mocked(getLearningStateByKnowledgeId).mockReturnValue(null);

    const row = {
      eventId: 'sync-orphan',
      knowledgeId: 'remember-test-pack:en:word:missing',
      clientVersion: 1,
      payload: JSON.stringify({
        dueAt: '2026-07-30T01:00:00.000Z',
      }),
      createdAt: '2026-07-30T00:00:00.000Z',
    };

    expect(resolveSyncOutboxPayload(row)).toBeNull();
  });
});
