import { describe, expect, it } from 'vitest';
import { ApiNetworkError, ApiRequestError, shouldUseOfflineCatalogFallback } from './api-errors';

describe('shouldUseOfflineCatalogFallback', () => {
  it('网络错误时回退', () => {
    expect(shouldUseOfflineCatalogFallback(new ApiNetworkError())).toBe(true);
  });

  it('404 时回退', () => {
    expect(
      shouldUseOfflineCatalogFallback(new ApiRequestError(404, 'PACK_NOT_FOUND', '未找到')),
    ).toBe(true);
  });

  it('5xx 时回退', () => {
    expect(
      shouldUseOfflineCatalogFallback(new ApiRequestError(503, 'UNAVAILABLE', '服务不可用')),
    ).toBe(true);
  });

  it('401 等业务错误不回退', () => {
    expect(
      shouldUseOfflineCatalogFallback(new ApiRequestError(401, 'UNAUTHORIZED', '未登录')),
    ).toBe(false);
  });
});
