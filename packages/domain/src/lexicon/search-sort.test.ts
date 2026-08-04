import { describe, expect, it } from 'vitest';
import { compareLemmaStatusForSearch, lemmaStatusRank } from './search-sort.js';

describe('lemmaStatusRank', () => {
  it('published 优先于 draft 与 archived', () => {
    expect(lemmaStatusRank('published')).toBeLessThan(lemmaStatusRank('draft'));
    expect(lemmaStatusRank('published')).toBeLessThan(lemmaStatusRank('archived'));
    expect(lemmaStatusRank('draft')).toBeLessThan(lemmaStatusRank('archived'));
  });
});

describe('compareLemmaStatusForSearch', () => {
  it('published 排在 draft 前', () => {
    expect(compareLemmaStatusForSearch('published', 'draft')).toBeLessThan(0);
    expect(compareLemmaStatusForSearch('draft', 'published')).toBeGreaterThan(0);
  });
});
