import { describe, expect, it } from 'vitest';
import { createOrderResponseSchema } from './create-order.js';
import { orderDetailResponseSchema } from './get-order.js';

describe('order contracts', () => {
  it('createOrderResponse round-trip', () => {
    const response = createOrderResponseSchema.parse({
      orderId: '550e8400-e29b-41d4-a716-446655440000',
      packId: 'demo-primary-grade3',
      amountCents: 1990,
      status: 'pending',
      wechatPrepay: {
        appId: 'wxmockapp',
        partnerId: '1900000001',
        prepayId: 'wxmockprepay',
        packageValue: 'Sign=WXPay',
        nonceStr: 'abc123',
        timeStamp: '1700000000',
        sign: 'MOCK_SIGN',
      },
    });
    expect(response.status).toBe('pending');
  });

  it('orderDetailResponse round-trip', () => {
    const response = orderDetailResponseSchema.parse({
      orderId: '550e8400-e29b-41d4-a716-446655440000',
      packId: 'demo-primary-grade3',
      amountCents: 1990,
      status: 'paid',
      paidAt: '2026-07-30T08:00:00.000Z',
    });
    expect(response.status).toBe('paid');
  });
});
