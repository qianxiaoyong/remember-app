import type {
  AdminLexiconDetail,
  AdminLexiconSearchQuery,
  AdminLexiconSearchResponse,
  LexiconEntry,
} from '@remember/contracts';
import {
  adminLexiconByFormResponseSchema,
  adminLexiconSearchResponseSchema,
  lexiconEntrySchema,
} from '@remember/contracts';
import type { LexiconLookupResult } from '../lexicon-workbench/types.js';

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `请求失败 (${String(response.status)})`);
  }
  return response.json() as Promise<T>;
}

export async function searchCentralLexicon(
  query: AdminLexiconSearchQuery,
): Promise<AdminLexiconSearchResponse> {
  const params = new URLSearchParams();
  const trimmedQuery = query.q?.trim();
  if (trimmedQuery) {
    params.set('q', trimmedQuery);
  }
  if (query.status) {
    params.set('status', query.status);
  }
  params.set('limit', String(query.limit));
  params.set('offset', String(query.offset));
  const body = await readJson<unknown>(
    await fetch(`/local-api/lexicon/search?${params.toString()}`),
  );
  return adminLexiconSearchResponseSchema.parse(body);
}

export async function fetchLemmaByForm(formKey: string): Promise<AdminLexiconDetail | null> {
  const response = await fetch(`/local-api/lexicon/by-form/${encodeURIComponent(formKey)}`);
  if (response.status === 404) {
    return null;
  }
  const body = await readJson<unknown>(response);
  const parsed = adminLexiconByFormResponseSchema.parse(body);
  return parsed.lemma;
}

export async function lookupSurfacesInCentralLexicon(
  surfaceForms: string[],
  concurrency = 8,
): Promise<LexiconLookupResult[]> {
  const results: LexiconLookupResult[] = [];
  let cursor = 0;

  async function worker(): Promise<void> {
    while (cursor < surfaceForms.length) {
      const index = cursor;
      cursor += 1;
      const surfaceForm = surfaceForms[index];
      if (!surfaceForm) {
        continue;
      }
      const lemma = await fetchLemmaByForm(surfaceForm);
      results[index] = { surfaceForm, lemma };
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, surfaceForms.length) }, () =>
    worker(),
  );
  await Promise.all(workers);
  return results;
}

export async function loadPackLexicon(packId: string): Promise<LexiconEntry[]> {
  const body = await readJson<{ entries: unknown }>(
    await fetch(`/local-api/packs/${encodeURIComponent(packId)}/lexicon`),
  );
  return lexiconEntrySchema.array().parse(body.entries);
}

export async function savePackLexicon(packId: string, entries: LexiconEntry[]): Promise<void> {
  await readJson<{ ok: true }>(
    await fetch(`/local-api/packs/${encodeURIComponent(packId)}/lexicon`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries }),
    }),
  );
}
