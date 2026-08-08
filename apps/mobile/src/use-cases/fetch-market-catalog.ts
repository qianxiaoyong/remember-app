import { mapCatalogSummaryToItem } from '../catalog/map-catalog-api';
import { fetchCatalogPacks, fetchCatalogTaxonomy } from '../data/api/catalog-api';
import { shouldUseOfflineCatalogFallback } from '../data/api/api-errors';
import { writeCachedCatalogTaxonomy } from '../data/catalog/catalog-taxonomy-store';
import type { CatalogPackItem } from '../catalog/catalog-seed';
import { CATALOG_ALL_VERSION_LABEL } from '../catalog/catalog-seed';
import {
  readCatalogDiskCache,
  readCatalogMemoryCache,
  resolveOfflineCatalog,
  writeCatalogMemoryCache,
} from '../data/catalog/catalog-cache-store';
import {
  filterMarketCatalogItems,
  filterLocalCatalogSeed,
  type MarketCatalogQuery,
} from './filter-catalog-items';

export type { MarketCatalogQuery };

const FULL_CATALOG_QUERY: MarketCatalogQuery = {
  primaryCategory: 'all',
  secondaryCategory: '全部',
  versionFilter: CATALOG_ALL_VERSION_LABEL,
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
  return filterMarketCatalogItems(cached, query);
}

/** App 启动时后台拉全量目录写入缓存；失败静默。 */
export async function warmCatalogCacheFromNetwork(): Promise<boolean> {
  try {
    await refreshCatalogTaxonomyFromNetwork();
    await fetchMarketCatalog(FULL_CATALOG_QUERY);
    return true;
  } catch {
    return false;
  }
}

/** @returns 是否成功写入 taxonomy 缓存 */
export async function refreshCatalogTaxonomyFromNetwork(): Promise<boolean> {
  try {
    const taxonomy = await fetchCatalogTaxonomy();
    writeCachedCatalogTaxonomy(taxonomy);
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

    return filterMarketCatalogItems(merged, query);
  } catch (error) {
    if (shouldUseOfflineCatalogFallback(error)) {
      return resolveOfflineCatalog(query);
    }
    throw error;
  }
}

function mergeCatalogItem(
  previous: CatalogPackItem | undefined,
  fresh: CatalogPackItem,
): CatalogPackItem {
  if (!previous) {
    return fresh;
  }
  const samplePreviews = fresh.samplePreviews ?? previous.samplePreviews;
  const introMedia = fresh.introMedia ?? previous.introMedia;
  const includedHighlights = fresh.includedHighlights ?? previous.includedHighlights;
  return {
    ...previous,
    ...fresh,
    ...(samplePreviews !== undefined ? { samplePreviews } : {}),
    ...(introMedia !== undefined ? { introMedia } : {}),
    ...(includedHighlights !== undefined ? { includedHighlights } : {}),
  };
}

/** API 全量列表为成员真源；下架/草稿包不在 fresh 中则从缓存移除。 */
function mergeCatalogCache(
  existing: CatalogPackItem[],
  fresh: CatalogPackItem[],
): CatalogPackItem[] {
  const existingById = new Map(existing.map((item) => [item.packId, item]));
  return fresh.map((item) => mergeCatalogItem(existingById.get(item.packId), item));
}

export { listSecondaryCategories } from '../catalog/catalog-seed';

/** @deprecated 使用 fetchMarketCatalog */
export function listMarketCatalog(query: MarketCatalogQuery): CatalogPackItem[] {
  return filterLocalCatalogSeed(query);
}
