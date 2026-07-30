import type { ReviewRating } from '@remember/domain';
import { syncLearningStatePayloadSchema } from '@remember/contracts';
import type { LearningStateRow } from '../repositories/learning-state-repository';

export function buildSyncOutboxPayload(input: {
  row: LearningStateRow;
  rating?: ReviewRating;
}): string {
  const payload = syncLearningStatePayloadSchema.parse({
    packId: input.row.packId,
    easiness: input.row.easiness,
    intervalDays: input.row.intervalDays,
    repetitions: input.row.repetitions,
    dueAt: input.row.dueAt,
    updatedAt: input.row.updatedAt,
    ...(input.rating ? { rating: input.rating } : {}),
  });
  return JSON.stringify(payload);
}
