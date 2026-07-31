import { z } from 'zod';

export const adminRedemptionCodeStatusSchema = z.enum(['active', 'disabled', 'deleted']);

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
    status: adminRedemptionCodeStatusSchema,
    note: z.string().max(500).optional(),
    isExhausted: z.boolean(),
    canEdit: z.boolean(),
    canRestore: z.boolean(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    deletedAt: z.iso.datetime().optional(),
  })
  .strict();

export const adminCreateRedemptionBatchResponseSchema = z
  .object({
    items: z.array(adminRedemptionCodeItemSchema),
  })
  .strict();

const booleanQuerySchema = z.preprocess((value) => {
  if (value === 'true' || value === true) {
    return true;
  }
  if (value === 'false' || value === false) {
    return false;
  }
  return undefined;
}, z.boolean().optional());

export const adminListRedemptionCodesQuerySchema = z
  .object({
    packId: z.string().min(1).optional(),
    status: adminRedemptionCodeStatusSchema.optional(),
    includeDeleted: booleanQuerySchema,
    keyword: z.string().trim().min(1).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export type AdminListRedemptionCodesQuery = z.infer<typeof adminListRedemptionCodesQuerySchema>;

export const adminRedemptionCodeListItemSchema = adminRedemptionCodeItemSchema
  .omit({ code: true })
  .extend({
    code: z.string().min(1).optional(),
    codePreview: z.string().min(1).optional(),
  })
  .strict();

export const adminRedemptionCodeListResponseSchema = z
  .object({
    items: z.array(adminRedemptionCodeListItemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
  })
  .strict();

export const adminUpdateRedemptionCodeRequestSchema = z
  .object({
    maxRedemptions: z.number().int().min(1).optional(),
    expiresAt: z.iso.datetime().nullable().optional(),
    note: z.string().max(500).nullable().optional(),
    status: z.enum(['active', 'disabled']).optional(),
  })
  .strict();

export type AdminUpdateRedemptionCodeRequest = z.infer<
  typeof adminUpdateRedemptionCodeRequestSchema
>;

export const adminRedemptionCodeDetailSchema = adminRedemptionCodeListItemSchema.extend({
  recentRedemptions: z.array(
    z
      .object({
        id: z.uuid(),
        maskedPhone: z.string().min(1),
        redeemedAt: z.iso.datetime(),
      })
      .strict(),
  ),
});

export type AdminCreateRedemptionBatchRequest = z.infer<
  typeof adminCreateRedemptionBatchRequestSchema
>;
export type AdminCreateRedemptionBatchResponse = z.infer<
  typeof adminCreateRedemptionBatchResponseSchema
>;
export type AdminRedemptionCodeListResponse = z.infer<
  typeof adminRedemptionCodeListResponseSchema
>;
