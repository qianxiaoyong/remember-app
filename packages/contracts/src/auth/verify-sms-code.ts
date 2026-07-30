import { z } from 'zod';
import { chinaMobilePhoneSchema } from './send-sms-code.js';
import { sessionUserSchema } from './session-user.js';

export const smsCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, 'invalid sms code');

export const deviceIdSchema = z.uuid();

export const verifySmsCodeRequestSchema = z
  .object({
    phone: chinaMobilePhoneSchema,
    code: smsCodeSchema,
    deviceId: deviceIdSchema,
  })
  .strict();

export const verifySmsCodeResponseSchema = z
  .object({
    token: z.string().min(1),
    user: sessionUserSchema,
  })
  .strict();

export type VerifySmsCodeRequest = z.infer<typeof verifySmsCodeRequestSchema>;
export type VerifySmsCodeResponse = z.infer<typeof verifySmsCodeResponseSchema>;
