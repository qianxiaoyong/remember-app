import { describe, expect, it } from 'vitest';
import { buildSyncOutboxPayload } from './build-sync-outbox-payload';

describe('buildSyncOutboxPayload', () => {
  it('包含 SM-2 全字段', () => {
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
        },
        rating: 'good',
      }),
    ) as Record<string, unknown>;

    expect(payload.easiness).toBe(2.5);
    expect(payload.intervalDays).toBe(1);
    expect(payload.repetitions).toBe(1);
    expect(payload.rating).toBe('good');
  });
});
