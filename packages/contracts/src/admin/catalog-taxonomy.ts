import { z } from 'zod';
import {
  catalogPrimaryTaxonomyNodeSchema,
  catalogSecondaryTaxonomyNodeSchema,
  catalogTaxonomyNodeStatusSchema,
  catalogTaxonomyResponseSchema,
  catalogVersionTaxonomyNodeSchema,
} from '../catalog/taxonomy.js';

export const adminCatalogTaxonomyResponseSchema = catalogTaxonomyResponseSchema;

export const adminCreatePrimaryTaxonomyNodeRequestSchema = z
  .object({
    slug: z.string().min(1).max(64),
    label: z.string().min(1).max(64),
    sortOrder: z.number().int().nonnegative().optional(),
    status: catalogTaxonomyNodeStatusSchema.default('active'),
  })
  .strict();

export const adminUpdatePrimaryTaxonomyNodeRequestSchema =
  adminCreatePrimaryTaxonomyNodeRequestSchema.partial().strip();

export const adminCreateSecondaryTaxonomyNodeRequestSchema = z
  .object({
    slug: z.string().min(1).max(64),
    label: z.string().min(1).max(64),
    sortOrder: z.number().int().nonnegative().optional(),
    status: catalogTaxonomyNodeStatusSchema.default('active'),
  })
  .strict();

export const adminUpdateSecondaryTaxonomyNodeRequestSchema =
  adminCreateSecondaryTaxonomyNodeRequestSchema.partial().strip();

export const adminCreateVersionTaxonomyNodeRequestSchema = z
  .object({
    slug: z.string().min(1).max(64),
    label: z.string().min(1).max(64),
    sortOrder: z.number().int().nonnegative().optional(),
    status: catalogTaxonomyNodeStatusSchema.default('active'),
  })
  .strict();

export const adminUpdateVersionTaxonomyNodeRequestSchema =
  adminCreateVersionTaxonomyNodeRequestSchema.partial().strip();

export const adminPrimaryTaxonomyNodeResponseSchema = catalogPrimaryTaxonomyNodeSchema.omit({
  children: true,
});

export const adminSecondaryTaxonomyNodeResponseSchema = catalogSecondaryTaxonomyNodeSchema;

export const adminVersionTaxonomyNodeResponseSchema = catalogVersionTaxonomyNodeSchema;

export type AdminCatalogTaxonomyResponse = z.infer<typeof adminCatalogTaxonomyResponseSchema>;
export type AdminCreatePrimaryTaxonomyNodeRequest = z.infer<
  typeof adminCreatePrimaryTaxonomyNodeRequestSchema
>;
export type AdminUpdatePrimaryTaxonomyNodeRequest = z.infer<
  typeof adminUpdatePrimaryTaxonomyNodeRequestSchema
>;
export type AdminCreateSecondaryTaxonomyNodeRequest = z.infer<
  typeof adminCreateSecondaryTaxonomyNodeRequestSchema
>;
export type AdminUpdateSecondaryTaxonomyNodeRequest = z.infer<
  typeof adminUpdateSecondaryTaxonomyNodeRequestSchema
>;
export type AdminCreateVersionTaxonomyNodeRequest = z.infer<
  typeof adminCreateVersionTaxonomyNodeRequestSchema
>;
export type AdminUpdateVersionTaxonomyNodeRequest = z.infer<
  typeof adminUpdateVersionTaxonomyNodeRequestSchema
>;
