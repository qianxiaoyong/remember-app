import { adminExtractSamplePreviewsResponseSchema } from '@remember/contracts';
import { adminFetchJson } from './admin-api-client.js';

export async function deletePack(packId: string): Promise<void> {
  await adminFetchJson(`/admin/packs/${encodeURIComponent(packId)}`, {
    method: 'DELETE',
  });
}

export async function extractSamplePreviews(packId: string) {
  const json = await adminFetchJson<unknown>(
    `/admin/packs/${encodeURIComponent(packId)}/extract-sample-previews`,
    {
      method: 'POST',
    },
  );
  return adminExtractSamplePreviewsResponseSchema.parse(json);
}
