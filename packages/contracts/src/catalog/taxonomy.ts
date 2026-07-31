import { z } from 'zod';

export const catalogTaxonomyNodeStatusSchema = z.enum(['active', 'archived']);

export const catalogSecondaryTaxonomyNodeSchema = z
  .object({
    id: z.uuid(),
    slug: z.string().min(1),
    label: z.string().min(1),
    sortOrder: z.number().int().nonnegative(),
    status: catalogTaxonomyNodeStatusSchema,
  })
  .strict();

export const catalogPrimaryTaxonomyNodeSchema = z
  .object({
    id: z.uuid(),
    slug: z.string().min(1),
    label: z.string().min(1),
    sortOrder: z.number().int().nonnegative(),
    status: catalogTaxonomyNodeStatusSchema,
    children: z.array(catalogSecondaryTaxonomyNodeSchema),
  })
  .strict();

export const catalogVersionTaxonomyNodeSchema = z
  .object({
    id: z.uuid(),
    slug: z.string().min(1),
    label: z.string().min(1),
    sortOrder: z.number().int().nonnegative(),
    status: catalogTaxonomyNodeStatusSchema,
  })
  .strict();

export const catalogTaxonomyResponseSchema = z
  .object({
    primaries: z.array(catalogPrimaryTaxonomyNodeSchema),
    versions: z.array(catalogVersionTaxonomyNodeSchema),
  })
  .strict();

/** Pack 在 catalog API 中带上的分类挂载（展示 + 筛选）。 */
export const catalogPackTaxonomySchema = z
  .object({
    primaryNodeId: z.uuid(),
    secondaryNodeId: z.uuid(),
    versionNodeId: z.uuid(),
    primaryLabel: z.string().min(1),
    secondaryLabel: z.string().min(1),
    versionLabel: z.string().min(1),
    /** 过渡期：与旧客户端/filter 兼容的稳定 slug */
    primarySlug: z.string().min(1),
  })
  .strict();

export type CatalogTaxonomyResponse = z.infer<typeof catalogTaxonomyResponseSchema>;
export type CatalogPackTaxonomy = z.infer<typeof catalogPackTaxonomySchema>;
export type CatalogPrimaryTaxonomyNode = z.infer<typeof catalogPrimaryTaxonomyNodeSchema>;
export type CatalogSecondaryTaxonomyNode = z.infer<typeof catalogSecondaryTaxonomyNodeSchema>;
export type CatalogVersionTaxonomyNode = z.infer<typeof catalogVersionTaxonomyNodeSchema>;
