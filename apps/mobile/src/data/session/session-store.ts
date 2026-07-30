import type { SessionUser } from '@remember/contracts';
import { sessionUserSchema } from '@remember/contracts';
import * as SecureStore from 'expo-secure-store';

const SESSION_TOKEN_KEY = 'remember.sessionToken';
const SESSION_USER_CACHE_KEY = 'remember.sessionUserCache';
const SESSION_KICK_ALERT_PENDING_KEY = 'remember.sessionKickAlertPending';
const LOGIN_GUIDE_DISMISSED_KEY = 'remember.loginGuideDismissed';

export async function readSessionToken(): Promise<string | null> {
  return SecureStore.getItemAsync(SESSION_TOKEN_KEY);
}

export async function writeSessionToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
}

export async function clearSessionToken(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
}

export async function readCachedSessionUser(): Promise<SessionUser | null> {
  const raw = await SecureStore.getItemAsync(SESSION_USER_CACHE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return sessionUserSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function writeCachedSessionUser(user: SessionUser): Promise<void> {
  await SecureStore.setItemAsync(SESSION_USER_CACHE_KEY, JSON.stringify(user));
}

export async function clearCachedSessionUser(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_USER_CACHE_KEY);
}

export async function markSessionKickAlertPending(): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KICK_ALERT_PENDING_KEY, '1');
}

export async function consumeSessionKickAlertPending(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(SESSION_KICK_ALERT_PENDING_KEY);
  if (value !== '1') {
    return false;
  }
  await SecureStore.deleteItemAsync(SESSION_KICK_ALERT_PENDING_KEY);
  return true;
}

export async function clearSessionKickAlertPending(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KICK_ALERT_PENDING_KEY);
}

export async function isLoginGuideDismissed(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(LOGIN_GUIDE_DISMISSED_KEY);
  return value === '1';
}

export async function markLoginGuideDismissed(): Promise<void> {
  await SecureStore.setItemAsync(LOGIN_GUIDE_DISMISSED_KEY, '1');
}
