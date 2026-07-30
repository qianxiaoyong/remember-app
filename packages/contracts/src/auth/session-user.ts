import { z } from 'zod';

export const sessionUserSchema = z
  .object({
    userId: z.uuid(),
    maskedPhone: z.string().min(1),
    displayName: z.string().min(1),
  })
  .strict();

export const logoutResponseSchema = z.object({ ok: z.literal(true) }).strict();

export const writeProbeResponseSchema = z.object({ ok: z.literal(true) }).strict();

export type SessionUser = z.infer<typeof sessionUserSchema>;
export type LogoutResponse = z.infer<typeof logoutResponseSchema>;
export type WriteProbeResponse = z.infer<typeof writeProbeResponseSchema>;
