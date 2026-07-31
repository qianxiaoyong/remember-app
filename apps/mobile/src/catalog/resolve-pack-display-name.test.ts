import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CatalogPackItem } from './catalog-seed';

const findCatalogItemSync = vi.fn<(packId: string) => CatalogPackItem | null>();

vi.mock('../data/catalog/catalog-cache-store', () => ({
  findCatalogItemSync: (packId: string) => findCatalogItemSync(packId),
}));

import { resolvePackDisplayName } from './resolve-pack-display-name';

const apiPack: CatalogPackItem = {
  packId: 'en-grade3-v1-rj',
  title: '三年级上册人教版单词表',
  primaryCategory: 'primary',
  secondaryCategory: '三年级',
  version: '人教版',
  contentTags: ['词汇', '上册'],
  cardCount: 112,
  sizeLabel: '约 3 MB',
  updatedAt: '2026-07-31',
  priceCents: 1990,
  priceLabel: '¥19.9',
  summary: '测试包',
  sampleHeadwords: ['apple'],
  isBundledTestPack: false,
};

describe('resolvePackDisplayName', () => {
  beforeEach(() => {
    findCatalogItemSync.mockReset();
  });

  it('优先使用目录缓存中的 title', () => {
    findCatalogItemSync.mockReturnValue(apiPack);
    expect(resolvePackDisplayName('en-grade3-v1-rj')).toBe('三年级上册人教版单词表');
  });

  it('无目录项时回退到 packId', () => {
    findCatalogItemSync.mockReturnValue(null);
    expect(resolvePackDisplayName('en-grade3-v1-rj')).toBe('en-grade3-v1-rj');
  });
});
