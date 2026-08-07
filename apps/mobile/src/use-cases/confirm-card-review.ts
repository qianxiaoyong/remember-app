import { applyReview, type ReviewRating } from '@remember/domain';
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

export interface ConfirmCardReviewInput {
  packId: string;
  knowledgeId: string;
  rating: ReviewRating;
  now?: Date;
}

export function confirmCardReview(input: ConfirmCardReviewInput): ActiveStudySession {
  const now = input.now ?? new Date();
  const { packId, knowledgeId, rating } = input;
  const contentPackId = resolveContentPackId(packId);
  const activeSession = findActiveStudySessionForInstalledPack(packId);
  if (!activeSession) {
    throw new Error('no active study session');
  }

  const pendingItems = listPendingQueueItemsForSession(activeSession.sessionId);
  const currentItem = pendingItems[0];
  if (currentItem?.knowledgeId !== knowledgeId) {
    throw new Error('review target does not match current queue item');
  }

  const previous = getLearningState(knowledgeId);
  const previousState = previous
    ? {
        easiness: previous.easiness,
        intervalDays: previous.intervalDays,
        repetitions: previous.repetitions,
        dueAt: previous.dueAt,
      }
    : null;
  const nextState = applyReview({ previous: previousState, rating, now });
  const updatedAt = now.toISOString();
  const nextClientVersion = (previous?.clientVersion ?? 0) + 1;

  const learningRow: LearningStateRow = {
    knowledgeId,
    packId: contentPackId,
    easiness: nextState.easiness,
    intervalDays: nextState.intervalDays,
    repetitions: nextState.repetitions,
    dueAt: nextState.dueAt,
    clientVersion: nextClientVersion,
    updatedAt,
    inReviewPool: previous?.inReviewPool ?? nextState.repetitions > 0,
    boxLevel: previous?.boxLevel ?? 0,
    firstAddedFromPackId: previous?.firstAddedFromPackId ?? contentPackId,
    lastSeenInPackId: previous?.lastSeenInPackId ?? null,
    consecutiveLevel3Passes: previous?.consecutiveLevel3Passes ?? 0,
  };

  const eventId = createRecordId('sync');
  const payload = buildSyncOutboxPayload({ row: learningRow });

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
