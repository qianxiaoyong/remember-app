import type { RedeemCodeResponse } from '@remember/contracts';
import { redeemCodeResponseSchema } from '@remember/contracts';
import { apiFetchJson } from './api-client';

export async function redeemPackCodeRequest(
  sessionToken: string,
  code: string,
): Promise<RedeemCodeResponse> {
  const body = await apiFetchJson<unknown>('/api/v1/redemption/redeem', {
    method: 'POST',
    sessionToken,
    body: JSON.stringify({ code }),
  });
  return redeemCodeResponseSchema.parse(body);
}
