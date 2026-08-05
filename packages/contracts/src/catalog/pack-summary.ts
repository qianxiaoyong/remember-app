import { z } from 'zod';
import { includedHighlightSchema } from './included-highlight.js';
import { catalogPackTaxonomySchema } from './taxonomy.js';

export const catalogPrimaryCategorySchema = z.enum(['primary', 'junior', 'senior', 'postgraduate']);

export const catalogPackSummarySchema = z
  .object({
    packId: z.string().min(1),
    title: z.string().min(1),
    displayTitle: z.string().min(1).optional(),
    primaryCategory: catalogPrimaryCategorySchema,
    secondaryCategory: z.string().min(1),
    versionLabel: z.string().min(1),
    contentTags: z.array(z.string()),
    cardCount: z.number().int().positive(),
    sizeLabel: z.string().min(1),
    updatedAt: z.iso.datetime(),
    priceCents: z.number().int().nonnegative(),
    summary: z.string().min(1),
    coverUrl: z.url().optional(),
    coverBadge: z.string().min(1).optional(),
    coverLines: z.array(z.string()).optional(),
    includedHighlights: z.array(includedHighlightSchema).max(4).optional(),
    isBundledTestPack: z.boolean().optional(),
    currentPackVersion: z.string().min(1).optional(),
    protocolVersion: z.number().int().positive().optional(),
    taxonomy: catalogPackTaxonomySchema.optional(),
  })
  .strict();

export type CatalogPackSummary = z.infer<typeof catalogPackSummarySchema>;
