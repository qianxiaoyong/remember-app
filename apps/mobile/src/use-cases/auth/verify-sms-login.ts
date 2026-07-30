import { getOrCreateDeviceId } from '../../data/device/get-or-create-device-id';
import { verifySmsCodeRequest } from '../../data/api/auth-api';
import {
  clearSessionKickAlertPending,
  writeCachedSessionUser,
  writeSessionToken,
} from '../../data/session/session-store';
import { restoreLearningStatesFromSnapshot } from '../sync/restore-learning-states-from-snapshot';
import { uploadPendingSyncOutbox } from '../sync/upload-pending-sync-outbox';
import type { SessionUser } from '@remember/contracts';

export async function verifySmsLogin(phone: string, code: string): Promise<SessionUser> {
  const deviceId = await getOrCreateDeviceId();
  const response = await verifySmsCodeRequest({ phone, code, deviceId });
  await writeSessionToken(response.token);
  await writeCachedSessionUser(response.user);
  await clearSessionKickAlertPending();

  void runPostLoginSync(response.token);

  return response.user;
}

async function runPostLoginSync(token: string): Promise<void> {
  try {
    await restoreLearningStatesFromSnapshot(token);
  } catch {
    // 恢复快照失败不阻断 outbox 上传
  }

  try {
    await uploadPendingSyncOutbox(token);
  } catch {
    // 后台 worker 会继续重试 upload
  }
}
