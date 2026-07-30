import { syncLearningStatePayloadSchema, type SyncLearningStatePayload } from '@remember/contracts';
import { getLearningState } from '../repositories/learning-state-repository';
import type { SyncOutboxRow } from '../repositories/sync-outbox-repository';

export function resolveSyncOutboxPayload(row: SyncOutboxRow): SyncLearningStatePayload | null {
  const state = getLearningState(row.knowledgeId);
  if (state) {
    const rating = readOptionalRating(row.payload);
    const parsedFromState = syncLearningStatePayloadSchema.safeParse({
      packId: state.packId,
      easiness: state.easiness,
      intervalDays: state.intervalDays,
      repetitions: state.repetitions,
      dueAt: state.dueAt,
      updatedAt: state.updatedAt,
      ...(rating ? { rating } : {}),
    });
    if (parsedFromState.success) {
      return parsedFromState.data;
    }
  }

  try {
    const raw = JSON.parse(row.payload) as Record<string, unknown>;
    const parsedDirect = syncLearningStatePayloadSchema.safeParse(raw);
    return parsedDirect.success ? parsedDirect.data : null;
  } catch {
    return null;
  }
}

function readOptionalRating(payload: string): SyncLearningStatePayload['rating'] | undefined {
  try {
    const raw = JSON.parse(payload) as Record<string, unknown>;
    if (raw.rating === 'forgot' || raw.rating === 'hard' || raw.rating === 'good') {
      return raw.rating;
    }
  } catch {
    // ignore malformed legacy payload
  }
  return undefined;
}
