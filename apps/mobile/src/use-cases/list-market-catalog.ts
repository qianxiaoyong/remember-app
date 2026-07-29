import type { CatalogPackItem, CatalogPrimaryCategory } from '../catalog/catalog-seed';
import { catalogSeed } from '../catalog/catalog-seed';

export interface MarketCatalogQuery {
  primaryCategory: CatalogPrimaryCategory;
  secondaryCategory: string;
  versionFilter: string;
  keyword: string;
}

export function listMarketCatalog(query: MarketCatalogQuery): CatalogPackItem[] {
  const keyword = query.keyword.trim().toLowerCase();
  return catalogSeed.filter((item) => {
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
