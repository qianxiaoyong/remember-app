import { z } from 'zod';

export const lemmaStatusSchema = z.enum(['draft', 'published', 'archived']);

export const lemmaSourceSchema = z.enum(['ecdict', 'manual', 'ai', 'merged']);

export const fragmentSourceSchema = z.enum(['ecdict', 'manual', 'llm', 'ai', 'merged']);

export const fragmentTypeSchema = z.enum([
  'definition_zh',
  'definition_en',
  'example',
  'mnemonic',
  'morphology',
  'note',
]);

export const lemmaFormTypeSchema = z.enum([
  'lemma',
  'past',
  'plural',
  'gerund',
  'third_person',
  'comparative',
  'superlative',
  'other',
]);

export const lemmaAssetKindSchema = z.enum([
  'pronunciation_us',
  'pronunciation_uk',
  'example_audio',
]);

export const lemmaAssetStorageKindSchema = z.enum(['pack_relative', 'cos']);

export const cefrLevelSchema = z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

export const definitionZhContentSchema = z
  .object({
    text: z.string().min(1),
    pos: z.string().min(1).optional(),
  })
  .strict();

export const definitionEnContentSchema = z
  .object({
    text: z.string().min(1),
  })
  .strict();

export const exampleContentSchema = z
  .object({
    en: z.string().min(1),
    zh: z.string().min(1),
    note: z.string().min(1).optional(),
  })
  .strict();

export const mnemonicContentSchema = z
  .object({
    text: z.string().min(1),
  })
  .strict();

export const morphologyContentSchema = z
  .object({
    root: z.string().min(1).optional(),
    prefix: z.string().min(1).optional(),
    suffix: z.string().min(1).optional(),
    breakdown: z.string().min(1).optional(),
  })
  .strict();

export const noteContentSchema = z
  .object({
    text: z.string().min(1),
  })
  .strict();

export const lemmaFragmentContentSchema = z.discriminatedUnion('fragmentType', [
  z
    .object({
      fragmentType: z.literal('definition_zh'),
      content: definitionZhContentSchema,
    })
    .strict(),
  z
    .object({
      fragmentType: z.literal('definition_en'),
      content: definitionEnContentSchema,
    })
    .strict(),
  z
    .object({
      fragmentType: z.literal('example'),
      content: exampleContentSchema,
    })
    .strict(),
  z
    .object({
      fragmentType: z.literal('mnemonic'),
      content: mnemonicContentSchema,
    })
    .strict(),
  z
    .object({
      fragmentType: z.literal('morphology'),
      content: morphologyContentSchema,
    })
    .strict(),
  z
    .object({
      fragmentType: z.literal('note'),
      content: noteContentSchema,
    })
    .strict(),
]);

export const adminLexiconTagSchema = z
  .object({
    tagKey: z.string().min(1).max(64),
    labelZh: z.string().min(1).max(64),
  })
  .strict();

