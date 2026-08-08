import { catalogTaxonomyResponseSchema, type CatalogTaxonomyResponse } from '@remember/contracts';
import * as SecureStore from 'expo-secure-store';
import type { CatalogPrimaryCategory } from '../../catalog/catalog-seed';
import {
  CATALOG_ALL_VERSION_LABEL,
  CATALOG_PRIMARY_OPTIONS,
  listSecondaryCategories,
} from '../../catalog/catalog-seed';

const TAXONOMY_CACHE_KEY = 'remember.catalogTaxonomy.v1';

let memoryTaxonomy: CatalogTaxonomyResponse | null = null;

export function readCachedCatalogTaxonomy(): CatalogTaxonomyResponse | null {
  return memoryTaxonomy;
}

export function writeCachedCatalogTaxonomy(taxonomy: CatalogTaxonomyResponse): void {
  memoryTaxonomy = taxonomy;
  void SecureStore.setItemAsync(TAXONOMY_CACHE_KEY, JSON.stringify(taxonomy));
}

/** 启动时读磁盘缓存，避免 taxonomy 仅内存导致回退写死分类。 */
export async function readCatalogTaxonomyDiskCache(): Promise<CatalogTaxonomyResponse | null> {
  const raw = await SecureStore.getItemAsync(TAXONOMY_CACHE_KEY);
  if (!raw) {
    return memoryTaxonomy;
  }

  try {
    const parsed = catalogTaxonomyResponseSchema.parse(JSON.parse(raw));
    memoryTaxonomy = parsed;
    return parsed;
  } catch {
    return memoryTaxonomy;
  }
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
  if (taxonomy && taxonomy.versions.length > 0) {
    return [CATALOG_ALL_VERSION_LABEL, ...taxonomy.versions.map((version) => version.label)];
  }

  // 无 API taxonomy 时不臆造版本列表，避免后台新增项被写死 fallback 遮挡。
  return [CATALOG_ALL_VERSION_LABEL];
}
