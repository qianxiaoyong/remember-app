import type { AdminLexiconSearchQuery } from '@remember/contracts';

export type LexiconStatusFilter = 'all' | 'published' | 'draft' | 'archived';
export type LexiconSortField = NonNullable<AdminLexiconSearchQuery['sortBy']>;
export type LexiconSortOrder = NonNullable<AdminLexiconSearchQuery['sortOrder']>;

export const LEXICON_LIST_PAGE_SIZE_OPTIONS = [20, 50, 100] as const;
export const LEXICON_LIST_DEFAULT_PAGE_SIZE = 50;

export interface LexiconListSearchState {
  q: string;
  status: LexiconStatusFilter;
  page: number;
  pageSize: number;
  sortBy: LexiconSortField | null;
  sortOrder: LexiconSortOrder;
}

const SORT_FIELDS = new Set<LexiconSortField>([
  'headword',
  'lemmaKey',
  'status',
  'ipa',
  'pos',
  'source',
]);

function parsePageSize(raw: string | null): number {
  const parsed = raw ? Number.parseInt(raw, 10) : LEXICON_LIST_DEFAULT_PAGE_SIZE;
  if (parsed === 20 || parsed === 50 || parsed === 100) {
    return parsed;
  }
  return LEXICON_LIST_DEFAULT_PAGE_SIZE;
}

function parseSortField(raw: string | null): LexiconSortField | null {
  if (!raw || !SORT_FIELDS.has(raw as LexiconSortField)) {
    return null;
  }
  return raw as LexiconSortField;
}

export function readLexiconListSearch(params: URLSearchParams): LexiconListSearchState {
  const statusRaw = params.get('status');
  const status: LexiconStatusFilter =
    statusRaw === 'published' || statusRaw === 'draft' || statusRaw === 'archived'
      ? statusRaw
      : 'all';

  const pageRaw = Number.parseInt(params.get('page') ?? '1', 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw - 1 : 0;

  return {
    q: params.get('q') ?? '',
    status,
    page,
    pageSize: parsePageSize(params.get('pageSize')),
    sortBy: parseSortField(params.get('sortBy')),
    sortOrder: params.get('sortOrder') === 'desc' ? 'desc' : 'asc',
  };
}

export function writeLexiconListSearch(state: LexiconListSearchState): URLSearchParams {
  const params = new URLSearchParams();
  const trimmedQuery = state.q.trim();
  if (trimmedQuery) {
    params.set('q', trimmedQuery);
  }
  if (state.status !== 'all') {
    params.set('status', state.status);
  }
  if (state.page > 0) {
    params.set('page', String(state.page + 1));
  }
  if (state.pageSize !== LEXICON_LIST_DEFAULT_PAGE_SIZE) {
    params.set('pageSize', String(state.pageSize));
  }
  if (state.sortBy) {
    params.set('sortBy', state.sortBy);
    params.set('sortOrder', state.sortOrder);
  }
  return params;
}

export function buildLexiconListSearchString(state: LexiconListSearchState): string {
  const params = writeLexiconListSearch(state);
  const text = params.toString();
  return text.length > 0 ? `?${text}` : '';
}
