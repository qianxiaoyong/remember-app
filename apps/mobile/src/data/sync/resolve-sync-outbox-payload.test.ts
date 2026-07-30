import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../repositories/learning-state-repository', () => ({
  getLearningState: vi.fn(),
}));

import { getLearningState } from '../repositories/learning-state-repository';
import { resolveSyncOutboxPayload } from './resolve-sync-outbox-payload';

describe('resolveSyncOutboxPayload', () => {
  beforeEach(() => {
    vi.mocked(getLearningState).mockReset();
  });

  it('完整 payload 在缺少 learning_states 时仍可通过', () => {
    vi.mocked(getLearningState).mockReturnValue(null);

    const row = {
      eventId: 'sync-full',
      knowledgeId: 'remember-test-pack:en:word:hello',
      clientVersion: 1,
      payload: JSON.stringify({
        packId: 'remember-test-pack',
        easiness: 2.5,
        intervalDays: 1,
        repetitions: 1,
        dueAt: '2026-07-30T01:00:00.000Z',
        updatedAt: '2026-07-30T00:00:00.000Z',
        rating: 'good',
      }),
      createdAt: '2026-07-30T00:00:00.000Z',
    };

    const payload = resolveSyncOutboxPayload(row);
    expect(payload?.easiness).toBe(2.5);
    expect(getLearningState).toHaveBeenCalled();
  });

  it('优先使用 learning_states 的最新字段', () => {
    vi.mocked(getLearningState).mockReturnValue({
      knowledgeId: 'remember-test-pack:en:word:hello',
      packId: 'remember-test-pack',
      easiness: 2.6,
      intervalDays: 2,
      repetitions: 2,
      dueAt: '2026-07-30T02:00:00.000Z',
      clientVersion: 3,
      updatedAt: '2026-07-30T01:00:00.000Z',
    });

    const row = {
      eventId: 'sync-stale-payload',
      knowledgeId: 'remember-test-pack:en:word:hello',
      clientVersion: 1,
      payload: JSON.stringify({
        packId: 'remember-test-pack',
        easiness: 2.5,
        intervalDays: 1,
        repetitions: 1,
        dueAt: '2026-07-30T01:00:00.000Z',
        updatedAt: '2026-07-30T00:00:00.000Z',
      }),
      createdAt: '2026-07-30T00:00:00.000Z',
    };

    const payload = resolveSyncOutboxPayload(row);
    expect(payload?.easiness).toBe(2.6);
    expect(payload?.intervalDays).toBe(2);
  });

  it('旧 outbox payload 可从 learning_states 补全', () => {
    vi.mocked(getLearningState).mockReturnValue({
      knowledgeId: 'remember-test-pack:en:word:hello',
      packId: 'remember-test-pack',
      easiness: 2.5,
      intervalDays: 1,
      repetitions: 1,
      dueAt: '2026-07-30T01:00:00.000Z',
      clientVersion: 1,
      updatedAt: '2026-07-30T00:00:00.000Z',
    });

    const row = {
      eventId: 'sync-old',
      knowledgeId: 'remember-test-pack:en:word:hello',
      clientVersion: 1,
      payload: JSON.stringify({
        knowledgeId: 'remember-test-pack:en:word:hello',
        packId: 'remember-test-pack',
        rating: 'good',
        clientVersion: 1,
        dueAt: '2026-07-30T01:00:00.000Z',
        updatedAt: '2026-07-30T00:00:00.000Z',
      }),
      createdAt: '2026-07-30T00:00:00.000Z',
    };

    const payload = resolveSyncOutboxPayload(row);
    expect(payload?.easiness).toBe(2.5);
    expect(payload?.intervalDays).toBe(1);
    expect(payload?.repetitions).toBe(1);
    expect(payload?.rating).toBe('good');
  });

  it('无法补全时返回 null', () => {
    vi.mocked(getLearningState).mockReturnValue(null);

    const row = {
      eventId: 'sync-orphan',
      knowledgeId: 'remember-test-pack:en:word:missing',
      clientVersion: 1,
      payload: JSON.stringify({
        packId: 'remember-test-pack',
        dueAt: '2026-07-30T01:00:00.000Z',
        updatedAt: '2026-07-30T00:00:00.000Z',
      }),
      createdAt: '2026-07-30T00:00:00.000Z',
    };

    expect(resolveSyncOutboxPayload(row)).toBeNull();
  });
});
