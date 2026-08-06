import type { ReviewOutcome } from '@remember/contracts';
import { syncLearningStatePayloadSchema } from '@remember/contracts';
import type { LearningStateRow } from '../repositories/learning-state-repository';

export function buildSyncOutboxPayload(input: {
  row: LearningStateRow;
  outcome?: ReviewOutcome;
}): string {
  const payload = syncLearningStatePayloadSchema.parse({
    inReviewPool: input.row.inReviewPool,
    boxLevel: input.row.boxLevel,
    dueAt: input.row.dueAt,
    firstAddedFromPackId: input.row.firstAddedFromPackId ?? input.row.packId,
    updatedAt: input.row.updatedAt,
    ...(input.row.lastSeenInPackId ? { lastSeenInPackId: input.row.lastSeenInPackId } : {}),
    ...(input.row.consecutiveLevel3Passes > 0
      ? { consecutiveLevel3Passes: input.row.consecutiveLevel3Passes }
      : {}),
    ...(input.outcome ? { outcome: input.outcome } : {}),
    legacyEasiness: input.row.easiness,
    legacyIntervalDays: input.row.intervalDays,
    legacyRepetitions: input.row.repetitions,
  });
  return JSON.stringify(payload);
}
