import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AdminLexiconDetail } from '@remember/contracts';
import { fetchLemmaByForm } from './lexicon-api-client.js';

const sampleLemma: AdminLexiconDetail = {
  id: '00000000-0000-4000-8000-000000000001',
  lemmaKey: 'go',
  headword: 'go',
  status: 'draft',
  source: 'ecdict',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  fragments: [],
  forms: [],
  assets: [],
  tags: [],
};

function toFetchUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') {
    return input;
  }
  if (input instanceof URL) {
    return input.toString();
  }
  return input.url;
}

describe('fetchLemmaByForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('by-form 404 时 fallback 到 lemmaKey 详情', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = toFetchUrl(input);
        if (url.includes('/by-form/go')) {
          return Promise.resolve(
            new Response(JSON.stringify({ message: '词形未收录' }), { status: 404 }),
          );
        }
        if (url === '/local-api/lexicon/go') {
          return Promise.resolve(new Response(JSON.stringify(sampleLemma), { status: 200 }));
        }
        return Promise.reject(new Error(`unexpected fetch: ${url}`));
      }),
    );

    const lemma = await fetchLemmaByForm('go');
    expect(lemma?.lemmaKey).toBe('go');
  });

  it('by-form 命中时不请求详情', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = toFetchUrl(input);
      if (url.includes('/by-form/went')) {
        return Promise.resolve(
          new Response(JSON.stringify({ formKey: 'went', lemma: sampleLemma }), {
            status: 200,
          }),
        );
      }
      return Promise.reject(new Error(`unexpected fetch: ${url}`));
    });
    vi.stubGlobal('fetch', fetchMock);

    const lemma = await fetchLemmaByForm('went');
    expect(lemma?.lemmaKey).toBe('go');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
