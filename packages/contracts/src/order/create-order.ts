import { z } from 'zod';
import { wechatAppPrepayParamsSchema } from '../payment/app-prepay-params.js';
import { orderStatusSchema } from './order-status.js';

export const createOrderRequestSchema = z
  .object({
    packId: z.string().min(1),
  })
  .strict();

export const createOrderResponseSchema = z
  .object({
    orderId: z.uuid(),
    packId: z.string().min(1),
    amountCents: z.number().int().positive(),
    status: orderStatusSchema,
    wechatPrepay: wechatAppPrepayParamsSchema,
  })
  .strict();

export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;
export type CreateOrderResponse = z.infer<typeof createOrderResponseSchema>;
