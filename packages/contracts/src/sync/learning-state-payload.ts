import { z } from 'zod';

export const reviewRatingSchema = z.enum(['forgot', 'hard', 'good']);

export const syncLearningStatePayloadSchema = z
  .object({
    packId: z.string().min(1),
    easiness: z.number(),
    intervalDays: z.number().int().min(0),
    repetitions: z.number().int().min(0),
    dueAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    rating: reviewRatingSchema.optional(),
  })
  .strict();

export type SyncLearningStatePayload = z.infer<typeof syncLearningStatePayloadSchema>;
