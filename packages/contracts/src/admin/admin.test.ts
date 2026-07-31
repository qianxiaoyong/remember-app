import { describe, expect, it } from 'vitest';
import {
  adminLoginRequestSchema,
  adminLoginResponseSchema,
  adminLogoutResponseSchema,
} from './login.js';
import { adminSessionUserSchema } from './session-admin.js';
import { auditLogEntrySchema, auditLogWriteInputSchema } from './audit-log-entry.js';

describe('admin contracts', () => {
  it('adminLogin round-trip', () => {
    const request = adminLoginRequestSchema.parse({
      loginName: 'admin',
      password: 'dev-password',
    });
    expect(request.loginName).toBe('admin');

    const response = adminLoginResponseSchema.parse({
      token: 'opaque-admin-token',
      admin: {
        adminUserId: '550e8400-e29b-41d4-a716-446655440001',
        loginName: 'admin',
        role: 'super_admin',
      },
    });
    expect(response.admin.role).toBe('super_admin');
  });

  it('adminSessionUser 拒绝未知字段', () => {
    expect(() =>
      adminSessionUserSchema.parse({
        adminUserId: '550e8400-e29b-41d4-a716-446655440001',
        loginName: 'admin',
        role: 'super_admin',
        extra: true,
      }),
    ).toThrow();
  });

  it('拒绝过短密码与空 loginName', () => {
    expect(() =>
      adminLoginRequestSchema.parse({ loginName: 'admin', password: 'short' }),
    ).toThrow();
    expect(() =>
      adminLoginRequestSchema.parse({ loginName: '', password: 'long-enough' }),
    ).toThrow();
  });

  it('auditLogWriteInput round-trip', () => {
    const input = auditLogWriteInputSchema.parse({
      action: 'pack_access.grant',
      targetType: 'pack_access',
      targetId: 'remember-test-pack',
      payloadSummary: {
        packId: 'remember-test-pack',
        userId: '550e8400-e29b-41d4-a716-446655440001',
      },
      result: 'success',
    });
    expect(input.action).toBe('pack_access.grant');
  });

  it('auditLogEntry 含 ISO 时间', () => {
    const entry = auditLogEntrySchema.parse({
      id: '550e8400-e29b-41d4-a716-446655440002',
      actorAdminUserId: '550e8400-e29b-41d4-a716-446655440001',
      action: 'refund.create',
      targetType: 'order',
      targetId: '550e8400-e29b-41d4-a716-446655440003',
      payloadSummary: { amountCents: 1990 },
      result: 'failure',
      errorCode: 'REFUND_NOT_ALLOWED',
      createdAt: '2026-07-31T02:00:00.000Z',
    });
    expect(entry.errorCode).toBe('REFUND_NOT_ALLOWED');
  });

  it('adminLogoutResponse 仅接受 ok:true', () => {
    expect(adminLogoutResponseSchema.parse({ ok: true })).toEqual({ ok: true });
    expect(() => adminLogoutResponseSchema.parse({ ok: false })).toThrow();
  });
});
