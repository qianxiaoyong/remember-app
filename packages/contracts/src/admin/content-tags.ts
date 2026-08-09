import { z } from 'zod';

export const adminContentTagVocabularyItemSchema = z
  .object({
    label: z.string().min(1).max(32),
    sortOrder: z.number().int().nonnegative(),
    createdAt: z.iso.datetime(),
  })
  .strict();

export const adminContentTagVocabularyListResponseSchema = z
  .object({
    items: z.array(adminContentTagVocabularyItemSchema),
  })
  .strict();

export const adminUpsertContentTagVocabularyRequestSchema = z
  .object({
    labels: z.array(z.string().min(1).max(32)).min(1),
  })
  .strict();

export type AdminContentTagVocabularyItem = z.infer<typeof adminContentTagVocabularyItemSchema>;
export type AdminContentTagVocabularyListResponse = z.infer<
  typeof adminContentTagVocabularyListResponseSchema
>;
export type AdminUpsertContentTagVocabularyRequest = z.infer<
  typeof adminUpsertContentTagVocabularyRequestSchema
>;
