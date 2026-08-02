import { createRecordId } from '../data/create-record-id';
import {
  getLearningState,
  upsertLearningState,
  type LearningStateRow,
} from '../data/repositories/learning-state-repository';
import {
  listPendingQueueItemsForSession,
  listQueueItemsForSession,
  markQueueItemDone,
  touchSessionUpdatedAt,
  updateSessionStatus,
} from '../data/repositories/study-session-repository';
import { insertSyncOutboxItem } from '../data/repositories/sync-outbox-repository';
import { buildSyncOutboxPayload } from '../data/sync/build-sync-outbox-payload';
import { openUserDatabase } from '../data/user-db/open-user-database';
import { buildActiveStudySession, type ActiveStudySession } from './study-session-types';
import { resolveContentPackId } from './resolve-content-pack-id';
import { findActiveStudySessionForInstalledPack } from './find-active-study-session';
import { uploadPendingSyncOutbox } from './sync/upload-pending-sync-outbox';
import { buildLessonCompleteLearningState } from './lesson-complete-sentinel';

export interface ConfirmLessonCompleteInput {
  packId: string;
  knowledgeId: string;
  now?: Date;
}

/** story_reading 专用：写入完成哨兵，不走 SM-2 applyReview */
export function confirmLessonComplete(input: ConfirmLessonCompleteInput): ActiveStudySession {
  const now = input.now ?? new Date();
  const { packId, knowledgeId } = input;
  const contentPackId = resolveContentPackId(packId);
  const activeSession = findActiveStudySessionForInstalledPack(packId);
  if (!activeSession) {
    throw new Error('no active study session');
  }

  const pendingItems = listPendingQueueItemsForSession(activeSession.sessionId);
  const currentItem = pendingItems[0];
  if (currentItem?.knowledgeId !== knowledgeId) {
    throw new Error('lesson complete target does not match current queue item');
  }

  const previous = getLearningState(knowledgeId);
  const updatedAt = now.toISOString();
  const nextClientVersion = (previous?.clientVersion ?? 0) + 1;

  const learningRow: LearningStateRow = buildLessonCompleteLearningState({
    knowledgeId,
    packId: contentPackId,
    clientVersion: nextClientVersion,
    updatedAt,
  });

  const eventId = createRecordId('sync');
  const payload = buildSyncOutboxPayload({ row: learningRow, rating: 'good' });

  const db = openUserDatabase();
  db.execSync('BEGIN IMMEDIATE');
  try {
    upsertLearningState(learningRow, db);
    markQueueItemDone(currentItem.itemId, db);
    insertSyncOutboxItem(
      {
        eventId,
        knowledgeId,
        clientVersion: nextClientVersion,
        payload,
        createdAt: updatedAt,
      },
      db,
    );
    touchSessionUpdatedAt(activeSession.sessionId, updatedAt, db);

    const remainingPending = pendingItems.length - 1;
    if (remainingPending === 0) {
      updateSessionStatus({
        sessionId: activeSession.sessionId,
        status: 'completed',
        updatedAt,
        db,
      });
    }

    db.execSync('COMMIT');
  } catch (error) {
    db.execSync('ROLLBACK');
    throw error;
  }

  const allItems = listQueueItemsForSession(activeSession.sessionId);
  void uploadPendingSyncOutbox();
  return buildActiveStudySession(activeSession.sessionId, packId, allItems);
}
