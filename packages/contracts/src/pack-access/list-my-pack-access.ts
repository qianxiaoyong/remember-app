import { z } from 'zod';

export const packAccessItemSchema = z
  .object({
    packId: z.string().min(1),
    grantedAt: z.string().datetime(),
    source: z.enum(['purchase', 'redemption']),
  })
  .strict();

export const listMyPackAccessResponseSchema = z
  .object({
    items: z.array(packAccessItemSchema),
  })
  .strict();

export type PackAccessItem = z.infer<typeof packAccessItemSchema>;
export type ListMyPackAccessResponse = z.infer<typeof listMyPackAccessResponseSchema>;
