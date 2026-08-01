import { describe, expect, it } from 'vitest';
import {
  adminListRedemptionCodesQuerySchema,
  adminRedemptionCodeListItemSchema,
  adminUpdateRedemptionCodeRequestSchema,
} from './redemption.js';

describe('admin redemption contracts', () => {
  it('parses includeDeleted query flag', () => {
    expect(
      adminListRedemptionCodesQuerySchema.parse({ includeDeleted: 'true' }).includeDeleted,
    ).toBe(true);
    expect(
      adminListRedemptionCodesQuerySchema.parse({ includeDeleted: 'false' }).includeDeleted,
    ).toBe(false);
  });

  it('parses update payload', () => {
    const parsed = adminUpdateRedemptionCodeRequestSchema.parse({
      maxRedemptions: 10,
      status: 'disabled',
      note: '渠道 A',
      expiresAt: null,
    });
    expect(parsed.maxRedemptions).toBe(10);
    expect(parsed.status).toBe('disabled');
  });

  it('accepts list item with plaintext code', () => {
    const parsed = adminRedemptionCodeListItemSchema.parse({
      id: '11111111-1111-4111-8111-111111111111',
      packId: 'remember-test-pack',
      code: 'REDEEM-ABCD-EFGH',
      maxRedemptions: 5,
      redeemedCount: 1,
      status: 'active',
      isExhausted: false,
      canEdit: true,
      canRestore: false,
      createdAt: '2026-07-31T06:00:00.000Z',
      updatedAt: '2026-07-31T06:00:00.000Z',
    });
    expect(parsed.code).toBe('REDEEM-ABCD-EFGH');
  });
});
