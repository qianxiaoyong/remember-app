import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../data/device/get-or-create-device-id', () => ({
  getOrCreateDeviceId: vi.fn(() => Promise.resolve('device-1')),
}));

vi.mock('../../data/api/auth-api', () => ({
  verifySmsCodeRequest: vi.fn(),
}));

vi.mock('../../data/session/session-store', () => ({
  clearSessionKickAlertPending: vi.fn(() => Promise.resolve(undefined)),
  readSessionToken: vi.fn(() => Promise.resolve('token-1')),
  writeCachedSessionUser: vi.fn(() => Promise.resolve(undefined)),
  writeSessionToken: vi.fn(() => Promise.resolve(undefined)),
}));

vi.mock('../sync/restore-learning-states-from-snapshot', () => ({
  restoreLearningStatesFromSnapshot: vi.fn(() => Promise.resolve(0)),
}));

vi.mock('../sync/upload-pending-sync-outbox', () => ({
  uploadPendingSyncOutbox: vi.fn(() => Promise.resolve(undefined)),
}));

vi.mock('../../shell/library-refresh-signal', () => ({
  markLibraryNeedsRefresh: vi.fn(),
}));

import { verifySmsCodeRequest } from '../../data/api/auth-api';
import { restoreLearningStatesFromSnapshot } from '../sync/restore-learning-states-from-snapshot';
import { schedulePostLoginSync, verifySmsLogin } from './verify-sms-login';

describe('verifySmsLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifySmsCodeRequest).mockResolvedValue({
      token: 'token-1',
      user: {
        userId: 'user-1',
        maskedPhone: '138****0000',
        displayName: '用户',
      },
    });
  });

  it('登录成功后不等待快照恢复', async () => {
    const loginPromise = verifySmsLogin('13800000000', '000000');
    await expect(loginPromise).resolves.toMatchObject({ userId: 'user-1' });
    expect(restoreLearningStatesFromSnapshot).not.toHaveBeenCalled();

    schedulePostLoginSync();
    await Promise.resolve();
    expect(restoreLearningStatesFromSnapshot).toHaveBeenCalledWith('token-1');
  });
});
