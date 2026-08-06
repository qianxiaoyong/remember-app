import type { CatalogPackItem } from './catalog-seed';
import { findCatalogItemSync } from '../data/catalog/catalog-cache-store';

export function buildFallbackCatalogItem(packId: string, displayName: string): CatalogPackItem {
  return {
    packId,
    title: displayName,
    primaryCategory: 'primary',
    secondaryCategory: '全部',
    version: '人教版',
    contentTags: ['词汇'],
    cardCount: 0,
    sizeLabel: '',
    updatedAt: '',
    priceCents: 0,
    priceLabel: '',
    summary: '',
    sampleHeadwords: [],
    isBundledTestPack: false,
  };
}

export function resolveCatalogItemForPack(packId: string, displayName: string): CatalogPackItem {
  return findCatalogItemSync(packId) ?? buildFallbackCatalogItem(packId, displayName);
}
