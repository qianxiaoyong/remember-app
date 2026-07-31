import { z } from 'zod';

export const adminCreateRefundRequestSchema = z
  .object({
    orderId: z.uuid(),
    reason: z.string().trim().max(256).optional(),
  })
  .strict();

export const adminCreateRefundResponseSchema = z
  .object({
    refundId: z.uuid(),
    orderId: z.uuid(),
    status: z.enum(['succeeded']),
    orderStatus: z.literal('refunded'),
  })
  .strict();

export type AdminCreateRefundRequest = z.infer<typeof adminCreateRefundRequestSchema>;
export type AdminCreateRefundResponse = z.infer<typeof adminCreateRefundResponseSchema>;
