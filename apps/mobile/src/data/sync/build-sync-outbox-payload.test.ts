import { describe, expect, it } from 'vitest';
import { buildSyncOutboxPayload } from './build-sync-outbox-payload';

describe('buildSyncOutboxPayload', () => {
  it('包含复习池 v2 字段', () => {
    const payload = JSON.parse(
      buildSyncOutboxPayload({
        row: {
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
        },
        outcome: 'passed',
      }),
    ) as Record<string, unknown>;

    expect(payload.inReviewPool).toBe(true);
    expect(payload.boxLevel).toBe(1);
    expect(payload.firstAddedFromPackId).toBe('remember-test-pack');
    expect(payload.outcome).toBe('passed');
    expect(payload.legacyEasiness).toBe(2.5);
  });
});
