import { getOrCreateDeviceId } from '../../data/device/get-or-create-device-id';
import { verifySmsCodeRequest } from '../../data/api/auth-api';
import {
  clearSessionKickAlertPending,
  readSessionToken,
  writeCachedSessionUser,
  writeSessionToken,
} from '../../data/session/session-store';
import { markLibraryNeedsRefresh } from '../../shell/library-refresh-signal';
import { restoreLearningStatesFromSnapshot } from '../sync/restore-learning-states-from-snapshot';
import { uploadPendingSyncOutbox } from '../sync/upload-pending-sync-outbox';
import type { SessionUser } from '@remember/contracts';

export async function verifySmsLogin(phone: string, code: string): Promise<SessionUser> {
  const deviceId = await getOrCreateDeviceId();
  const response = await verifySmsCodeRequest({ phone, code, deviceId });
  await writeSessionToken(response.token);
  await writeCachedSessionUser(response.user);
  await clearSessionKickAlertPending();

  return response.user;
}

export function schedulePostLoginSync(): void {
  void readSessionToken().then((token) => {
    if (!token) {
      return;
    }
    void runPostLoginSync(token);
  });
}

async function runPostLoginSync(token: string): Promise<void> {
  await restoreLearningStatesFromSnapshot(token);
  markLibraryNeedsRefresh();

  try {
    await uploadPendingSyncOutbox(token);
  } catch {
    // 上传失败保留 outbox，后台 worker 会继续重试
  }
}
