import { describe, expect, it } from 'vitest';
import { hashRedemptionCode } from './redemption-code-hash.js';

describe('hashRedemptionCode', () => {
  it('规范化大小写与首尾空格', () => {
    const pepper = 'test-pepper';
    const a = hashRedemptionCode(' test-redeem-001 ', pepper);
    const b = hashRedemptionCode('TEST-REDEEM-001', pepper);
    expect(a).toBe(b);
  });
});
