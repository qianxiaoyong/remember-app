import { z } from 'zod';

export const syncSnapshotItemSchema = z
  .object({
    knowledgeId: z.string().min(1),
    packId: z.string().min(1),
    easiness: z.number(),
    intervalDays: z.number().int().min(0),
    repetitions: z.number().int().min(0),
    dueAt: z.iso.datetime(),
    clientVersion: z.number().int().min(1),
    updatedAt: z.iso.datetime(),
  })
  .strict();

export const syncSnapshotResponseSchema = z
  .object({
    items: z.array(syncSnapshotItemSchema),
  })
  .strict();

export type SyncSnapshotItem = z.infer<typeof syncSnapshotItemSchema>;
export type SyncSnapshotResponse = z.infer<typeof syncSnapshotResponseSchema>;
