import type { AdminCatalogTaxonomyResponse } from '@remember/contracts';
import { adminCatalogTaxonomyResponseSchema } from '@remember/contracts';
import { adminFetchJson } from './admin-api-client.js';

export async function fetchAdminCatalogTaxonomy(): Promise<AdminCatalogTaxonomyResponse> {
  const body = await adminFetchJson<unknown>('/admin/catalog/taxonomy');
  return adminCatalogTaxonomyResponseSchema.parse(body);
}

export async function createPrimaryTaxonomyNode(input: {
  slug: string;
  label: string;
  sortOrder?: number;
}): Promise<void> {
  await adminFetchJson('/admin/catalog/taxonomy/primaries', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updatePrimaryTaxonomyNode(
  id: string,
  input: { slug?: string; label?: string; sortOrder?: number; status?: 'active' | 'archived' },
): Promise<void> {
  await adminFetchJson(`/admin/catalog/taxonomy/primaries/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deletePrimaryTaxonomyNode(id: string): Promise<void> {
  await adminFetchJson(`/admin/catalog/taxonomy/primaries/${id}`, { method: 'DELETE' });
}

export async function createSecondaryTaxonomyNode(
  primaryId: string,
  input: { slug: string; label: string; sortOrder?: number },
): Promise<void> {
  await adminFetchJson(`/admin/catalog/taxonomy/primaries/${primaryId}/secondaries`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateSecondaryTaxonomyNode(
  id: string,
  input: { slug?: string; label?: string; sortOrder?: number; status?: 'active' | 'archived' },
): Promise<void> {
  await adminFetchJson(`/admin/catalog/taxonomy/secondaries/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteSecondaryTaxonomyNode(id: string): Promise<void> {
  await adminFetchJson(`/admin/catalog/taxonomy/secondaries/${id}`, { method: 'DELETE' });
}

export async function createVersionTaxonomyNode(input: {
  slug: string;
  label: string;
  sortOrder?: number;
}): Promise<void> {
  await adminFetchJson('/admin/catalog/taxonomy/versions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateVersionTaxonomyNode(
  id: string,
  input: { slug?: string; label?: string; sortOrder?: number; status?: 'active' | 'archived' },
): Promise<void> {
  await adminFetchJson(`/admin/catalog/taxonomy/versions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteVersionTaxonomyNode(id: string): Promise<void> {
  await adminFetchJson(`/admin/catalog/taxonomy/versions/${id}`, { method: 'DELETE' });
}
