import type { CatalogPackItem } from '../catalog/catalog-seed';
import { listMarketCatalog } from './list-market-catalog';

export function searchMarketCatalog(keyword: string): CatalogPackItem[] {
  return listMarketCatalog({
    keyword,
    primaryCategory: 'all',
    secondaryCategory: '全部',
    versionFilter: '全部版本',
  });
}
