import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../data/api/api-client', () => {
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

vi.mock('../../data/api/auth-api', () => ({
  fetchCurrentUser: vi.fn(),
}));

vi.mock('../../data/session/session-store', () => ({
  readSessionToken: vi.fn(),
  readCachedSessionUser: vi.fn(),
  writeCachedSessionUser: vi.fn(),
  clearSessionToken: vi.fn(),
  clearCachedSessionUser: vi.fn(),
  markSessionKickAlertPending: vi.fn(),
}));

import { fetchCurrentUser } from '../../data/api/auth-api';
import { ApiNetworkError, ApiRequestError } from '../../data/api/api-client';
import {
  clearCachedSessionUser,
  clearSessionToken,
  readCachedSessionUser,
  readSessionToken,
  writeCachedSessionUser,
} from '../../data/session/session-store';
import { getCurrentSessionUser } from './get-current-session-user';

const cachedUser = {
  userId: 'user-1',
  maskedPhone: '138****8000',
  displayName: '监护人',
};

describe('getCurrentSessionUser', () => {
  beforeEach(() => {
    vi.mocked(readSessionToken).mockReset();
    vi.mocked(readCachedSessionUser).mockReset();
    vi.mocked(fetchCurrentUser).mockReset();
    vi.mocked(writeCachedSessionUser).mockReset();
    vi.mocked(clearSessionToken).mockReset();
    vi.mocked(clearCachedSessionUser).mockReset();
  });

  it('无 token 时返回 null', async () => {
    vi.mocked(readSessionToken).mockResolvedValue(null);

    await expect(getCurrentSessionUser()).resolves.toBeNull();
  });

  it('断网时回退到本地缓存用户', async () => {
    vi.mocked(readSessionToken).mockResolvedValue('token-1');
    vi.mocked(fetchCurrentUser).mockRejectedValue(new ApiNetworkError());
    vi.mocked(readCachedSessionUser).mockResolvedValue(cachedUser);

    await expect(getCurrentSessionUser()).resolves.toEqual(cachedUser);
    expect(clearSessionToken).not.toHaveBeenCalled();
  });

  it('401 时清除会话', async () => {
    vi.mocked(readSessionToken).mockResolvedValue('token-1');
    vi.mocked(fetchCurrentUser).mockRejectedValue(
      new ApiRequestError(401, 'SESSION_INVALID', '会话无效'),
    );

    await expect(getCurrentSessionUser()).resolves.toBeNull();
    expect(clearSessionToken).toHaveBeenCalled();
    expect(clearCachedSessionUser).toHaveBeenCalled();
  });

  it('403 NOT_MAIN_DEVICE 时保留缓存并抛出', async () => {
    vi.mocked(readSessionToken).mockResolvedValue('token-1');
    vi.mocked(fetchCurrentUser).mockRejectedValue(
      new ApiRequestError(403, 'NOT_MAIN_DEVICE', '账号已在其他设备登录'),
    );

    await expect(getCurrentSessionUser()).rejects.toMatchObject({ code: 'NOT_MAIN_DEVICE' });
    expect(clearSessionToken).not.toHaveBeenCalled();
    expect(clearCachedSessionUser).not.toHaveBeenCalled();
  });

  it('在线校验成功时刷新缓存', async () => {
    vi.mocked(readSessionToken).mockResolvedValue('token-1');
    vi.mocked(fetchCurrentUser).mockResolvedValue(cachedUser);

    await expect(getCurrentSessionUser()).resolves.toEqual(cachedUser);
    expect(writeCachedSessionUser).toHaveBeenCalledWith(cachedUser);
  });
});
