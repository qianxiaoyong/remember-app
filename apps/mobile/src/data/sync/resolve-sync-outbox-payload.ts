import {
  syncLearningStatePayloadSchema,
  type ReviewOutcome,
  type SyncLearningStatePayload,
} from '@remember/contracts';
import { getLearningStateByKnowledgeId } from '../repositories/learning-state-repository';
import type { SyncOutboxRow } from '../repositories/sync-outbox-repository';

export function resolveSyncOutboxPayload(row: SyncOutboxRow): SyncLearningStatePayload | null {
  const state = getLearningStateByKnowledgeId(row.knowledgeId);
  if (state) {
    const outcome = readOptionalOutcome(row.payload);
    const parsedFromState = syncLearningStatePayloadSchema.safeParse({
      inReviewPool: state.inReviewPool,
      boxLevel: state.boxLevel,
      dueAt: state.dueAt,
      firstAddedFromPackId: state.firstAddedFromPackId ?? state.packId,
      updatedAt: state.updatedAt,
      ...(state.lastSeenInPackId ? { lastSeenInPackId: state.lastSeenInPackId } : {}),
      ...(state.consecutiveLevel3Passes > 0
        ? { consecutiveLevel3Passes: state.consecutiveLevel3Passes }
        : {}),
      ...(outcome ? { outcome } : {}),
      legacyEasiness: state.easiness,
      legacyIntervalDays: state.intervalDays,
      legacyRepetitions: state.repetitions,
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

function readOptionalOutcome(payload: string): ReviewOutcome | undefined {
  try {
    const raw = JSON.parse(payload) as Record<string, unknown>;
    if (raw.outcome === 'passed' || raw.outcome === 'failed') {
      return raw.outcome;
    }
  } catch {
    // ignore malformed legacy payload
  }
  return undefined;
}
