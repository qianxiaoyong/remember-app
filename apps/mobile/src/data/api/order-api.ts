import type { CreateOrderResponse, OrderDetailResponse } from '@remember/contracts';
import {
  createOrderResponseSchema,
  orderDetailResponseSchema,
  simulatePaymentNotifyResponseSchema,
} from '@remember/contracts';
import { apiFetchJson } from './api-client';

export async function createOrderRequest(
  sessionToken: string,
  packId: string,
): Promise<CreateOrderResponse> {
  const body = await apiFetchJson<unknown>('/api/v1/orders', {
    method: 'POST',
    sessionToken,
    body: JSON.stringify({ packId }),
  });
  return createOrderResponseSchema.parse(body);
}

export async function fetchOrderDetail(
  sessionToken: string,
  orderId: string,
): Promise<OrderDetailResponse> {
  const body = await apiFetchJson<unknown>(`/api/v1/orders/${encodeURIComponent(orderId)}`, {
    method: 'GET',
    sessionToken,
  });
  return orderDetailResponseSchema.parse(body);
}

export async function simulateMockPaymentNotify(orderId: string): Promise<void> {
  const body = await apiFetchJson<unknown>('/api/v1/payment/test/simulate-notify', {
    method: 'POST',
    body: JSON.stringify({ orderId }),
  });
  simulatePaymentNotifyResponseSchema.parse(body);
}
