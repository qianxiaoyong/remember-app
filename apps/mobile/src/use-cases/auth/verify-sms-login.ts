import { getOrCreateDeviceId } from '../../data/device/get-or-create-device-id';
import { verifySmsCodeRequest } from '../../data/api/auth-api';
import {
  clearSessionKickAlertPending,
  writeCachedSessionUser,
  writeSessionToken,
} from '../../data/session/session-store';
import type { SessionUser } from '@remember/contracts';

export async function verifySmsLogin(phone: string, code: string): Promise<SessionUser> {
  const deviceId = await getOrCreateDeviceId();
  const response = await verifySmsCodeRequest({ phone, code, deviceId });
  await writeSessionToken(response.token);
  await writeCachedSessionUser(response.user);
  await clearSessionKickAlertPending();
  return response.user;
}
