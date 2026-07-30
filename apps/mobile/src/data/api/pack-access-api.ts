import { listMyPackAccessResponseSchema } from '@remember/contracts';
import { apiFetchJson } from './api-client';

export async function fetchMyPackAccess(
  sessionToken: string,
): Promise<{ packId: string; grantedAt: string; source: 'purchase' | 'redemption' }[]> {
  const body = await apiFetchJson<unknown>('/api/v1/me/pack-access', {
    method: 'GET',
    sessionToken,
  });
  return listMyPackAccessResponseSchema.parse(body).items;
}
