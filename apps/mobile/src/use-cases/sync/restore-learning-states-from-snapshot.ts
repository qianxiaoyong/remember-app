import {
  getLearningState,
  upsertLearningState,
  type LearningStateRow,
} from '../../data/repositories/learning-state-repository';
import { fetchLearningStatesSnapshot } from '../../data/api/sync-api';
import type { SyncSnapshotItem } from '@remember/contracts';

export async function restoreLearningStatesFromSnapshot(sessionToken: string): Promise<number> {
  const snapshot = await fetchLearningStatesSnapshot(sessionToken);
  let appliedCount = 0;

  for (const item of snapshot.items) {
    if (upsertLearningStateIfNewer(mapSnapshotItemToLearningStateRow(item))) {
      appliedCount += 1;
    }
  }

  return appliedCount;
}

function mapSnapshotItemToLearningStateRow(item: SyncSnapshotItem): LearningStateRow {
  return {
    knowledgeId: item.knowledgeId,
    packId: item.firstAddedFromPackId,
    easiness: item.legacyEasiness ?? 2.5,
    intervalDays: item.legacyIntervalDays ?? 0,
    repetitions: item.legacyRepetitions ?? 0,
    dueAt: item.dueAt,
    clientVersion: item.clientVersion,
    updatedAt: item.updatedAt,
    inReviewPool: item.inReviewPool,
    boxLevel: item.boxLevel as LearningStateRow['boxLevel'],
    firstAddedFromPackId: item.firstAddedFromPackId,
    lastSeenInPackId: item.lastSeenInPackId ?? null,
    consecutiveLevel3Passes: item.consecutiveLevel3Passes ?? 0,
  };
}

function upsertLearningStateIfNewer(row: LearningStateRow): boolean {
  const existing = getLearningState(row.knowledgeId);
  if (existing && existing.clientVersion >= row.clientVersion) {
    return false;
  }
  upsertLearningState(row);
  return true;
}
