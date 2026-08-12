import { describe, expect, it } from 'vitest';
import { sendSmsCodeRequestSchema, sendSmsCodeResponseSchema } from './send-sms-code.js';
import { verifySmsCodeRequestSchema, verifySmsCodeResponseSchema } from './verify-sms-code.js';
import { logoutResponseSchema, sessionUserSchema } from './session-user.js';

describe('auth contracts', () => {
  it('sendSmsCode round-trip', () => {
    const request = sendSmsCodeRequestSchema.parse({ phone: '13800138000' });
    expect(request.phone).toBe('13800138000');

    const response = sendSmsCodeResponseSchema.parse({
      expiresInSeconds: 300,
      resendAfterSeconds: 60,
    });
    expect(response.expiresInSeconds).toBe(300);
  });

  it('verifySmsCode round-trip', () => {
    const request = verifySmsCodeRequestSchema.parse({
      phone: '13800138000',
      code: '000000',
      deviceId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(request.code).toBe('000000');

    const response = verifySmsCodeResponseSchema.parse({
      token: 'opaque-token',
      user: {
        userId: '550e8400-e29b-41d4-a716-446655440001',
        maskedPhone: '138****8000',
        displayName: '用户',
      },
    });
    expect(response.user.displayName).toBe('用户');
  });

  it('sessionUser 拒绝未知字段', () => {
    expect(() =>
      sessionUserSchema.parse({
        userId: '550e8400-e29b-41d4-a716-446655440001',
        maskedPhone: '138****8000',
        displayName: '用户',
        extra: true,
      }),
    ).toThrow();
  });

  it('拒绝非法手机号与验证码', () => {
    expect(() => sendSmsCodeRequestSchema.parse({ phone: '12345' })).toThrow();
    expect(() =>
      verifySmsCodeRequestSchema.parse({
        phone: '13800138000',
        code: 'abc',
        deviceId: '550e8400-e29b-41d4-a716-446655440000',
      }),
    ).toThrow();
  });

  it('logoutResponse 仅接受 ok:true', () => {
    expect(logoutResponseSchema.parse({ ok: true })).toEqual({ ok: true });
    expect(() => logoutResponseSchema.parse({ ok: false })).toThrow();
  });
});
