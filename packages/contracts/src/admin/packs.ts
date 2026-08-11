import { z } from 'zod';
import { catalogPrimaryCategorySchema } from '../catalog/pack-summary.js';
import { includedHighlightSchema } from '../catalog/included-highlight.js';
import { introMediaItemSchema } from '../catalog/intro-media.js';
import { packSamplePreviewSchema } from '../catalog/sample-preview.js';

export const adminPackStatusSchema = z.enum(['draft', 'published']);

/** 表单空字符串视为未填，避免 React Admin 提交 "" 触发 min(1) 失败。 */
const optionalNonEmptyStringSchema = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().min(1).optional(),
);

const optionalUrlSchema = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.url().optional(),
);

const optionalClearableUrlSchema = z.preprocess(
  (value) => {
    if (value === '' || value === null) {
      return null;
    }
    if (typeof value === 'string' && value.trim() === '') {
      return null;
    }
    return value;
  },
  z.union([z.url(), z.null()]).optional(),
);

const optionalUuidSchema = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.uuid().optional(),
);

const optionalClearableVersionNodeIdSchema = z.preprocess(
  (value) => (value === '' || value === null ? null : value),
  z.union([z.uuid(), z.null()]).optional(),
);

export const adminPackSummarySchema = z
  .object({
    packId: z.string().min(1),
    title: z.string().min(1),
    displayTitle: z.string().min(1).optional(),
    primaryCategory: catalogPrimaryCategorySchema,
    secondaryCategory: z.string().min(1),
    versionLabel: z.string().min(1),
    primaryNodeId: z.uuid().optional(),
    secondaryNodeId: z.uuid().optional(),
    versionNodeId: z.uuid().optional(),
    contentTags: z.array(z.string()),
    cardCount: z.number().int().nonnegative(),
    sizeLabel: z.string().min(1),
    summary: z.string().min(1),
    priceCents: z.number().int().nonnegative(),
    coverUrl: z.url().optional(),
    coverThumbnailUrl: z.url().optional(),
    coverBadge: z.string().min(1).optional(),
    coverLines: z.array(z.string()).optional(),
    includedHighlights: z.array(includedHighlightSchema).max(4).optional(),
    samplePreviews: z.array(packSamplePreviewSchema).optional(),
    introMedia: z.array(introMediaItemSchema).optional(),
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

const adminPackWriteFieldsSchema = z
  .object({
    packId: z.string().min(1).max(64),
    title: z.string().min(1),
    displayTitle: optionalNonEmptyStringSchema,
    primaryCategory: catalogPrimaryCategorySchema.optional(),
    secondaryCategory: z.string().min(1).optional(),
    versionLabel: z.string().min(1).optional(),
    primaryNodeId: optionalUuidSchema,
    secondaryNodeId: optionalUuidSchema,
    versionNodeId: optionalUuidSchema,
    contentTags: z.array(z.string()).default([]),
    cardCount: z.number().int().nonnegative().default(0),
    sizeLabel: z.string().min(1).default('未知'),
    summary: z.string().min(1),
    priceCents: z.number().int().nonnegative(),
    coverUrl: optionalUrlSchema,
    coverThumbnailUrl: optionalClearableUrlSchema,
    coverBadge: optionalNonEmptyStringSchema,
    coverLines: z.array(z.string()).optional(),
    includedHighlights: z.array(includedHighlightSchema).max(4).default([]),
    samplePreviews: z.array(packSamplePreviewSchema).default([]),
    introMedia: z.array(introMediaItemSchema).optional(),
    status: adminPackStatusSchema.optional(),
  })
  .strict();

function hasTaxonomyNodeIds(value: {
  primaryNodeId?: string | undefined;
  secondaryNodeId?: string | undefined;
}): boolean {
  return Boolean(value.primaryNodeId && value.secondaryNodeId);
}

function hasLegacyTaxonomyLabels(value: {
  primaryCategory?: string | undefined;
  secondaryCategory?: string | undefined;
}): boolean {
  return Boolean(value.primaryCategory && value.secondaryCategory);
}

function hasRequiredPackTaxonomy(value: {
  primaryNodeId?: string | undefined;
  secondaryNodeId?: string | undefined;
  primaryCategory?: string | undefined;
  secondaryCategory?: string | undefined;
}): boolean {
  return hasTaxonomyNodeIds(value) || hasLegacyTaxonomyLabels(value);
}

export const adminCreatePackRequestSchema = adminPackWriteFieldsSchema.refine(
  hasRequiredPackTaxonomy,
  {
    message: '请提供一级与二级分类',
  },
);

/** PATCH 专用：不含 Zod default，避免未传字段被解析成 draft/0/[] 覆盖库内值。 */
export const adminUpdatePackRequestSchema = z
  .object({
    title: z.string().min(1).optional(),
    displayTitle: optionalNonEmptyStringSchema,
    primaryCategory: catalogPrimaryCategorySchema.optional(),
    secondaryCategory: z.string().min(1).optional(),
    versionLabel: z.string().min(1).optional(),
    primaryNodeId: optionalUuidSchema,
    secondaryNodeId: optionalUuidSchema,
    versionNodeId: optionalClearableVersionNodeIdSchema,
    contentTags: z.array(z.string()).optional(),
    cardCount: z.number().int().nonnegative().optional(),
    sizeLabel: z.string().min(1).optional(),
    summary: z.string().min(1).optional(),
    priceCents: z.number().int().nonnegative().optional(),
    coverUrl: optionalUrlSchema,
    coverThumbnailUrl: optionalClearableUrlSchema,
    coverBadge: optionalNonEmptyStringSchema,
    coverLines: z.array(z.string()).optional(),
    includedHighlights: z.array(includedHighlightSchema).max(4).optional(),
    samplePreviews: z.array(packSamplePreviewSchema).optional(),
    introMedia: z.array(introMediaItemSchema).optional(),
    status: adminPackStatusSchema.optional(),
  })
  .strip();

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
    note: z.string().max(500).optional(),
  })
  .strict();

export const adminUpdatePackVersionNoteRequestSchema = z
  .object({
    note: z.string().max(500).nullable(),
  })
  .strict();

export type AdminUpdatePackVersionNoteRequest = z.infer<
  typeof adminUpdatePackVersionNoteRequestSchema
>;

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

export const adminExtractSamplePreviewsResponseSchema = z
  .object({
    samplePreviews: z.array(packSamplePreviewSchema),
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
