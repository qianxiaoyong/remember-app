import { createRecordId } from '../data/create-record-id';
import {
  getLearningState,
  upsertLearningState,
  type LearningStateRow,
} from '../data/repositories/learning-state-repository';
import {
  appendQueueItem,
  getMaxQueueSortOrder,
  hasPendingQueueItemForKnowledge,
  touchSessionUpdatedAt,
} from '../data/repositories/study-session-repository';
import { openUserDatabase } from '../data/user-db/open-user-database';
import { resolveContentPackId } from './resolve-content-pack-id';
import { findActiveStudySessionForInstalledPack } from './find-active-study-session';

export interface RejoinCardReviewResult {
  addedToQueue: boolean;
  alreadyPending: boolean;
}

export function rejoinCardReview(input: {
  packId: string;
  knowledgeId: string;
  now?: Date;
}): RejoinCardReviewResult {
  const now = input.now ?? new Date();
  const updatedAt = now.toISOString();
  const contentPackId = resolveContentPackId(input.packId);
  const previous = getLearningState(input.knowledgeId);

  const learningRow: LearningStateRow = previous
    ? {
        ...previous,
        packId: contentPackId,
        dueAt: updatedAt,
        updatedAt,
      }
    : {
        knowledgeId: input.knowledgeId,
        packId: contentPackId,
        easiness: 2.5,
        intervalDays: 0,
        repetitions: 1,
        dueAt: updatedAt,
        clientVersion: 0,
        updatedAt,
      };

  const activeSession = findActiveStudySessionForInstalledPack(input.packId);
  if (!activeSession) {
    upsertLearningState(learningRow);
    return { addedToQueue: false, alreadyPending: false };
  }

  if (hasPendingQueueItemForKnowledge(activeSession.sessionId, input.knowledgeId)) {
    upsertLearningState(learningRow);
    return { addedToQueue: false, alreadyPending: true };
  }

  const db = openUserDatabase();
  db.execSync('BEGIN IMMEDIATE');
  try {
    upsertLearningState(learningRow, db);
    appendQueueItem(
      {
        itemId: createRecordId('queue'),
        sessionId: activeSession.sessionId,
        knowledgeId: input.knowledgeId,
        itemType: 'review',
        sortOrder: getMaxQueueSortOrder(activeSession.sessionId, db) + 1,
        status: 'pending',
      },
      db,
    );
    touchSessionUpdatedAt(activeSession.sessionId, updatedAt, db);
    db.execSync('COMMIT');
  } catch (error) {
    db.execSync('ROLLBACK');
    throw error;
  }

  return { addedToQueue: true, alreadyPending: false };
}
