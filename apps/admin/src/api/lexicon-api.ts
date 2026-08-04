import type {
  AdminLexiconDetail,
  AdminLexiconPatchRequest,
  AdminLexiconPatchResponse,
  AdminLexiconSearchQuery,
  AdminLexiconSearchResponse,
} from '@remember/contracts';
import {
  adminLexiconDetailSchema,
  adminLexiconPatchResponseSchema,
  adminLexiconSearchResponseSchema,
} from '@remember/contracts';
import { adminFetchJson } from './admin-api-client.js';

function buildSearchQuery(query: AdminLexiconSearchQuery): string {
  const params = new URLSearchParams();
  const trimmedQuery = query.q?.trim();
  if (trimmedQuery) {
    params.set('q', trimmedQuery);
  }
  if (query.status) {
    params.set('status', query.status);
  }
  if (query.sortBy) {
    params.set('sortBy', query.sortBy);
  }
  if (query.sortOrder) {
    params.set('sortOrder', query.sortOrder);
  }
  params.set('limit', String(query.limit));
  params.set('offset', String(query.offset));
  return params.toString();
}

export async function searchLexicon(
  query: AdminLexiconSearchQuery,
): Promise<AdminLexiconSearchResponse> {
  const body = await adminFetchJson<unknown>(`/admin/lexicon/search?${buildSearchQuery(query)}`);
  return adminLexiconSearchResponseSchema.parse(body);
}

export async function fetchLexiconDetail(lemmaKey: string): Promise<AdminLexiconDetail> {
  const body = await adminFetchJson<unknown>(`/admin/lexicon/${encodeURIComponent(lemmaKey)}`);
  return adminLexiconDetailSchema.parse(body);
}

export async function patchLexicon(
  input: AdminLexiconPatchRequest,
): Promise<AdminLexiconPatchResponse> {
  const body = await adminFetchJson<unknown>('/admin/lexicon', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return adminLexiconPatchResponseSchema.parse(body);
}

export async function publishLemma(lemmaKey: string): Promise<void> {
  await patchLexicon({
    patches: [{ lemmaKey, status: 'published' }],
  });
}
