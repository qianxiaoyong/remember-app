import type {
  AdminCreateRedemptionBatchRequest,
  AdminCreateRedemptionBatchResponse,
  AdminListRedemptionCodesQuery,
  AdminRedemptionCodeListResponse,
  AdminUpdateRedemptionCodeRequest,
} from '@remember/contracts';
import { adminFetchJson } from './admin-api-client.js';

function buildQuery(query: AdminListRedemptionCodesQuery): string {
  const search = new URLSearchParams();
  if (query.packId) {
    search.set('packId', query.packId);
  }
  if (query.status) {
    search.set('status', query.status);
  }
  if (query.keyword) {
    search.set('keyword', query.keyword);
  }
  if (query.includeDeleted) {
    search.set('includeDeleted', 'true');
  }
  search.set('page', String(query.page ?? 1));
  search.set('pageSize', String(query.pageSize ?? 20));
  const serialized = search.toString();
  return serialized.length > 0 ? `?${serialized}` : '';
}

export async function fetchRedemptionCodes(
  query: AdminListRedemptionCodesQuery,
): Promise<AdminRedemptionCodeListResponse> {
  return adminFetchJson<AdminRedemptionCodeListResponse>(
    `/admin/redemption-codes${buildQuery(query)}`,
  );
}

export async function createRedemptionBatch(
  input: AdminCreateRedemptionBatchRequest,
): Promise<AdminCreateRedemptionBatchResponse> {
  return adminFetchJson<AdminCreateRedemptionBatchResponse>('/admin/redemption-codes/batch', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateRedemptionCode(
  id: string,
  input: AdminUpdateRedemptionCodeRequest,
): Promise<AdminRedemptionCodeListResponse['items'][number]> {
  return adminFetchJson(`/admin/redemption-codes/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteRedemptionCode(
  id: string,
): Promise<AdminRedemptionCodeListResponse['items'][number]> {
  return adminFetchJson(`/admin/redemption-codes/${encodeURIComponent(id)}/delete`, {
    method: 'POST',
  });
}

export async function restoreRedemptionCode(
  id: string,
): Promise<AdminRedemptionCodeListResponse['items'][number]> {
  return adminFetchJson(`/admin/redemption-codes/${encodeURIComponent(id)}/restore`, {
    method: 'POST',
  });
}

export type RedemptionCodeListItem = AdminRedemptionCodeListResponse['items'][number];
