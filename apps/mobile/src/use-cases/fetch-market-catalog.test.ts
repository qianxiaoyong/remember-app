import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CatalogPackSummary } from '@remember/contracts';
import type { CatalogPackItem } from '../catalog/catalog-seed';
import { CATALOG_ALL_VERSION_LABEL } from '../catalog/catalog-seed';
import { fetchMarketCatalog, readCachedMarketCatalog } from './fetch-market-catalog';

const fetchCatalogPacks = vi.fn<() => Promise<CatalogPackSummary[]>>();
const readCatalogDiskCache = vi.fn<() => Promise<CatalogPackItem[] | null>>();
const readCatalogMemoryCache = vi.fn<() => CatalogPackItem[] | null>();
const writeCatalogMemoryCache = vi.fn<(items: CatalogPackItem[]) => void>();

vi.mock('../data/api/catalog-api', () => ({
  fetchCatalogPacks: () => fetchCatalogPacks(),
}));

vi.mock('../data/catalog/catalog-taxonomy-store', () => ({
  writeCachedCatalogTaxonomy: vi.fn(),
}));

vi.mock('../data/catalog/catalog-cache-store', () => ({
  readCatalogDiskCache: () => readCatalogDiskCache(),
  readCatalogMemoryCache: () => readCatalogMemoryCache(),
  writeCatalogMemoryCache: (items: CatalogPackItem[]) => {
    writeCatalogMemoryCache(items);
  },
  resolveOfflineCatalog: vi.fn(() => Promise.resolve([])),
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

const rememberTestPack: CatalogPackItem = {
  packId: 'remember-test-pack',
  title: '记得测试包',
  primaryCategory: 'primary',
  secondaryCategory: '测试',
  version: '1.0.0',
  contentTags: [],
  cardCount: 10,
  sizeLabel: '约 1 MB',
  updatedAt: '2026-07-31',
  priceCents: 1,
  priceLabel: '¥0.01',
  summary: '',
  sampleHeadwords: [],
  isBundledTestPack: true,
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
      versionFilter: CATALOG_ALL_VERSION_LABEL,
      keyword: '',
    });

    expect(fetchCatalogPacks).toHaveBeenCalledTimes(1);
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
      rememberTestPack,
    ]);

    const cached = await readCachedMarketCatalog({
      primaryCategory: 'all',
      secondaryCategory: '全部',
      versionFilter: CATALOG_ALL_VERSION_LABEL,
      keyword: '',
    });

    expect(cached).toHaveLength(2);
    expect(cached?.map((item) => item.packId).sort()).toEqual(
      ['en-grade3-v1-rj', 'remember-test-pack'].sort(),
    );
  });

  it('never shows story-test-pack even when present in cache', async () => {
    readCatalogDiskCache.mockResolvedValue([
      {
        packId: 'story-test-pack',
        title: 'Story 测试包',
        primaryCategory: 'primary',
        secondaryCategory: '测试',
        version: '1.0.0',
        contentTags: [],
        cardCount: 1,
        sizeLabel: '约 1 MB',
        updatedAt: '2026-07-31',
        priceCents: 0,
        priceLabel: '免费',
        summary: '',
        sampleHeadwords: [],
        isBundledTestPack: true,
      },
    ]);

    const cached = await readCachedMarketCatalog({
      primaryCategory: 'all',
      secondaryCategory: '全部',
      versionFilter: CATALOG_ALL_VERSION_LABEL,
      keyword: '',
    });

    expect(cached).toHaveLength(0);
  });

  it('does not inject bundled test packs missing from API catalog', async () => {
    fetchCatalogPacks.mockResolvedValue([grade3Pack]);

    const items = await fetchMarketCatalog({
      primaryCategory: 'all',
      secondaryCategory: '全部',
      versionFilter: CATALOG_ALL_VERSION_LABEL,
      keyword: '',
    });

    expect(items.some((item) => item.packId === 'story-test-pack')).toBe(false);
    expect(items.some((item) => item.packId === 'en-grade3-v1-rj')).toBe(true);
  });

  it('drops cached packs when API no longer returns them (draft/unpublished)', async () => {
    readCatalogMemoryCache.mockReturnValue([
      {
        packId: 'demo-primary-grade3',
        title: '三年级上册词汇',
        primaryCategory: 'primary',
        secondaryCategory: '三年级',
        version: '1.0.0',
        contentTags: [],
        cardCount: 100,
        sizeLabel: '约 1 MB',
        updatedAt: '2026-07-31',
        priceCents: 1990,
        priceLabel: '¥19.90',
        summary: '',
        sampleHeadwords: [],
        isBundledTestPack: false,
      },
      rememberTestPack,
    ]);
    fetchCatalogPacks.mockResolvedValue([
      {
        packId: 'remember-test-pack',
        title: '记得测试包',
        primaryCategory: 'primary',
        secondaryCategory: '测试',
        versionLabel: '1.0.0',
        contentTags: [],
        cardCount: 10,
        sizeLabel: '约 1 MB',
        updatedAt: '2026-07-31T06:28:05.287Z',
        priceCents: 1,
        summary: '记得测试包',
      },
    ]);

    const items = await fetchMarketCatalog({
      primaryCategory: 'all',
      secondaryCategory: '全部',
      versionFilter: CATALOG_ALL_VERSION_LABEL,
      keyword: '',
    });

    expect(items).toHaveLength(1);
    expect(items[0]?.packId).toBe('remember-test-pack');
    expect(writeCatalogMemoryCache).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ packId: 'remember-test-pack' })]),
    );
    const written = writeCatalogMemoryCache.mock.calls.at(-1)?.[0] ?? [];
    expect(written.some((item) => item.packId === 'demo-primary-grade3')).toBe(false);
  });

  it('merges list refresh without preserving stale detail-only fields from cache', async () => {
    readCatalogMemoryCache.mockReturnValue([
      {
        packId: 'en-grade3-v1-rj',
        title: '三年级上册人教版单词表',
        primaryCategory: 'primary',
        secondaryCategory: '三年级',
        version: '人教版',
        contentTags: ['词汇'],
        cardCount: 112,
        sizeLabel: '约 1.1 MB',
        updatedAt: '2026-07-31',
        priceCents: 100,
        priceLabel: '¥1',
        summary: '详情摘要',
        sampleHeadwords: ['apple'],
        samplePreviews: [{ headword: 'apple', zh: '苹果', exampleEn: 'An apple.' }],
        introMedia: [{ type: 'image', url: 'https://cdn.example.com/intro.jpg', sortOrder: 0 }],
        includedHighlights: [{ title: '核心词汇', description: '单词与释义' }],
        isBundledTestPack: false,
      },
    ]);
    fetchCatalogPacks.mockResolvedValue([{ ...grade3Pack, summary: '列表摘要' }]);

    const items = await fetchMarketCatalog({
      primaryCategory: 'all',
      secondaryCategory: '全部',
      versionFilter: CATALOG_ALL_VERSION_LABEL,
      keyword: '',
    });

    expect(items[0]?.summary).toBe('列表摘要');
    expect(items[0]?.samplePreviews).toBeUndefined();
    expect(items[0]?.introMedia).toBeUndefined();
    expect(items[0]?.includedHighlights).toHaveLength(1);
  });
});
