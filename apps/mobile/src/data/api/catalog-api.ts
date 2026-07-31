import type {
  CatalogPackDetail,
  CatalogPackSummary,
  CatalogTaxonomyResponse,
  ListCatalogPacksQuery,
} from '@remember/contracts';
import {
  catalogPackDetailSchema,
  catalogPackPriceResponseSchema,
  catalogTaxonomyResponseSchema,
  listCatalogPacksResponseSchema,
} from '@remember/contracts';
import { apiFetchJson, API_TIMEOUT_MS, CATALOG_API_TIMEOUT_MS } from './api-client';

function buildCatalogQuery(params: ListCatalogPacksQuery): string {
  const search = new URLSearchParams();
  if (params.primaryCategory) {
    search.set('primaryCategory', params.primaryCategory);
  }
  if (params.secondaryCategory) {
    search.set('secondaryCategory', params.secondaryCategory);
  }
  if (params.versionLabel) {
    search.set('versionLabel', params.versionLabel);
  }
  if (params.keyword) {
    search.set('keyword', params.keyword);
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export async function fetchCatalogTaxonomy(): Promise<CatalogTaxonomyResponse> {
  const body = await apiFetchJson<unknown>('/api/v1/catalog/taxonomy', {
    method: 'GET',
    timeoutMs: API_TIMEOUT_MS,
  });
  return catalogTaxonomyResponseSchema.parse(body);
}

export async function fetchCatalogPacks(
  query: ListCatalogPacksQuery,
): Promise<CatalogPackSummary[]> {
  const body = await apiFetchJson<unknown>(`/api/v1/catalog/packs${buildCatalogQuery(query)}`, {
    method: 'GET',
    timeoutMs: CATALOG_API_TIMEOUT_MS,
  });
  return listCatalogPacksResponseSchema.parse(body).items;
}

export async function fetchCatalogPackDetail(packId: string): Promise<CatalogPackDetail> {
  const body = await apiFetchJson<unknown>(`/api/v1/catalog/packs/${encodeURIComponent(packId)}`, {
    method: 'GET',
    timeoutMs: CATALOG_API_TIMEOUT_MS,
  });
  return catalogPackDetailSchema.parse(body);
}

export async function fetchCatalogPackPrice(
  packId: string,
): Promise<{ packId: string; priceCents: number }> {
  const body = await apiFetchJson<unknown>(
    `/api/v1/catalog/packs/${encodeURIComponent(packId)}/price`,
    { method: 'GET', timeoutMs: CATALOG_API_TIMEOUT_MS },
  );
  return catalogPackPriceResponseSchema.parse(body);
}
