import { findCatalogItemSync } from '../data/catalog/catalog-cache-store';

export function resolvePackDisplayName(packId: string): string {
  return findCatalogItemSync(packId)?.title ?? packId;
}
