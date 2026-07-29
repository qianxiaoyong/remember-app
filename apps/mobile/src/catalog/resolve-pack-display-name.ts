import { findCatalogItem } from './catalog-seed';

export function resolvePackDisplayName(packId: string): string {
  return findCatalogItem(packId)?.title ?? packId;
}
