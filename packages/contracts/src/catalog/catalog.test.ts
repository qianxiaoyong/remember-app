import { describe, expect, it } from 'vitest';
import {
  catalogPackDetailSchema,
  catalogTaxonomyResponseSchema,
  listCatalogPacksResponseSchema,
} from './index.js';

describe('catalog contracts', () => {
  it('listCatalogPacks round-trip', () => {
    const response = listCatalogPacksResponseSchema.parse({
      items: [
        {
          packId: 'remember-test-pack',
          title: '记得测试包',
          primaryCategory: 'junior',
          secondaryCategory: '七年级',
          versionLabel: '人教版',
          contentTags: ['词汇'],
          cardCount: 2,
          sizeLabel: '约 2 MB',
          updatedAt: '2026-07-28T00:00:00.000Z',
          priceCents: 1,
          summary: '阶段 4 验包用的固定测试知识库。',
          isBundledTestPack: true,
        },
      ],
    });
    expect(response.items[0]?.packId).toBe('remember-test-pack');
  });

  it('catalogPackDetail 含 samplePreviews 与 includedHighlights', () => {
    const detail = catalogPackDetailSchema.parse({
      packId: 'demo-primary-grade3',
      title: '三年级上册词汇',
      primaryCategory: 'primary',
      secondaryCategory: '三年级',
      versionLabel: '人教版',
      contentTags: ['词汇'],
      cardCount: 480,
      sizeLabel: '约 18 MB',
      updatedAt: '2026-07-15T00:00:00.000Z',
      priceCents: 1990,
      summary: '覆盖教材核心词汇。',
      includedHighlights: [
        { title: '核心词汇', description: '教材单词与释义' },
      ],
      samplePreviews: [
        {
          headword: 'apple',
          zh: '苹果',
          exampleEn: 'I have a red apple.',
          previewAudioUrl: 'https://cdn.example.com/samples/apple.mp3',
        },
      ],
      introMedia: [
        {
          type: 'image',
          url: 'https://cdn.example.com/intro/cover.jpg',
          sortOrder: 0,
        },
      ],
    });
    expect(detail.samplePreviews[0]?.headword).toBe('apple');
    expect(detail.includedHighlights?.[0]?.title).toBe('核心词汇');
  });

  it('拒绝未知字段', () => {
    expect(() =>
      catalogPackDetailSchema.parse({
        packId: 'x',
        title: 't',
        primaryCategory: 'primary',
        secondaryCategory: '三年级',
        versionLabel: '人教版',
        contentTags: [],
        cardCount: 1,
        sizeLabel: '1 MB',
        updatedAt: '2026-07-15T00:00:00.000Z',
        priceCents: 0,
        summary: 's',
        samplePreviews: [{ headword: 'a', zh: 'b', exampleEn: 'c' }],
        extra: true,
      }),
    ).toThrow();
  });

  it('catalogTaxonomyResponse round-trip', () => {
    const taxonomy = catalogTaxonomyResponseSchema.parse({
      primaries: [
        {
          id: '11111111-1111-4111-8111-111111111101',
          slug: 'primary',
          label: '小学英语',
          sortOrder: 1,
          status: 'active',
          children: [
            {
              id: '22222222-2222-4222-8222-222222222201',
              slug: 'grade3',
              label: '三年级',
              sortOrder: 3,
              status: 'active',
            },
          ],
        },
      ],
      versions: [
        {
          id: '33333333-3333-4333-8333-333333333301',
          slug: 'pep',
          label: '人教版',
          sortOrder: 1,
          status: 'active',
        },
      ],
    });
    expect(taxonomy.primaries[0]?.children[0]?.label).toBe('三年级');
  });
});
