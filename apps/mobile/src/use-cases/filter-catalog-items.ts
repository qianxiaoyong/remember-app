import type { CatalogPrimaryCategory, CatalogPackItem } from '../catalog/catalog-seed';
import { catalogSeed } from '../catalog/catalog-seed';

export interface MarketCatalogQuery {
  primaryCategory: CatalogPrimaryCategory;
  secondaryCategory: string;
  versionFilter: string;
  keyword: string;
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

export function filterLocalCatalogSeed(query: MarketCatalogQuery): CatalogPackItem[] {
  return filterCatalogItems(catalogSeed, query);
}

/** APK 内带独立 zip 的内置包；市场目录在 API 未登记时仍注入。 */
export const PRIMARY_BUNDLED_CATALOG_PACK_IDS = ['remember-test-pack', 'story-test-pack'] as const;

/** APK 内置测试包：注入市场目录，API 未登记时仍可发现与安装；不覆盖已有 packId。 */
export function injectBundledCatalogSeedItems(items: CatalogPackItem[]): CatalogPackItem[] {
  const bundled = catalogSeed.filter(
    (item) =>
      item.isBundledTestPack &&
      (PRIMARY_BUNDLED_CATALOG_PACK_IDS as readonly string[]).includes(item.packId),
  );
  const byId = new Map(items.map((item) => [item.packId, item]));
  for (const item of bundled) {
    if (!byId.has(item.packId)) {
      byId.set(item.packId, item);
    }
  }
  return [...byId.values()];
}
