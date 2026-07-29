import { findActiveSessionWithPendingItems } from '../data/repositories/study-session-repository';

export type AppLaunchTarget =
  | { kind: 'study'; packId: string }
  | { kind: 'library' };

export function resolveAppLaunchTarget(): AppLaunchTarget {
  const activeSession = findActiveSessionWithPendingItems();
  if (activeSession) {
    return { kind: 'study', packId: activeSession.packId };
  }
  return { kind: 'library' };
}
