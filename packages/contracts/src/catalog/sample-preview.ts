import { z } from 'zod';

export const packSamplePreviewSchema = z
  .object({
    headword: z.string().min(1),
    zh: z.string().min(1),
    exampleEn: z.string().min(1),
    initial: z.string().min(1).optional(),
    previewAudioUrl: z.url().optional(),
  })
  .strict();

export type PackSamplePreview = z.infer<typeof packSamplePreviewSchema>;
