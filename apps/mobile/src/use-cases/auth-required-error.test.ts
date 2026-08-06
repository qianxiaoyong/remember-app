import { describe, expect, it } from 'vitest';
import { AuthRequiredError, isAuthRequiredError, isSafeReturnToPath } from './auth-required-error';

describe('AuthRequiredError', () => {
  it('isAuthRequiredError 识别 AuthRequiredError', () => {
    const error = new AuthRequiredError('请先登录后再安装');
    expect(isAuthRequiredError(error)).toBe(true);
    expect(isAuthRequiredError(new Error('请先登录后再安装'))).toBe(false);
  });
});

describe('isSafeReturnToPath', () => {
  it('允许内部路径', () => {
    expect(isSafeReturnToPath('/library')).toBe(true);
    expect(isSafeReturnToPath('/pack/story-test-pack')).toBe(true);
    expect(isSafeReturnToPath('/redeem')).toBe(true);
  });

  it('拒绝外部或非法路径', () => {
    expect(isSafeReturnToPath('https://evil.com')).toBe(false);
    expect(isSafeReturnToPath('//evil.com')).toBe(false);
    expect(isSafeReturnToPath('/login')).toBe(false);
    expect(isSafeReturnToPath('')).toBe(false);
  });
});
