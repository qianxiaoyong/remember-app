import { describe, expect, it } from 'vitest';
import { ApiRequestError } from '../data/api/api-errors';
import {
  AuthRequiredError,
  isAuthRequiredError,
  isSafeReturnToPath,
  isUnauthorizedApiError,
  throwIfUnauthorized,
} from './auth-required-error';

describe('AuthRequiredError', () => {
  it('isAuthRequiredError 识别 AuthRequiredError', () => {
    const error = new AuthRequiredError('请先登录后再安装');
    expect(isAuthRequiredError(error)).toBe(true);
    expect(isAuthRequiredError(new Error('请先登录后再安装'))).toBe(false);
  });
});

describe('throwIfUnauthorized', () => {
  it('UNAUTHORIZED 码抛 AuthRequiredError', () => {
    const error = new ApiRequestError(401, 'UNAUTHORIZED', '未授权');
    expect(() => {
      throwIfUnauthorized(error, '请先登录后再兑换');
    }).toThrow(AuthRequiredError);
  });

  it('401 状态抛 AuthRequiredError', () => {
    const error = new ApiRequestError(401, 'SESSION_EXPIRED', '会话已过期');
    expect(isUnauthorizedApiError(error)).toBe(true);
    expect(() => {
      throwIfUnauthorized(error, '请先登录后再安装');
    }).toThrow(AuthRequiredError);
  });

  it('其他业务错误不抛 AuthRequiredError', () => {
    const error = new ApiRequestError(403, 'PACK_ACCESS_DENIED', '无权限');
    expect(() => {
      throwIfUnauthorized(error, '请先登录后再安装');
    }).not.toThrow();
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
