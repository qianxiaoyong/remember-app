import { z } from 'zod';
import { orderStatusSchema } from './order-status.js';

export const orderDetailResponseSchema = z
  .object({
    orderId: z.uuid(),
    packId: z.string().min(1),
    amountCents: z.number().int().nonnegative(),
    status: orderStatusSchema,
    paidAt: z.iso.datetime().optional(),
  })
  .strict();

export type OrderDetailResponse = z.infer<typeof orderDetailResponseSchema>;
