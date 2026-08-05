import { z } from 'zod';

export const appReleaseResponseSchema = z
  .object({
    minAndroidVersion: z.string().min(1),
    latestApkUrl: z.url(),
    forceUpdateBelow: z.string().min(1).optional(),
  })
  .strict();

export type AppReleaseResponse = z.infer<typeof appReleaseResponseSchema>;
