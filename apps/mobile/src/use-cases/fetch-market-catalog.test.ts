import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CatalogPackSummary } from '@remember/contracts';
import type { CatalogPackItem } from '../catalog/catalog-seed';
import {
  fetchMarketCatalog,
  readCachedMarketCatalog,
} from './fetch-market-catalog';

const fetchCatalogPacks = vi.fn<() => Promise<CatalogPackSummary[]>>();
const readCatalogDiskCache = vi.fn<() => Promise<CatalogPackItem[] | null>>();
const readCatalogMemoryCache = vi.fn<() => CatalogPackItem[] | null>();
const writeCatalogMemoryCache = vi.fn<(items: CatalogPackItem[]) => void>();

vi.mock('../data/api/catalog-api', () => ({
  fetchCatalogPacks: () => fetchCatalogPacks(),
}));

vi.mock('../data/catalog/catalog-cache-store', () => ({
  readCatalogDiskCache: () => readCatalogDiskCache(),
  readCatalogMemoryCache: () => readCatalogMemoryCache(),
  writeCatalogMemoryCache: (items: CatalogPackItem[]) => writeCatalogMemoryCache(items),
  resolveOfflineCatalog: vi.fn(async () => []),
}));

const grade3Pack: CatalogPackSummary = {
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

describe('fetchMarketCatalog', () => {
  beforeEach(() => {
    fetchCatalogPacks.mockReset();
    readCatalogDiskCache.mockReset();
    readCatalogMemoryCache.mockReset();
    writeCatalogMemoryCache.mockReset();
    readCatalogMemoryCache.mockReturnValue(null);
    readCatalogDiskCache.mockResolvedValue(null);
  });

  it('fetches full catalog even when UI filters are active', async () => {
    fetchCatalogPacks.mockResolvedValue([grade3Pack]);

    const items = await fetchMarketCatalog({
      primaryCategory: 'primary',
      secondaryCategory: '三年级',
      versionFilter: '全部版本',
      keyword: '',
    });

    expect(fetchCatalogPacks).toHaveBeenCalledWith({});
    expect(items).toHaveLength(1);
    expect(items[0]?.packId).toBe('en-grade3-v1-rj');
  });

  it('returns cached items before network refresh path', async () => {
    readCatalogDiskCache.mockResolvedValue([
      {
        packId: 'en-grade3-v1-rj',
        title: '三年级上册人教版单词表',
        primaryCategory: 'primary',
        secondaryCategory: '三年级',
        version: '人教版',
        contentTags: [],
        cardCount: 112,
        sizeLabel: '约 1.1 MB',
        updatedAt: '2026-07-31',
        priceCents: 100,
        priceLabel: '¥1',
        summary: '',
        sampleHeadwords: [],
        isBundledTestPack: false,
      },
    ]);

    const cached = await readCachedMarketCatalog({
      primaryCategory: 'all',
      secondaryCategory: '全部',
      versionFilter: '全部版本',
      keyword: '',
    });

    expect(cached).toHaveLength(1);
    expect(cached?.[0]?.packId).toBe('en-grade3-v1-rj');
  });
});
