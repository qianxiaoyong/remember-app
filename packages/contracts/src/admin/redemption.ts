import { z } from 'zod';

export const adminCreateRedemptionBatchRequestSchema = z
  .object({
    packId: z.string().min(1),
    count: z.number().int().min(1).max(500),
    maxRedemptions: z.number().int().min(1).default(1),
    expiresAt: z.iso.datetime().optional(),
    prefix: z.string().trim().max(16).default('REDEEM'),
  })
  .strict();

export const adminRedemptionCodeItemSchema = z
  .object({
    id: z.uuid(),
    packId: z.string().min(1),
    code: z.string().min(1),
    maxRedemptions: z.number().int().positive(),
    redeemedCount: z.number().int().nonnegative(),
    expiresAt: z.iso.datetime().optional(),
    status: z.string().min(1),
    createdAt: z.iso.datetime(),
  })
  .strict();

export const adminCreateRedemptionBatchResponseSchema = z
  .object({
    items: z.array(adminRedemptionCodeItemSchema),
  })
  .strict();

export const adminListRedemptionCodesQuerySchema = z
  .object({
    packId: z.string().min(1).optional(),
    status: z.string().min(1).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export type AdminListRedemptionCodesQuery = z.infer<typeof adminListRedemptionCodesQuerySchema>;

export const adminRedemptionCodeListResponseSchema = z
  .object({
    items: z.array(
      adminRedemptionCodeItemSchema.omit({ code: true }).extend({
        codePreview: z.string().min(1),
      }),
    ),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
  })
  .strict();

export type AdminCreateRedemptionBatchRequest = z.infer<
  typeof adminCreateRedemptionBatchRequestSchema
>;
