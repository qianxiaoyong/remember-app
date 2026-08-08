import type { CatalogPrimaryCategory, CatalogPackItem } from '../catalog/catalog-seed';
import { catalogSeed } from '../catalog/catalog-seed';

export interface MarketCatalogQuery {
  primaryCategory: CatalogPrimaryCategory;
  secondaryCategory: string;
  versionFilter: string;
  keyword: string;
}

/** 市场/搜索可见：不以 APK 内置 seed 注入；Story 测试包永不展示。 */
export function isMarketVisibleCatalogItem(item: CatalogPackItem): boolean {
  return item.packId !== 'story-test-pack';
}

export function filterCatalogItems(
  items: CatalogPackItem[],
  query: MarketCatalogQuery,
): CatalogPackItem[] {
  const keyword = query.keyword.trim().toLowerCase();
  return items.filter((item) => {
    if (query.primaryCategory !== 'all' && item.primaryCategory !== query.primaryCategory) {
      return false;
    }
    if (query.secondaryCategory !== '全部' && item.secondaryCategory !== query.secondaryCategory) {
      return false;
    }
    if (query.versionFilter !== '全部版本' && item.version !== query.versionFilter) {
      return false;
    }
    if (keyword && !item.title.toLowerCase().includes(keyword)) {
      return false;
    }
    return true;
  });
}

export function filterMarketCatalogItems(
  items: CatalogPackItem[],
  query: MarketCatalogQuery,
): CatalogPackItem[] {
  return filterCatalogItems(items.filter(isMarketVisibleCatalogItem), query);
}

/** 离线且无 API 缓存时的本地 mock；不含 Story 测试包，也不注入内置包。 */
export function filterLocalCatalogSeed(query: MarketCatalogQuery): CatalogPackItem[] {
  return filterMarketCatalogItems(
    catalogSeed.filter((item) => !item.isBundledTestPack),
    query,
  );
}
