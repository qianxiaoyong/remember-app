import { z } from 'zod';
import { orderStatusSchema } from '../order/order-status.js';

export const adminListOrdersQuerySchema = z
  .object({
    status: orderStatusSchema.optional(),
    packId: z.string().min(1).optional(),
    userId: z.uuid().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export const adminOrderListItemSchema = z
  .object({
    orderId: z.uuid(),
    userId: z.uuid(),
    maskedPhone: z.string().min(1),
    packId: z.string().min(1),
    packTitle: z.string().min(1),
    amountCents: z.number().int().nonnegative(),
    status: orderStatusSchema,
    channel: z.string().min(1).optional(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .strict();

export const adminOrderListResponseSchema = z
  .object({
    items: z.array(adminOrderListItemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
  })
  .strict();

export const adminPaymentEventSchema = z
  .object({
    notificationId: z.string().min(1),
    transactionId: z.string().min(1),
    processedAt: z.iso.datetime(),
  })
  .strict();

export const adminOrderDetailSchema = z
  .object({
    orderId: z.uuid(),
    userId: z.uuid(),
    maskedPhone: z.string().min(1),
    packId: z.string().min(1),
    packTitle: z.string().min(1),
    amountCents: z.number().int().nonnegative(),
    status: orderStatusSchema,
    channel: z.string().min(1).optional(),
    sourceCode: z.string().min(1).optional(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    paymentEvents: z.array(adminPaymentEventSchema),
    refunds: z.array(
      z
        .object({
          refundId: z.uuid(),
          status: z.string().min(1),
          createdAt: z.iso.datetime(),
        })
        .strict(),
    ),
  })
  .strict();

export type AdminListOrdersQuery = z.infer<typeof adminListOrdersQuerySchema>;
export type AdminOrderListResponse = z.infer<typeof adminOrderListResponseSchema>;
export type AdminOrderDetail = z.infer<typeof adminOrderDetailSchema>;
