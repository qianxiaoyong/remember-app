import { logoutRequest } from '../../data/api/auth-api';
import { clearCachedSessionUser, clearLastSyncedAt, clearSessionKickAlertPending, clearSessionToken, readSessionToken } from '../../data/session/session-store';

export async function logout(): Promise<void> {
  const sessionToken = await readSessionToken();
  if (sessionToken) {
    try {
      await logoutRequest(sessionToken);
    } catch {
      // 会话可能已在其他设备失效；本地仍清除 token
    }
  }
  await clearSessionToken();
  await clearCachedSessionUser();
  await clearSessionKickAlertPending();
  await clearLastSyncedAt();
}
