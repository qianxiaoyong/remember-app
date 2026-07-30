import { describe, expect, it } from 'vitest';
import { redeemCodeRequestSchema, redeemCodeResponseSchema } from './index.js';
import { listMyPackAccessResponseSchema } from '../pack-access/index.js';

describe('redemption contracts', () => {
  it('redeemCode round-trip', () => {
    const request = redeemCodeRequestSchema.parse({ code: ' TEST-REDEEM-001 ' });
    expect(request.code).toBe('TEST-REDEEM-001');

    const response = redeemCodeResponseSchema.parse({
      packId: 'remember-test-pack',
      alreadyOwned: false,
    });
    expect(response.packId).toBe('remember-test-pack');
  });

  it('listMyPackAccess round-trip', () => {
    const response = listMyPackAccessResponseSchema.parse({
      items: [
        {
          packId: 'remember-test-pack',
          grantedAt: '2026-07-30T08:00:00.000Z',
          source: 'redemption',
        },
      ],
    });
    expect(response.items[0]?.source).toBe('redemption');
  });
});
