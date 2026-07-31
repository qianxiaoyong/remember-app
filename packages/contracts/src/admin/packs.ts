import { z } from 'zod';
import { catalogPrimaryCategorySchema } from '../catalog/pack-summary.js';
import { introMediaItemSchema } from '../catalog/intro-media.js';
import { packSamplePreviewSchema } from '../catalog/sample-preview.js';

export const adminPackStatusSchema = z.enum(['draft', 'published']);

export const adminPackSummarySchema = z
  .object({
    packId: z.string().min(1),
    title: z.string().min(1),
    displayTitle: z.string().min(1).optional(),
    primaryCategory: catalogPrimaryCategorySchema,
    secondaryCategory: z.string().min(1),
    versionLabel: z.string().min(1),
    contentTags: z.array(z.string()),
    cardCount: z.number().int().nonnegative(),
    sizeLabel: z.string().min(1),
    summary: z.string().min(1),
    priceCents: z.number().int().nonnegative(),
    status: adminPackStatusSchema,
    currentVersionId: z.uuid().optional(),
    currentPackVersion: z.string().min(1).optional(),
    protocolVersion: z.number().int().positive().optional(),
    updatedAt: z.iso.datetime(),
  })
  .strict();

export const adminPackListResponseSchema = z
  .object({
    items: z.array(adminPackSummarySchema),
  })
  .strict();

export const adminCreatePackRequestSchema = z
  .object({
    packId: z.string().min(1).max(64),
    title: z.string().min(1),
    displayTitle: z.string().min(1).optional(),
    primaryCategory: catalogPrimaryCategorySchema,
    secondaryCategory: z.string().min(1),
    versionLabel: z.string().min(1),
    contentTags: z.array(z.string()).default([]),
    cardCount: z.number().int().nonnegative().default(0),
    sizeLabel: z.string().min(1).default('未知'),
    summary: z.string().min(1),
    priceCents: z.number().int().nonnegative(),
    samplePreviews: z.array(packSamplePreviewSchema).default([]),
    introMedia: z.array(introMediaItemSchema).optional(),
    status: adminPackStatusSchema.default('draft'),
  })
  .strict();

export const adminUpdatePackRequestSchema = adminCreatePackRequestSchema
  .omit({ packId: true })
  .partial()
  .strict();

export const adminPackVersionSchema = z
  .object({
    id: z.uuid(),
    packId: z.string().min(1),
    packVersion: z.string().min(1),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    sizeBytes: z.number().int().nonnegative(),
    keyId: z.string().min(1),
    protocolVersion: z.number().int().positive(),
    status: z.string().min(1),
    publishedAt: z.iso.datetime(),
    isCurrent: z.boolean(),
  })
  .strict();

export const adminUploadPackVersionResponseSchema = z
  .object({
    version: adminPackVersionSchema,
    manifestSummary: z
      .object({
        packId: z.string().min(1),
        packVersion: z.string().min(1),
        protocolVersion: z.number().int().positive(),
        keyId: z.string().min(1),
        fileCount: z.number().int().positive(),
        cardCount: z.number().int().nonnegative(),
        lexiconEntryCount: z.number().int().nonnegative(),
      })
      .strict(),
  })
  .strict();

export const adminPublishPackVersionResponseSchema = z
  .object({
    packId: z.string().min(1),
    currentVersionId: z.uuid(),
    packVersion: z.string().min(1),
  })
  .strict();

export const adminPackDetailResponseSchema = z
  .object({
    pack: adminPackSummarySchema,
    versions: z.array(adminPackVersionSchema),
  })
  .strict();

export type AdminCreatePackRequest = z.infer<typeof adminCreatePackRequestSchema>;
export type AdminUpdatePackRequest = z.infer<typeof adminUpdatePackRequestSchema>;
export type AdminPackDetailResponse = z.infer<typeof adminPackDetailResponseSchema>;
