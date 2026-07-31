import { describe, expect, it } from 'vitest';
import type { CatalogPackSummary } from '@remember/contracts';
import { mapCatalogSummaryToItem } from './map-catalog-api';

describe('mapCatalogSummaryToItem', () => {
  it('maps summary from catalog list API', () => {
    const summary: CatalogPackSummary = {
      packId: 'en-grade3-v1-rj',
      title: '三年级上册人教版单词表',
      primaryCategory: 'primary',
      secondaryCategory: '三年级',
      versionLabel: '人教版',
      contentTags: [],
      cardCount: 112,
      sizeLabel: '约 1.1 MB',
      updatedAt: '2026-07-31T06:28:05.287Z',
      priceCents: 100,
      summary: '三年级上册人教版单词表',
    };

    expect(mapCatalogSummaryToItem(summary).summary).toBe('三年级上册人教版单词表');
  });
});
