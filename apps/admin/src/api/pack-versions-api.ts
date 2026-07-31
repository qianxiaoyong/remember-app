import {
  adminPackDetailResponseSchema,
  adminPackVersionSchema,
  adminPublishPackVersionResponseSchema,
  adminUploadPackVersionResponseSchema,
} from '@remember/contracts';
import { AdminApiError, adminFetch, adminFetchJson } from './admin-api-client.js';

export async function fetchPackDetail(packId: string) {
  return adminPackDetailResponseSchema.parse(await adminFetchJson(`/admin/packs/${packId}`));
}

export async function uploadPackVersionZip(packId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await adminFetch(`/admin/packs/${packId}/versions`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let body: { message?: string; code?: string } = {};
    try {
      body = (await response.json()) as { message?: string; code?: string };
    } catch {
      // ignore
    }
    throw new AdminApiError(response.status, body);
  }

  return adminUploadPackVersionResponseSchema.parse(await response.json());
}

export async function publishPackVersion(packId: string, versionId: string) {
  return adminPublishPackVersionResponseSchema.parse(
    await adminFetchJson(`/admin/packs/${packId}/versions/${versionId}/publish`, {
      method: 'POST',
    }),
  );
}

export async function updatePackVersionNote(
  packId: string,
  versionId: string,
  note: string | null,
) {
  return adminPackVersionSchema.parse(
    await adminFetchJson(`/admin/packs/${packId}/versions/${versionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    }),
  );
}
