import { describe, expect, it } from 'vitest';
import type { CatalogPackItem } from './catalog-seed';
import { resolveCatalogCover } from './resolve-catalog-cover';

function createItem(overrides: Partial<CatalogPackItem> = {}): CatalogPackItem {
  return {
    packId: 'remember-test-pack',
    title: '记得测试包',
    primaryCategory: 'junior',
    secondaryCategory: '七年级',
    version: '人教版',
    contentTags: ['词汇'],
    cardCount: 10,
    sizeLabel: '约 1 MB',
    updatedAt: '2026-08-11',
    priceCents: 100,
    priceLabel: '¥1',
    summary: '测试包',
    sampleHeadwords: [],
    isBundledTestPack: false,
    ...overrides,
  };
}

describe('resolveCatalogCover', () => {
  it('列表优先 coverThumbnailUrl', () => {
    const item = createItem({
      coverUrl: 'https://cdn.example.com/cover.jpg',
      coverThumbnailUrl: 'https://cdn.example.com/cover.thumb.webp',
    });

    const cover = resolveCatalogCover(item, { imageKind: 'list' });

    expect(cover.imageSource).toEqual({ uri: 'https://cdn.example.com/cover.thumb.webp' });
  });

  it('详情优先 coverUrl（压缩原图）', () => {
    const item = createItem({
      coverUrl: 'https://cdn.example.com/cover.jpg',
      coverThumbnailUrl: 'https://cdn.example.com/cover.thumb.webp',
    });

    const cover = resolveCatalogCover(item, { imageKind: 'detail' });

    expect(cover.imageSource).toEqual({ uri: 'https://cdn.example.com/cover.jpg' });
  });

  it('默认 imageKind 为 detail', () => {
    const item = createItem({
      coverUrl: 'https://cdn.example.com/cover.jpg',
      coverThumbnailUrl: 'https://cdn.example.com/cover.thumb.webp',
    });

    const cover = resolveCatalogCover(item);

    expect(cover.imageSource).toEqual({ uri: 'https://cdn.example.com/cover.jpg' });
  });

  it('列表无缩略图时回退 coverUrl', () => {
    const item = createItem({
      coverUrl: 'https://cdn.example.com/cover.jpg',
    });

    const cover = resolveCatalogCover(item, { imageKind: 'list' });

    expect(cover.imageSource).toEqual({ uri: 'https://cdn.example.com/cover.jpg' });
  });

  it('详情无原图时回退 coverThumbnailUrl', () => {
    const item = createItem({
      coverThumbnailUrl: 'https://cdn.example.com/cover.thumb.webp',
    });

    const cover = resolveCatalogCover(item, { imageKind: 'detail' });

    expect(cover.imageSource).toEqual({ uri: 'https://cdn.example.com/cover.thumb.webp' });
  });
});
