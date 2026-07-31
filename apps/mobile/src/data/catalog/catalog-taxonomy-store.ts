import type { CatalogTaxonomyResponse } from '@remember/contracts';
import type { CatalogPrimaryCategory } from '../../catalog/catalog-seed';
import {
  CATALOG_PRIMARY_OPTIONS,
  CATALOG_VERSION_OPTIONS,
  listSecondaryCategories,
} from '../../catalog/catalog-seed';

let memoryTaxonomy: CatalogTaxonomyResponse | null = null;

export function readCachedCatalogTaxonomy(): CatalogTaxonomyResponse | null {
  return memoryTaxonomy;
}

export function writeCachedCatalogTaxonomy(taxonomy: CatalogTaxonomyResponse): void {
  memoryTaxonomy = taxonomy;
}

export function getPrimaryTabOptions(
  taxonomy: CatalogTaxonomyResponse | null,
): { id: CatalogPrimaryCategory; label: string }[] {
  if (!taxonomy || taxonomy.primaries.length === 0) {
    return CATALOG_PRIMARY_OPTIONS;
  }

  return [
    { id: 'all', label: '全部' },
    ...taxonomy.primaries.map((primary) => ({
      id: primary.slug as CatalogPrimaryCategory,
      label: primary.label,
    })),
  ];
}

export function getSecondaryCategoryOptions(
  taxonomy: CatalogTaxonomyResponse | null,
  primaryCategory: CatalogPrimaryCategory,
): string[] {
  if (primaryCategory === 'all') {
    return ['全部'];
  }

  if (!taxonomy) {
    return listSecondaryCategories(primaryCategory);
  }

  const primary = taxonomy.primaries.find((node) => node.slug === primaryCategory);
  if (!primary) {
    return ['全部'];
  }

  return ['全部', ...primary.children.map((child) => child.label)];
}

export function getVersionFilterOptions(taxonomy: CatalogTaxonomyResponse | null): string[] {
  if (!taxonomy || taxonomy.versions.length === 0) {
    return [...CATALOG_VERSION_OPTIONS];
  }

  return ['全部版本', ...taxonomy.versions.map((version) => version.label)];
}
