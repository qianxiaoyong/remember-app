import { readSessionToken } from '../data/session/session-store';
import { redeemPackCodeRequest } from '../data/api/redemption-api';
import { ApiRequestError } from '../data/api/api-client';
import type { RedeemCodeResponse } from '@remember/contracts';

const REDEMPTION_ERROR_MESSAGES: Record<string, string> = {
  REDEMPTION_CODE_INVALID: '兑换码无效，请检查后重试',
  REDEMPTION_CODE_EXPIRED: '兑换码已过期',
  REDEMPTION_CODE_EXHAUSTED: '兑换码已达使用上限',
  UNAUTHORIZED: '请先登录后再兑换',
};

export async function redeemPackCode(code: string): Promise<RedeemCodeResponse> {
  const token = await readSessionToken();
  if (!token) {
    throw new Error(REDEMPTION_ERROR_MESSAGES.UNAUTHORIZED);
  }

  try {
    return await redeemPackCodeRequest(token, code);
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw new Error(REDEMPTION_ERROR_MESSAGES[error.code] ?? error.message);
    }
    throw error;
  }
}
