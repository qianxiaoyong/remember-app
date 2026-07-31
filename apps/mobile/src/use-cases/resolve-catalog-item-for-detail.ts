import type { CatalogPackItem } from '../catalog/catalog-seed';
import { mapCatalogDetailToItem } from '../catalog/map-catalog-api';
import { fetchCatalogPackDetail } from '../data/api/catalog-api';
import { shouldUseOfflineCatalogFallback } from '../data/api/api-errors';
import {
  findCatalogItemOffline,
  readCatalogMemoryCache,
  writeCatalogMemoryCache,
} from '../data/catalog/catalog-cache-store';

function mergeCatalogItemIntoCache(item: CatalogPackItem): void {
  const existing = readCatalogMemoryCache() ?? [];
  const index = existing.findIndex((row) => row.packId === item.packId);
  if (index >= 0) {
    const next = [...existing];
    next[index] = { ...next[index], ...item };
    writeCatalogMemoryCache(next);
    return;
  }
  writeCatalogMemoryCache([...existing, item]);
}

export async function resolveCatalogItemForDetail(packId: string): Promise<CatalogPackItem | null> {
  try {
    const detail = await fetchCatalogPackDetail(packId);
    const item = mapCatalogDetailToItem(detail);
    mergeCatalogItemIntoCache(item);
    return item;
  } catch (error) {
    if (!shouldUseOfflineCatalogFallback(error)) {
      throw error;
    }
    return findCatalogItemOffline(packId);
  }
}
