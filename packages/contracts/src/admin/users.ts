import { z } from 'zod';

export const adminUserStatusSchema = z.enum(['active']);

export const adminListUsersQuerySchema = z
  .object({
    userId: z.uuid().optional(),
    maskedPhone: z.string().min(1).optional(),
    status: adminUserStatusSchema.optional(),
    registeredSince: z.iso.datetime().optional(),
    registeredUntil: z.iso.datetime().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export const adminUserListItemSchema = z
  .object({
    userId: z.uuid(),
    maskedPhone: z.string().min(1),
    displayName: z.string().min(1).optional(),
    status: adminUserStatusSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    lastActiveAt: z.iso.datetime().optional(),
    packAccessCount: z.number().int().nonnegative(),
    paidOrderCount: z.number().int().nonnegative(),
  })
  .strict();

export const adminUserListResponseSchema = z
  .object({
    items: z.array(adminUserListItemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
  })
  .strict();

export const adminUserDetailSchema = adminUserListItemSchema.extend({
  mainDeviceId: z.uuid().optional(),
});

export type AdminListUsersQuery = z.infer<typeof adminListUsersQuerySchema>;
export type AdminUserListResponse = z.infer<typeof adminUserListResponseSchema>;
export type AdminUserDetail = z.infer<typeof adminUserDetailSchema>;
