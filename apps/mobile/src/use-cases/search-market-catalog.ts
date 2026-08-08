import type { CatalogPackItem } from '../catalog/catalog-seed';
import { CATALOG_ALL_VERSION_LABEL } from '../catalog/catalog-seed';
import { fetchMarketCatalog } from './fetch-market-catalog';

export async function searchMarketCatalog(keyword: string): Promise<CatalogPackItem[]> {
  return fetchMarketCatalog({
    primaryCategory: 'all',
    secondaryCategory: '全部',
    versionFilter: CATALOG_ALL_VERSION_LABEL,
    keyword,
  });
}
