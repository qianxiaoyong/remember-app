import { z } from 'zod';
import { catalogPrimaryCategorySchema } from './pack-summary.js';
import { catalogPackSummarySchema } from './pack-summary.js';

export const listCatalogPacksQuerySchema = z
  .object({
    primaryCategory: catalogPrimaryCategorySchema.optional(),
    secondaryCategory: z.string().min(1).optional(),
    versionLabel: z.string().min(1).optional(),
    keyword: z.string().optional(),
  })
  .strict();

export const listCatalogPacksResponseSchema = z
  .object({
    items: z.array(catalogPackSummarySchema),
  })
  .strict();

export type ListCatalogPacksQuery = z.infer<typeof listCatalogPacksQuerySchema>;
export type ListCatalogPacksResponse = z.infer<typeof listCatalogPacksResponseSchema>;
