import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  createSessionToken,
  createSmsCode,
  hashPhone,
  hashSessionToken,
  hashSmsCode,
  maskPhone,
} from './crypto.js';

describe('auth crypto', () => {
  it('手机号哈希与脱敏稳定', () => {
    const hashA = hashPhone('13800138000', 'pepper');
    const hashB = hashPhone('13800138000', 'pepper');
    expect(hashA).toBe(hashB);
    expect(maskPhone('13800138000')).toBe('138****8000');
  });

  it('验证码与 session 哈希可复现', () => {
    const codeHash = hashSmsCode('challenge-id', '123456', 'pepper');
    expect(codeHash).toBe(
      createHash('sha256').update('challenge-id:123456:pepper', 'utf8').digest('hex'),
    );

    const token = createSessionToken();
    expect(token.length).toBeGreaterThan(20);
    expect(hashSessionToken(token)).toHaveLength(64);
  });

  it('mock 模式固定验证码', () => {
    expect(createSmsCode(true)).toBe('000000');
    expect(createSmsCode(false)).toMatch(/^\d{6}$/);
  });
});
