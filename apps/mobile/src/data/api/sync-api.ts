import type { SyncBatchUploadResponse, SyncSnapshotResponse } from '@remember/contracts';
import {
  syncBatchUploadRequestSchema,
  syncBatchUploadResponseSchema,
  syncSnapshotResponseSchema,
} from '@remember/contracts';
import { apiFetchJson } from './api-client';

export async function uploadLearningStatesBatch(
  items: unknown,
  sessionToken: string,
): Promise<SyncBatchUploadResponse> {
  const request = syncBatchUploadRequestSchema.parse({ items });
  const body = await apiFetchJson<unknown>('/api/v1/sync/learning-states/batch', {
    method: 'POST',
    body: JSON.stringify(request),
    sessionToken,
  });
  return syncBatchUploadResponseSchema.parse(body);
}

export async function fetchLearningStatesSnapshot(
  sessionToken: string,
): Promise<SyncSnapshotResponse> {
  const body = await apiFetchJson<unknown>('/api/v1/sync/learning-states/snapshot', {
    method: 'GET',
    sessionToken,
  });
  return syncSnapshotResponseSchema.parse(body);
}
