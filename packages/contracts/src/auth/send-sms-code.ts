import { z } from 'zod';

export const chinaMobilePhoneSchema = z
  .string()
  .trim()
  .regex(/^1[3-9]\d{9}$/, 'invalid phone number');

export const sendSmsCodeRequestSchema = z
  .object({
    phone: chinaMobilePhoneSchema,
  })
  .strict();

export const sendSmsCodeResponseSchema = z
  .object({
    expiresInSeconds: z.number().int().positive(),
    resendAfterSeconds: z.number().int().nonnegative(),
  })
  .strict();

export type SendSmsCodeRequest = z.infer<typeof sendSmsCodeRequestSchema>;
export type SendSmsCodeResponse = z.infer<typeof sendSmsCodeResponseSchema>;
