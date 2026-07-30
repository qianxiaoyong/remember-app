import { z } from 'zod';

export const packDownloadAuthorizationResponseSchema = z
  .object({
    packId: z.string().min(1),
    packVersion: z.string().min(1),
    sha256: z.string().length(64),
    sizeBytes: z.number().int().positive(),
    downloadUrl: z.url(),
    offlineLicenseExpiresAt: z.iso.datetime(),
    /** mock 模式下 zip 内 manifest.packId；客户端安装后需别名到请求的 packId */
    devContentPackId: z.string().min(1).optional(),
  })
  .strict();

export type PackDownloadAuthorizationResponse = z.infer<
  typeof packDownloadAuthorizationResponseSchema
>;
