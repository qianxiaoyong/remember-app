import { z } from 'zod';

export const catalogPackPriceResponseSchema = z
  .object({
    packId: z.string().min(1),
    priceCents: z.number().int().nonnegative(),
  })
  .strict();

export type CatalogPackPriceResponse = z.infer<typeof catalogPackPriceResponseSchema>;
