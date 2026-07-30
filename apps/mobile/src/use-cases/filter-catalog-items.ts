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
