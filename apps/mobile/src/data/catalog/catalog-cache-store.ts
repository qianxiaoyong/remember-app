import * as SecureStore from 'expo-secure-store';
import { findCatalogItem, type CatalogPackItem } from '../../catalog/catalog-seed';
import type { MarketCatalogQuery } from '../../use-cases/filter-catalog-items';
import { filterCatalogItems, filterLocalCatalogSeed } from '../../use-cases/filter-catalog-items';

const CACHE_KEY = 'remember.catalogCache.v1';

let memoryCache: CatalogPackItem[] | null = null;

export function readCatalogMemoryCache(): CatalogPackItem[] | null {
  return memoryCache;
}

export function writeCatalogMemoryCache(items: CatalogPackItem[]): void {
  memoryCache = items;
  void SecureStore.setItemAsync(CACHE_KEY, JSON.stringify(items));
}

export async function readCatalogDiskCache(): Promise<CatalogPackItem[] | null> {
  const raw = await SecureStore.getItemAsync(CACHE_KEY);
  if (!raw) {
    return memoryCache;
  }
  try {
    const parsed = JSON.parse(raw) as CatalogPackItem[];
    memoryCache = parsed;
    return parsed;
  } catch {
    return memoryCache;
  }
}

export async function resolveOfflineCatalog(query: MarketCatalogQuery): Promise<CatalogPackItem[]> {
  const cached = memoryCache ?? (await readCatalogDiskCache());
  if (cached && cached.length > 0) {
    return filterCatalogItems(cached, query);
  }
  return filterLocalCatalogSeed(query);
}

export async function findCatalogItemOffline(packId: string): Promise<CatalogPackItem | null> {
  const cached = memoryCache ?? (await readCatalogDiskCache());
  const fromCache = cached?.find((item) => item.packId === packId) ?? null;
  if (fromCache) {
    return fromCache;
  }
  return findCatalogItem(packId);
}
