import type {
  AdminPrimaryTaxonomyNodeResponse,
  AdminSecondaryTaxonomyNodeResponse,
  AdminVersionTaxonomyNodeResponse,
} from '@remember/contracts';
import {
  adminPrimaryTaxonomyNodeResponseSchema,
  adminSecondaryTaxonomyNodeResponseSchema,
  adminVersionTaxonomyNodeResponseSchema,
} from '@remember/contracts';
import type { CatalogPrimaryNode, CatalogSecondaryNode, CatalogVersionNode } from '@prisma/client';

export function toAdminPrimaryTaxonomyNode(
  node: CatalogPrimaryNode,
): AdminPrimaryTaxonomyNodeResponse {
  return adminPrimaryTaxonomyNodeResponseSchema.parse({
    id: node.id,
    slug: node.slug,
    label: node.label,
    sortOrder: node.sortOrder,
    status: node.status,
  });
}

export function toAdminSecondaryTaxonomyNode(
  node: CatalogSecondaryNode,
): AdminSecondaryTaxonomyNodeResponse {
  return adminSecondaryTaxonomyNodeResponseSchema.parse({
    id: node.id,
    slug: node.slug,
    label: node.label,
    sortOrder: node.sortOrder,
    status: node.status,
  });
}

export function toAdminVersionTaxonomyNode(
  node: CatalogVersionNode,
): AdminVersionTaxonomyNodeResponse {
  return adminVersionTaxonomyNodeResponseSchema.parse({
    id: node.id,
    slug: node.slug,
    label: node.label,
    sortOrder: node.sortOrder,
    status: node.status,
  });
}
