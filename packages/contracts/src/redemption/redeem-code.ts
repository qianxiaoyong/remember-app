import { z } from 'zod';

export const redeemCodeRequestSchema = z
  .object({
    code: z.string().trim().min(4).max(64),
  })
  .strict();

export const redeemCodeResponseSchema = z
  .object({
    packId: z.string().min(1),
    alreadyOwned: z.boolean(),
  })
  .strict();

export type RedeemCodeRequest = z.infer<typeof redeemCodeRequestSchema>;
export type RedeemCodeResponse = z.infer<typeof redeemCodeResponseSchema>;
