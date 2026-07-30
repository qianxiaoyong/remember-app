import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../data/api/api-client', () => {
  class ApiNetworkError extends Error {
    override name = 'ApiNetworkError';
  }

  class ApiRequestError extends Error {
    override name = 'ApiRequestError';

    constructor(
      readonly status: number,
      readonly code: string,
      message: string,
    ) {
      super(message);
    }
  }

  return { ApiNetworkError, ApiRequestError };
});

vi.mock('../../data/api/sync-api', () => ({
  uploadLearningStatesBatch: vi.fn(),
}));

vi.mock('../../data/session/session-store', () => ({
  readSessionToken: vi.fn(),
  writeLastSyncedAt: vi.fn(),
}));

vi.mock('../../data/repositories/learning-state-repository', () => ({
  getLearningState: vi.fn(),
}));

vi.mock('../../data/repositories/sync-outbox-repository', () => ({
  listSyncOutboxItems: vi.fn(),
  deleteSyncOutboxItems: vi.fn(),
  countSyncOutboxItems: vi.fn(),
}));

vi.mock('../../data/sync/resolve-sync-outbox-payload', () => ({
  resolveSyncOutboxPayload: vi.fn(() => ({
    easiness: 2.5,
    intervalDays: 1,
    repetitions: 1,
    dueAt: '2026-07-30T00:00:00.000Z',
    lastReviewedAt: '2026-07-30T00:00:00.000Z',
    status: 'learning',
  })),
}));

import { uploadLearningStatesBatch } from '../../data/api/sync-api';
import { getLearningState } from '../../data/repositories/learning-state-repository';
import {
  deleteSyncOutboxItems,
  listSyncOutboxItems,
} from '../../data/repositories/sync-outbox-repository';
import { readSessionToken, writeLastSyncedAt } from '../../data/session/session-store';
import { uploadPendingSyncOutbox } from './upload-pending-sync-outbox';

const outboxRow = {
  eventId: 'evt-1',
  knowledgeId: 'pack:test:en:word:hello',
  clientVersion: 3,
  payload: '{}',
  createdAt: '2026-07-30T00:00:00.000Z',
};

describe('uploadPendingSyncOutbox', () => {
  beforeEach(() => {
    vi.mocked(readSessionToken).mockReset();
    vi.mocked(uploadLearningStatesBatch).mockReset();
    vi.mocked(listSyncOutboxItems).mockReset();
    vi.mocked(deleteSyncOutboxItems).mockReset();
    vi.mocked(getLearningState).mockReset();
    vi.mocked(writeLastSyncedAt).mockReset();

    vi.mocked(readSessionToken).mockResolvedValue('token-1');
    vi.mocked(getLearningState).mockReturnValue({
      knowledgeId: outboxRow.knowledgeId,
      clientVersion: 3,
      easiness: 2.5,
      intervalDays: 1,
      repetitions: 1,
      dueAt: '2026-07-30T00:00:00.000Z',
      lastReviewedAt: '2026-07-30T00:00:00.000Z',
      status: 'learning',
      updatedAt: '2026-07-30T00:00:00.000Z',
    });
  });

  it('STALE_VERSION 后删除 outbox 且不再补写', async () => {
    vi.mocked(listSyncOutboxItems)
      .mockReturnValueOnce([outboxRow])
      .mockReturnValueOnce([outboxRow])
      .mockReturnValueOnce([])
      .mockReturnValue([]);

    vi.mocked(uploadLearningStatesBatch).mockResolvedValue({
      acceptedEventIds: ['evt-1'],
      rejected: [{ eventId: 'evt-1', reason: 'STALE_VERSION' }],
    });

    const result = await uploadPendingSyncOutbox();

    expect(deleteSyncOutboxItems).toHaveBeenCalledWith(['evt-1', 'evt-1']);
    expect(result.remainingCount).toBe(0);
    expect(writeLastSyncedAt).toHaveBeenCalled();
  });

  it('同一 knowledgeId 多条 outbox 时只保留最高 clientVersion', async () => {
    const duplicateRows = [
      {
        ...outboxRow,
        eventId: 'evt-old',
        clientVersion: 2,
        createdAt: '2026-07-29T00:00:00.000Z',
      },
      outboxRow,
    ];

    vi.mocked(listSyncOutboxItems)
      .mockReturnValueOnce(duplicateRows)
      .mockReturnValueOnce([outboxRow])
      .mockReturnValueOnce([])
      .mockReturnValue([]);

    vi.mocked(uploadLearningStatesBatch).mockResolvedValue({
      acceptedEventIds: ['evt-1'],
      rejected: [],
    });

    await uploadPendingSyncOutbox();

    expect(deleteSyncOutboxItems).toHaveBeenCalledWith(['evt-old']);
  });
});
