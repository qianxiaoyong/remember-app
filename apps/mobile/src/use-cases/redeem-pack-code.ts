import { readSessionToken } from '../data/session/session-store';
import { redeemPackCodeRequest } from '../data/api/redemption-api';
import { ApiNetworkError, ApiRequestError } from '../data/api/api-client';
import { AuthRequiredError } from './auth-required-error';
import type { RedeemCodeResponse } from '@remember/contracts';

const UNAUTHORIZED_MESSAGE = '请先登录后再兑换';

const REDEMPTION_ERROR_MESSAGES: Record<string, string> = {
  REDEMPTION_CODE_INVALID: '兑换码无效，请检查后重试',
  REDEMPTION_CODE_EXPIRED: '兑换码已过期',
  REDEMPTION_CODE_EXHAUSTED: '兑换码已达使用上限',
  UNAUTHORIZED: UNAUTHORIZED_MESSAGE,
};

const REDEMPTION_INVALID_HINT = '若确认码无误，请让开发者在 API 目录执行 pnpm seed:dev-bootstrap';

export async function redeemPackCode(code: string): Promise<RedeemCodeResponse> {
  const token = await readSessionToken();
  if (!token) {
    throw new AuthRequiredError(UNAUTHORIZED_MESSAGE);
  }

  try {
    return await redeemPackCodeRequest(token, code);
  } catch (error) {
    if (error instanceof ApiNetworkError) {
      throw new Error('无法连接服务器，请检查网络后重试', { cause: error });
    }
    if (error instanceof ApiRequestError) {
      const base = REDEMPTION_ERROR_MESSAGES[error.code] ?? error.message;
      if (error.code === 'REDEMPTION_CODE_INVALID') {
        throw new Error(`${base}\n${REDEMPTION_INVALID_HINT}`, { cause: error });
      }
      throw new Error(base, { cause: error });
    }
    throw error;
  }
}
