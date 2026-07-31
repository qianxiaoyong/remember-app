import { z } from 'zod';

export const adminRoleSchema = z.enum(['super_admin']);

export const adminSessionUserSchema = z
  .object({
    adminUserId: z.uuid(),
    loginName: z.string().min(1),
    role: adminRoleSchema,
  })
  .strict();

export type AdminSessionUser = z.infer<typeof adminSessionUserSchema>;
