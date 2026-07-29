import { getInstalledPack } from '../data/repositories/installed-pack-repository';
import type { ActiveStudySession } from './study-session-types';

export type StudySessionOutcome = 'completed' | 'empty' | null;

export function resolveStudySessionOutcome(
  session: ActiveStudySession | null,
): StudySessionOutcome {
  if (!session) {
    return null;
  }

  if (session.totalCount === 0) {
    return 'empty';
  }

  if (!session.currentItem && session.completedCount > 0) {
    return 'completed';
  }

  return null;
}

export function resolveStudyPackDisplayName(packId: string): string {
  return getInstalledPack(packId)?.displayName ?? packId;
}
