import { mapCatalogSummaryToItem } from '../catalog/map-catalog-api';
import { fetchCatalogPacks } from '../data/api/catalog-api';
import { shouldUseOfflineCatalogFallback } from '../data/api/api-errors';
import type { CatalogPackItem, CatalogPrimaryCategory } from '../catalog/catalog-seed';
import {
  readCatalogMemoryCache,
  resolveOfflineCatalog,
  writeCatalogMemoryCache,
} from '../data/catalog/catalog-cache-store';
import {
  filterCatalogItems,
  filterLocalCatalogSeed,
  type MarketCatalogQuery,
} from './filter-catalog-items';

export type { MarketCatalogQuery };

export async function fetchMarketCatalog(query: MarketCatalogQuery): Promise<CatalogPackItem[]> {
  try {
    const summaries = await fetchCatalogPacks({
      ...(query.primaryCategory !== 'all' ? { primaryCategory: query.primaryCategory } : {}),
      ...(query.secondaryCategory !== '全部' ? { secondaryCategory: query.secondaryCategory } : {}),
      ...(query.versionFilter !== '全部版本' ? { versionLabel: query.versionFilter } : {}),
      ...(query.keyword.trim() ? { keyword: query.keyword.trim() } : {}),
    });
    const items = summaries.map(mapCatalogSummaryToItem);

    const existing = readCatalogMemoryCache() ?? [];
    const merged = mergeCatalogCache(existing, items);
    writeCatalogMemoryCache(merged);

    return filterCatalogItems(merged, query);
  } catch (error) {
    if (shouldUseOfflineCatalogFallback(error)) {
      return resolveOfflineCatalog(query);
    }
    throw error;
  }
}

function mergeCatalogCache(
  existing: CatalogPackItem[],
  fresh: CatalogPackItem[],
): CatalogPackItem[] {
  const byId = new Map(existing.map((item) => [item.packId, item]));
  for (const item of fresh) {
    byId.set(item.packId, item);
  }
  return [...byId.values()];
}

export function listSecondaryCategories(primaryCategory: CatalogPrimaryCategory): string[] {
  if (primaryCategory === 'primary') {
    return ['全部', '一年级', '二年级', '三年级', '四年级', '五年级', '六年级'];
  }
  if (primaryCategory === 'junior') {
    return ['全部', '七年级', '八年级', '九年级'];
  }
  if (primaryCategory === 'senior') {
    return ['全部', '高一', '高二', '高三'];
  }
  if (primaryCategory === 'postgraduate') {
    return ['全部', '考研英语'];
  }
  return ['全部'];
}

/** @deprecated 使用 fetchMarketCatalog */
export function listMarketCatalog(query: MarketCatalogQuery): CatalogPackItem[] {
  return filterLocalCatalogSeed(query);
}
