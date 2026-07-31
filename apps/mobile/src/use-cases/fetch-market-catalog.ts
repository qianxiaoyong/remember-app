import { mapCatalogSummaryToItem } from '../catalog/map-catalog-api';
import { fetchCatalogPacks } from '../data/api/catalog-api';
import { shouldUseOfflineCatalogFallback } from '../data/api/api-errors';
import type { CatalogPackItem, CatalogPrimaryCategory } from '../catalog/catalog-seed';
import {
  readCatalogDiskCache,
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

const FULL_CATALOG_QUERY: MarketCatalogQuery = {
  primaryCategory: 'all',
  secondaryCategory: '全部',
  versionFilter: '全部版本',
  keyword: '',
};

/** 先读本地缓存，供市场页秒开；无缓存返回 null。 */
export async function readCachedMarketCatalog(
  query: MarketCatalogQuery,
): Promise<CatalogPackItem[] | null> {
  const cached = readCatalogMemoryCache() ?? (await readCatalogDiskCache());
  if (!cached || cached.length === 0) {
    return null;
  }
  return filterCatalogItems(cached, query);
}

/** App 启动时后台拉全量目录写入缓存；失败静默。 */
export async function warmCatalogCacheFromNetwork(): Promise<boolean> {
  try {
    await fetchMarketCatalog(FULL_CATALOG_QUERY);
    return true;
  } catch {
    return false;
  }
}

export async function fetchMarketCatalog(query: MarketCatalogQuery): Promise<CatalogPackItem[]> {
  try {
    // 始终拉全量目录再本地筛选，避免带筛选请求污染/截断缓存。
    const summaries = await fetchCatalogPacks({});
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
