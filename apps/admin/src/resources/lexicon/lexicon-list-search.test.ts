import { describe, expect, it } from 'vitest';
import {
  buildLexiconListSearchString,
  readLexiconListSearch,
  writeLexiconListSearch,
} from './lexicon-list-search.js';

describe('lexicon list search params', () => {
  it('读写默认状态', () => {
    const state = readLexiconListSearch(new URLSearchParams());
    expect(state).toEqual({
      q: '',
      status: 'all',
      page: 0,
      pageSize: 50,
      sortBy: null,
      sortOrder: 'asc',
    });
    expect(buildLexiconListSearchString(state)).toBe('');
  });

  it('保留搜索、分页与排序', () => {
    const params = writeLexiconListSearch({
      q: 'go',
      status: 'draft',
      page: 2,
      pageSize: 20,
      sortBy: 'headword',
      sortOrder: 'desc',
    });
    expect(readLexiconListSearch(params)).toEqual({
      q: 'go',
      status: 'draft',
      page: 2,
      pageSize: 20,
      sortBy: 'headword',
      sortOrder: 'desc',
    });
    expect(buildLexiconListSearchString(readLexiconListSearch(params))).toBe(
      '?q=go&status=draft&page=3&pageSize=20&sortBy=headword&sortOrder=desc',
    );
  });
});
