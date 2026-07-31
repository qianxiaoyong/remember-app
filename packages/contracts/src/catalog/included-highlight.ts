import { z } from 'zod';

export const includedHighlightSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    sortOrder: z.number().int().nonnegative().optional(),
  })
  .strict();

export type IncludedHighlight = z.infer<typeof includedHighlightSchema>;
