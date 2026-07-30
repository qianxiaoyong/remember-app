import {
  getLearningState,
  upsertLearningState,
  type LearningStateRow,
} from '../../data/repositories/learning-state-repository';
import { fetchLearningStatesSnapshot } from '../../data/api/sync-api';

export async function restoreLearningStatesFromSnapshot(sessionToken: string): Promise<number> {
  const snapshot = await fetchLearningStatesSnapshot(sessionToken);
  let appliedCount = 0;

  for (const item of snapshot.items) {
    if (
      upsertLearningStateIfNewer({
        knowledgeId: item.knowledgeId,
        packId: item.packId,
        easiness: item.easiness,
        intervalDays: item.intervalDays,
        repetitions: item.repetitions,
        dueAt: item.dueAt,
        clientVersion: item.clientVersion,
        updatedAt: item.updatedAt,
      })
    ) {
      appliedCount += 1;
    }
  }

  return appliedCount;
}

function upsertLearningStateIfNewer(row: LearningStateRow): boolean {
  const existing = getLearningState(row.knowledgeId);
  if (existing && existing.clientVersion >= row.clientVersion) {
    return false;
  }
  upsertLearningState(row);
  return true;
}
