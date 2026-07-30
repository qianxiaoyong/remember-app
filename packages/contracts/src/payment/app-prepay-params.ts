import { z } from 'zod';

export const wechatAppPrepayParamsSchema = z
  .object({
    appId: z.string().min(1),
    partnerId: z.string().min(1),
    prepayId: z.string().min(1),
    packageValue: z.string().min(1),
    nonceStr: z.string().min(1),
    timeStamp: z.string().min(1),
    sign: z.string().min(1),
  })
  .strict();

export type WechatAppPrepayParams = z.infer<typeof wechatAppPrepayParamsSchema>;

export const simulatePaymentNotifyRequestSchema = z
  .object({
    orderId: z.uuid(),
    notificationId: z.string().min(1).optional(),
    transactionId: z.string().min(1).optional(),
    amountCents: z.number().int().positive().optional(),
  })
  .strict();

export type SimulatePaymentNotifyRequest = z.infer<typeof simulatePaymentNotifyRequestSchema>;

export const simulatePaymentNotifyResponseSchema = z
  .object({
    processed: z.boolean(),
    orderId: z.uuid(),
    status: z.enum(['pending', 'paid', 'refunding', 'refunded', 'closed']),
  })
  .strict();

export type SimulatePaymentNotifyResponse = z.infer<typeof simulatePaymentNotifyResponseSchema>;
