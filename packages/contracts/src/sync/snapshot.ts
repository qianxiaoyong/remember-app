import { z } from 'zod';

export const syncSnapshotItemSchema = z
  .object({
    knowledgeId: z.string().min(1),
    inReviewPool: z.boolean(),
    boxLevel: z.number().int().min(0).max(3),
    dueAt: z.iso.datetime(),
    firstAddedFromPackId: z.string().min(1),
    lastSeenInPackId: z.string().min(1).optional(),
    consecutiveLevel3Passes: z.number().int().min(0).optional(),
    clientVersion: z.number().int().min(1),
    updatedAt: z.iso.datetime(),
    legacyEasiness: z.number().optional(),
    legacyIntervalDays: z.number().int().min(0).optional(),
    legacyRepetitions: z.number().int().min(0).optional(),
  })
  .strict();

export const syncSnapshotResponseSchema = z
  .object({
    items: z.array(syncSnapshotItemSchema),
  })
  .strict();

export type SyncSnapshotItem = z.infer<typeof syncSnapshotItemSchema>;
export type SyncSnapshotResponse = z.infer<typeof syncSnapshotResponseSchema>;
