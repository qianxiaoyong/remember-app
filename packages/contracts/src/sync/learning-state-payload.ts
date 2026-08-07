import { z } from 'zod';

export const reviewOutcomeSchema = z.enum(['passed', 'failed']);

/** @deprecated SM-2 rating; retained for parsing legacy outbox rows only. */
export const reviewRatingSchema = z.enum(['forgot', 'hard', 'good']);

export const syncLearningStatePayloadSchema = z
  .object({
    inReviewPool: z.boolean(),
    boxLevel: z.number().int().min(0).max(3),
    dueAt: z.iso.datetime(),
    firstAddedFromPackId: z.string().min(1),
    lastSeenInPackId: z.string().min(1).optional(),
    updatedAt: z.iso.datetime(),
    outcome: reviewOutcomeSchema.optional(),
    consecutiveLevel3Passes: z.number().int().min(0).optional(),
    legacyEasiness: z.number().optional(),
    legacyIntervalDays: z.number().int().min(0).optional(),
    legacyRepetitions: z.number().int().min(0).optional(),
  })
  .strict();

export type ReviewOutcome = z.infer<typeof reviewOutcomeSchema>;
export type SyncLearningStatePayload = z.infer<typeof syncLearningStatePayloadSchema>;
