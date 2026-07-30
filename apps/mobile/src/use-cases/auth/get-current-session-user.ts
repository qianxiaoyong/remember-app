import { fetchCurrentUser } from '../../data/api/auth-api';
import { ApiNetworkError, ApiRequestError } from '../../data/api/api-client';
import {
  clearCachedSessionUser,
  clearSessionToken,
  markSessionKickAlertPending,
  readSessionToken,
  writeCachedSessionUser,
} from '../../data/session/session-store';
import type { SessionUser } from '@remember/contracts';

export async function getCurrentSessionUser(): Promise<SessionUser | null> {
  const sessionToken = await readSessionToken();
  if (!sessionToken) {
    return null;
  }

  try {
    const sessionUser = await fetchCurrentUser(sessionToken);
    await writeCachedSessionUser(sessionUser);
    return sessionUser;
  } catch (error) {
    if (error instanceof ApiNetworkError) {
      return null;
    }
    if (error instanceof ApiRequestError && error.status === 401) {
      await clearSessionToken();
      await clearCachedSessionUser();
      return null;
    }
    if (error instanceof ApiRequestError && error.status === 403) {
      await markSessionKickAlertPending();
      throw error;
    }
    throw error;
  }
}
