import { describe, expect, it } from 'vitest';
import type { CatalogPackItem } from '../catalog/catalog-seed';
import { resolvePackSamplePreviews } from './resolve-pack-sample-previews';

function buildItem(overrides: Partial<CatalogPackItem> = {}): CatalogPackItem {
  return {
    packId: 'test-pack',
    title: '测试包',
    primaryCategory: 'primary',
    secondaryCategory: '三年级',
    version: '人教版',
    contentTags: ['词汇'],
    cardCount: 10,
    sizeLabel: '约 1 MB',
    updatedAt: '2026-08-08',
    priceCents: 100,
    priceLabel: '¥1.00',
    summary: '摘要',
    sampleHeadwords: ['apple', 'book'],
    isBundledTestPack: false,
    ...overrides,
  };
}

describe('resolvePackSamplePreviews', () => {
  it('无 samplePreviews 时返回空数组，不用 sampleHeadwords 占位', () => {
    const item = buildItem({ sampleHeadwords: ['apple', 'book'] });
    expect(resolvePackSamplePreviews(item)).toEqual([]);
  });

  it('有 samplePreviews 时返回规范化后的条目', () => {
    const item = buildItem({
      samplePreviews: [
        {
          headword: 'apple',
          zh: '苹果',
          exampleEn: 'I like apples.',
          initial: 'A',
        },
      ],
    });
    expect(resolvePackSamplePreviews(item)).toEqual([
      {
        headword: 'apple',
        zh: '苹果',
        exampleEn: 'I like apples.',
        initial: 'A',
      },
    ]);
  });

  it('空 samplePreviews 数组时返回空数组', () => {
    const item = buildItem({ samplePreviews: [], sampleHeadwords: ['apple'] });
    expect(resolvePackSamplePreviews(item)).toEqual([]);
  });
});
