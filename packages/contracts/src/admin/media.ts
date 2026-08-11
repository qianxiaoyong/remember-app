import { z } from 'zod';

/** 封面与 intro 图片上传上限（5MB；封面运营规范建议 ≤2MB） */
export const MAX_ADMIN_MEDIA_UPLOAD_BYTES = 5 * 1024 * 1024;

export const ADMIN_MEDIA_ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export const adminMediaUploadResponseSchema = z
  .object({
    url: z.url(),
  })
  .strict();

export type AdminMediaUploadResponse = z.infer<typeof adminMediaUploadResponseSchema>;

export const adminMediaUploadCoverResponseSchema = z
  .object({
    coverUrl: z.url(),
    coverThumbnailUrl: z.url(),
    originalSizeBytes: z.number().int().positive(),
    thumbnailSizeBytes: z.number().int().positive(),
  })
  .strict();

export type AdminMediaUploadCoverResponse = z.infer<typeof adminMediaUploadCoverResponseSchema>;
