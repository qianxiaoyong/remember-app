import { describe, expect, it } from 'vitest';
import { adminContentTagVocabularyListResponseSchema } from './content-tags.js';

describe('adminContentTagVocabularyListResponseSchema', () => {
  it('parses vocabulary list', () => {
    const parsed = adminContentTagVocabularyListResponseSchema.parse({
      items: [
        {
          label: '英语词汇',
          sortOrder: 10,
          createdAt: '2026-08-09T00:00:00.000Z',
        },
      ],
    });

    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0]?.label).toBe('英语词汇');
  });
});
