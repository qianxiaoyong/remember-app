import { z } from 'zod';

export const introMediaItemSchema = z
  .object({
    type: z.enum(['image', 'video']),
    url: z.url(),
    posterUrl: z.url().optional(),
    sortOrder: z.number().int().nonnegative(),
  })
  .strict();

export type IntroMediaItem = z.infer<typeof introMediaItemSchema>;
