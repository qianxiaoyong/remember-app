import { describe, expect, it } from 'vitest';
import { healthResponseSchema } from './health.js';

describe('healthResponseSchema', () => {
  it('接受唯一健康状态', () => {
    expect(healthResponseSchema.parse({ status: 'ok' })).toEqual({ status: 'ok' });
  });

  it('拒绝未知状态和多余字段', () => {
    expect(() => healthResponseSchema.parse({ status: 'down' })).toThrow();
    expect(() => healthResponseSchema.parse({ status: 'ok', detail: 'x' })).toThrow();
  });
});
