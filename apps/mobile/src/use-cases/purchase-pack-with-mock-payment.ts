import { readSessionToken } from '../data/session/session-store';
import {
  createOrderRequest,
  fetchOrderDetail,
  simulateMockPaymentNotify,
} from '../data/api/order-api';
import { ApiRequestError } from '../data/api/api-client';
import { AuthRequiredError, throwIfUnauthorized } from './auth-required-error';

const UNAUTHORIZED_MESSAGE = '请先登录后再购买';

const PURCHASE_ERROR_MESSAGES: Record<string, string> = {
  PACK_ALREADY_OWNED: '您已拥有该知识库',
  PACK_NOT_FOUND: '未找到该知识库',
  UNAUTHORIZED: UNAUTHORIZED_MESSAGE,
};

export async function purchasePackWithMockPayment(packId: string): Promise<'paid' | 'pending'> {
  const token = await readSessionToken();
  if (!token) {
    throw new AuthRequiredError(UNAUTHORIZED_MESSAGE);
  }

  try {
    const order = await createOrderRequest(token, packId);
    await simulateMockPaymentNotify(token, order.orderId, order.amountCents);

    const detail = await fetchOrderDetail(token, order.orderId);
    return detail.status === 'paid' ? 'paid' : 'pending';
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throwIfUnauthorized(error, UNAUTHORIZED_MESSAGE);
      throw new Error(PURCHASE_ERROR_MESSAGES[error.code] ?? error.message, { cause: error });
    }
    throw error;
  }
}
