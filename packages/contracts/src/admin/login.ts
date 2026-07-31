import { z } from 'zod';
import { adminSessionUserSchema } from './session-admin.js';

export const adminLoginRequestSchema = z
  .object({
    loginName: z.string().trim().min(1).max(64),
    password: z.string().min(8).max(128),
  })
  .strict();

export const adminLoginResponseSchema = z
  .object({
    token: z.string().min(1),
    admin: adminSessionUserSchema,
  })
  .strict();

export const adminLogoutResponseSchema = z.object({ ok: z.literal(true) }).strict();

export type AdminLoginRequest = z.infer<typeof adminLoginRequestSchema>;
export type AdminLoginResponse = z.infer<typeof adminLoginResponseSchema>;
export type AdminLogoutResponse = z.infer<typeof adminLogoutResponseSchema>;
