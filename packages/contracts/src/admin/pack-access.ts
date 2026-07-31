import { z } from 'zod';

export const adminListPackAccessQuerySchema = z
  .object({
    userId: z.uuid().optional(),
    packId: z.string().min(1).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export type AdminListPackAccessQuery = z.infer<typeof adminListPackAccessQuerySchema>;

export const adminPackAccessItemSchema = z
  .object({
    id: z.string().min(1),
    userId: z.uuid(),
    maskedPhone: z.string().min(1),
    packId: z.string().min(1),
    packTitle: z.string().min(1),
    source: z.string().min(1),
    orderId: z.uuid().optional(),
    grantedAt: z.iso.datetime(),
  })
  .strict();

export const adminPackAccessListResponseSchema = z
  .object({
    items: z.array(adminPackAccessItemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
  })
  .strict();

export const adminGrantPackAccessRequestSchema = z
  .object({
    userId: z.uuid(),
    packId: z.string().min(1),
    note: z.string().trim().max(256).optional(),
  })
  .strict();

export const adminGrantPackAccessResponseSchema = z
  .object({
    id: z.string().min(1),
    userId: z.uuid(),
    packId: z.string().min(1),
    source: z.literal('admin_grant'),
    grantedAt: z.iso.datetime(),
  })
  .strict();

export type AdminGrantPackAccessRequest = z.infer<typeof adminGrantPackAccessRequestSchema>;
export type AdminGrantPackAccessResponse = z.infer<typeof adminGrantPackAccessResponseSchema>;
