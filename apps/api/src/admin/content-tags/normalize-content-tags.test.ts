import { describe, expect, it } from 'vitest';
import { normalizeContentTags } from './normalize-content-tags.js';

describe('normalizeContentTags', () => {
  it('trims, deduplicates, and drops empty values', () => {
    expect(normalizeContentTags([' 英语词汇 ', '英语词汇', '', '上册'])).toEqual([
      '英语词汇',
      '上册',
    ]);
  });
});
