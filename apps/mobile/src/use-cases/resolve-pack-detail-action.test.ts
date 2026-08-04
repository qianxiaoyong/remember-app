import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../data/api/api-client', () => {
  class ApiNetworkError extends Error {
    override name = 'ApiNetworkError';
  }

  class ApiRequestError extends Error {
    override name = 'ApiRequestError';

    constructor(
      readonly status: number,
      readonly code: string,
      message: string,
    ) {
      super(message);
    }
  }

  return { ApiNetworkError, ApiRequestError };
});

vi.mock('../data/api/pack-access-api', () => ({
  fetchMyPackAccess: vi.fn(),
}));

vi.mock('../data/session/session-store', () => ({
  readSessionToken: vi.fn(),
}));

import { ApiNetworkError } from '../data/api/api-client';
import { fetchMyPackAccess } from '../data/api/pack-access-api';
import { readSessionToken } from '../data/session/session-store';
import { resolveDetailAction, resolvePackAccess } from './resolve-pack-detail-action';

describe('resolvePackAccess', () => {
  beforeEach(() => {
    vi.mocked(readSessionToken).mockResolvedValue('session-token');
  });

  it('权益 API 失败时返回 unknown', async () => {
    vi.mocked(fetchMyPackAccess).mockRejectedValue(new ApiNetworkError());

    await expect(resolvePackAccess('demo-primary-grade3')).resolves.toEqual({
      status: 'unknown',
      reason: 'network',
    });
  });
});

describe('resolveDetailAction', () => {
  it('权益 unknown 时不降级为立即购买', () => {
    const action = resolveDetailAction({
      isInstalled: false,
      packAccess: { status: 'unknown', reason: 'network' },
      isBundledTestPack: false,
    });

    expect(action.actionKind).toBe('retry_access');
    expect(action.packAccessUnavailable).toBe(true);
    expect(action.actionLabel).toBe('重试');
  });

  it('未拥有且权益可查时显示立即购买', () => {
    const action = resolveDetailAction({
      isInstalled: false,
      packAccess: { status: 'denied' },
      isBundledTestPack: false,
    });

    expect(action.actionKind).toBe('purchase');
    expect(action.packAccessUnavailable).toBe(false);
  });

  it('已安装且 catalog 版本更高时显示更新', () => {
    const action = resolveDetailAction({
      isInstalled: true,
      installedPackVersion: '1.0.0',
      catalogPackVersion: '1.0.1',
      packAccess: { status: 'granted' },
      isBundledTestPack: false,
    });

    expect(action.actionKind).toBe('update');
    expect(action.actionLabel).toBe('更新');
  });
});
