import type { CatalogPackItem } from '../catalog/catalog-seed';
import { mapCatalogDetailToItem } from '../catalog/map-catalog-api';
import { fetchCatalogPackDetail } from '../data/api/catalog-api';
import { shouldUseOfflineCatalogFallback } from '../data/api/api-errors';
import { findCatalogItemOffline } from '../data/catalog/catalog-cache-store';

export async function resolveCatalogItemForDetail(packId: string): Promise<CatalogPackItem | null> {
  try {
    const detail = await fetchCatalogPackDetail(packId);
    return mapCatalogDetailToItem(detail);
  } catch (error) {
    if (!shouldUseOfflineCatalogFallback(error)) {
      throw error;
    }
    return findCatalogItemOffline(packId);
  }
}
