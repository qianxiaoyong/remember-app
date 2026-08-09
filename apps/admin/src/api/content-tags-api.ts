import type { AdminContentTagVocabularyListResponse } from '@remember/contracts';
import { adminContentTagVocabularyListResponseSchema } from '@remember/contracts';
import { adminFetchJson } from './admin-api-client.js';

export async function fetchAdminContentTagVocabulary(): Promise<AdminContentTagVocabularyListResponse> {
  const body = await adminFetchJson<unknown>('/admin/content-tags');
  return adminContentTagVocabularyListResponseSchema.parse(body);
}

export async function deleteAdminContentTagVocabulary(label: string): Promise<void> {
  await adminFetchJson(`/admin/content-tags/${encodeURIComponent(label)}`, { method: 'DELETE' });
}

export async function upsertAdminContentTagVocabulary(labels: string[]): Promise<void> {
  await adminFetchJson('/admin/content-tags', {
    method: 'POST',
    body: JSON.stringify({ labels }),
  });
}
