import { describe, expect, it } from 'vitest';
import {
  syncBatchUploadRequestSchema,
  syncBatchUploadResponseSchema,
  syncLearningStatePayloadSchema,
  syncSnapshotResponseSchema,
} from './index.js';

const samplePayload = {
  inReviewPool: true,
  boxLevel: 1,
  dueAt: '2026-08-06T16:00:00.000Z',
  firstAddedFromPackId: 'remember-test-pack',
  updatedAt: '2026-08-06T07:00:00.000Z',
};

describe('sync contracts', () => {
  it('SyncLearningStatePayload 含复习池全字段', () => {
    const payload = syncLearningStatePayloadSchema.parse({
      ...samplePayload,
      outcome: 'passed',
    });
    expect(payload.boxLevel).toBe(1);
  });

  it('batch upload round-trip', () => {
    const request = syncBatchUploadRequestSchema.parse({
      items: [
        {
          eventId: 'sync-1',
          knowledgeId: 'remember-test-pack:en:word:hello',
          clientVersion: 1,
          payload: samplePayload,
        },
      ],
    });
    expect(request.items).toHaveLength(1);

    const response = syncBatchUploadResponseSchema.parse({
      acceptedEventIds: ['sync-1'],
      rejected: [],
    });
    expect(response.acceptedEventIds[0]).toBe('sync-1');
  });

  it('payload 拒绝未知字段', () => {
    expect(() =>
      syncLearningStatePayloadSchema.parse({
        ...samplePayload,
        extra: true,
      }),
    ).toThrow();
  });

  it('snapshot round-trip', () => {
    const response = syncSnapshotResponseSchema.parse({
      items: [
        {
          knowledgeId: 'remember-test-pack:en:word:hello',
          ...samplePayload,
          clientVersion: 2,
        },
      ],
    });
    expect(response.items[0]?.clientVersion).toBe(2);
  });
});