export const adminLexiconFragmentSchema = z
  .object({
    id: z.uuid(),
    fragmentType: fragmentTypeSchema,
    content: z.record(z.string(), z.unknown()),
    sortOrder: z.number().int().nonnegative(),
    source: fragmentSourceSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .strict();

export const adminLexiconFormSchema = z
  .object({
    formKey: z.string().min(1).max(128),
    formType: lemmaFormTypeSchema,
    displayForm: z.string().min(1).max(128),
    source: fragmentSourceSchema,
    createdAt: z.iso.datetime(),
  })
  .strict();

export const adminLexiconAssetSchema = z
  .object({
    id: z.uuid(),
    assetKind: lemmaAssetKindSchema,
    storageKind: lemmaAssetStorageKindSchema,
    pathOrKey: z.string().min(1),
    sha256: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .optional(),
    durationMs: z.number().int().nonnegative().optional(),
    mimeType: z.string().min(1).optional(),
    voiceId: z.string().min(1).optional(),
    ttsText: z.string().min(1).optional(),
    createdAt: z.iso.datetime(),
  })
  .strict();

export const adminLexiconSummarySchema = z
  .object({
    lemmaKey: z.string().min(1).max(128),
    headword: z.string().min(1).max(128),
    status: lemmaStatusSchema,
    ipa: z.string().min(1).optional(),
    pos: z.string().min(1).optional(),
    source: lemmaSourceSchema,
    cefrLevel: cefrLevelSchema.optional(),
    difficultyLevel: z.number().int().min(1).max(10).optional(),
  })
  .strict();

export const adminLexiconDetailSchema = adminLexiconSummarySchema
  .extend({
    id: z.uuid(),
    frequencyBnc: z.number().int().nonnegative().optional(),
    frequencyFrq: z.number().int().nonnegative().optional(),
    collinsStar: z.number().int().min(0).max(5).optional(),
    oxfordCore: z.boolean().optional(),
    importBatchId: z.uuid().optional(),
    publishedAt: z.iso.datetime().optional(),
    publishedByAdminId: z.uuid().optional(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    fragments: z.array(adminLexiconFragmentSchema),
    forms: z.array(adminLexiconFormSchema),
    assets: z.array(adminLexiconAssetSchema),
    tags: z.array(adminLexiconTagSchema),
  })
  .strict();

export const adminLexiconSearchQuerySchema = z
  .object({
    q: z.string().trim().max(128).optional(),
    status: lemmaStatusSchema.optional(),
    sortBy: z.enum(['headword', 'lemmaKey', 'status', 'ipa', 'pos', 'source']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().nonnegative().default(0),
  })
  .strict();

export const adminLexiconSearchResponseSchema = z
  .object({
    items: z.array(adminLexiconSummarySchema),
    total: z.number().int().nonnegative(),
    limit: z.number().int().positive(),
    offset: z.number().int().nonnegative(),
  })
  .strict();

export const adminLexiconByFormResponseSchema = z
  .object({
    formKey: z.string().min(1).max(128),
    lemma: adminLexiconDetailSchema,
  })
  .strict();

export const adminLexiconBatchGetRequestSchema = z
  .object({
    lemmaKeys: z.array(z.string().min(1).max(128)).min(1).max(200),
  })
  .strict();

export const adminLexiconBatchGetResponseSchema = z
  .object({
    items: z.array(adminLexiconDetailSchema),
    missingLemmaKeys: z.array(z.string().min(1).max(128)),
  })
  .strict();

const lemmaFragmentPatchSchema = z
  .object({
    id: z.uuid().optional(),
    fragmentType: fragmentTypeSchema,
    content: z.record(z.string(), z.unknown()),
    sortOrder: z.number().int().nonnegative(),
    source: fragmentSourceSchema,
    delete: z.literal(true).optional(),
  })
  .strict()
  .refine((value) => !(value.delete === true && value.id === undefined), {
    message: 'delete requires id',
  });

const lemmaFormPatchSchema = z
  .object({
    formKey: z.string().min(1).max(128),
    formType: lemmaFormTypeSchema,
    displayForm: z.string().min(1).max(128),
    source: fragmentSourceSchema,
    delete: z.literal(true).optional(),
  })
  .strict();

const lemmaAssetPatchSchema = z
  .object({
    id: z.uuid().optional(),
    assetKind: lemmaAssetKindSchema,
    storageKind: lemmaAssetStorageKindSchema,
    pathOrKey: z.string().min(1),
    sha256: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .optional(),
    durationMs: z.number().int().nonnegative().optional(),
    mimeType: z.string().min(1).optional(),
    voiceId: z.string().min(1).optional(),
    ttsText: z.string().min(1).optional(),
    delete: z.literal(true).optional(),
  })
  .strict()
  .refine((value) => !(value.delete === true && value.id === undefined), {
    message: 'delete requires id',
  });

export const adminLexiconLemmaPatchSchema = z
  .object({
    lemmaKey: z.string().min(1).max(128),
    headword: z.string().min(1).max(128).optional(),
    ipa: z.string().min(1).nullable().optional(),
    pos: z.string().min(1).nullable().optional(),
    status: lemmaStatusSchema.optional(),
    source: lemmaSourceSchema.optional(),
    difficultyLevel: z.number().int().min(1).max(10).nullable().optional(),
    cefrLevel: cefrLevelSchema.nullable().optional(),
    tagKeys: z.array(z.string().min(1).max(64)).optional(),
    fragments: z.array(lemmaFragmentPatchSchema).optional(),
    forms: z.array(lemmaFormPatchSchema).optional(),
    assets: z.array(lemmaAssetPatchSchema).optional(),
  })
  .strict();

export const adminLexiconPatchRequestSchema = z
  .object({
    patches: z.array(adminLexiconLemmaPatchSchema).min(1).max(50),
  })
  .strict();

export const adminLexiconPatchResponseSchema = z
  .object({
    updatedLemmaKeys: z.array(z.string().min(1).max(128)),
  })
  .strict();

export const adminLexiconEnrichRequestSchema = z
  .object({
    lemmaKey: z.string().min(1).max(128),
    fragmentTypes: z.array(fragmentTypeSchema).min(1).max(6),
    context: z.string().trim().max(2000).optional(),
  })
  .strict();

export const adminLexiconEnrichResponseSchema = z
  .object({
    lemmaKey: z.string().min(1).max(128),
    draftFragments: z.array(
      z
        .object({
          fragmentType: fragmentTypeSchema,
          content: z.record(z.string(), z.unknown()),
          sortOrder: z.number().int().nonnegative(),
          source: z.literal('llm'),
        })
        .strict(),
    ),
  })
  .strict();

export type LemmaStatus = z.infer<typeof lemmaStatusSchema>;
export type LemmaSource = z.infer<typeof lemmaSourceSchema>;
export type FragmentType = z.infer<typeof fragmentTypeSchema>;
export type AdminLexiconSummary = z.infer<typeof adminLexiconSummarySchema>;
export type AdminLexiconDetail = z.infer<typeof adminLexiconDetailSchema>;
export type AdminLexiconSearchQuery = z.infer<typeof adminLexiconSearchQuerySchema>;
export type AdminLexiconSearchResponse = z.infer<typeof adminLexiconSearchResponseSchema>;
export type AdminLexiconByFormResponse = z.infer<typeof adminLexiconByFormResponseSchema>;
export type AdminLexiconBatchGetRequest = z.infer<typeof adminLexiconBatchGetRequestSchema>;
export type AdminLexiconBatchGetResponse = z.infer<typeof adminLexiconBatchGetResponseSchema>;
export type AdminLexiconLemmaPatch = z.infer<typeof adminLexiconLemmaPatchSchema>;
export type AdminLexiconPatchRequest = z.infer<typeof adminLexiconPatchRequestSchema>;
export type AdminLexiconPatchResponse = z.infer<typeof adminLexiconPatchResponseSchema>;
export type AdminLexiconEnrichRequest = z.infer<typeof adminLexiconEnrichRequestSchema>;
export type AdminLexiconEnrichResponse = z.infer<typeof adminLexiconEnrichResponseSchema>;
