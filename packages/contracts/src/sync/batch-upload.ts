import { z } from 'zod';
import { syncLearningStatePayloadSchema } from './learning-state-payload.js';

export const syncBatchItemSchema = z
  .object({
    eventId: z.string().min(1),
    knowledgeId: z.string().min(1),
    clientVersion: z.number().int().min(1),
    payload: syncLearningStatePayloadSchema,
  })
  .strict();

export const syncBatchUploadRequestSchema = z
  .object({
    items: z.array(syncBatchItemSchema).min(1).max(100),
  })
  .strict();

export const syncBatchRejectedItemSchema = z
  .object({
    eventId: z.string().min(1),
    reason: z.enum(['STALE_VERSION', 'INVALID_PAYLOAD']),
  })
  .strict();

export const syncBatchUploadResponseSchema = z
  .object({
    acceptedEventIds: z.array(z.string().min(1)),
    rejected: z.array(syncBatchRejectedItemSchema),
  })
  .strict();

export type SyncBatchItem = z.infer<typeof syncBatchItemSchema>;
export type SyncBatchUploadRequest = z.infer<typeof syncBatchUploadRequestSchema>;
export type SyncBatchUploadResponse = z.infer<typeof syncBatchUploadResponseSchema>;
