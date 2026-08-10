import { applyBoxReview, formatLocalReviewDate } from '@remember/domain';
import { createRecordId } from '../data/create-record-id';
import {
  getLearningStateByKnowledgeId,
  upsertReviewPoolState,
  type LearningStateRow,
} from '../data/repositories/learning-state-repository';
import {
  listPendingQueueItemsForSession,
  markQueueItemDone,
  touchSessionUpdatedAt,
  updateSessionStatus,
} from '../data/repositories/study-session-repository';
import { incrementReviewCompletedCount } from '../data/repositories/review-daily-stats-repository';
import { insertSyncOutboxItem } from '../data/repositories/sync-outbox-repository';
import { buildSyncOutboxPayload } from '../data/sync/build-sync-outbox-payload';
import { openUserDatabase } from '../data/user-db/open-user-database';
import { getDeviceTimeZone } from '../lib/get-device-time-zone';
import { findActiveReviewSession } from './find-active-review-session';
import { uploadPendingSyncOutbox } from './sync/upload-pending-sync-outbox';
import { markReviewPoolChanged } from '../shell/review-pool-changed-signal';
import { writeReviewOutcomeActivityEvent } from './write-activity-event-from-review';

export function confirmReviewOutcome(input: {
  sessionId?: string;
  knowledgeId: string;
  outcome: 'passed' | 'failed';
  displayLabel?: string;
  activitySource?: 'browse' | 'review_tab' | 'calendar_inspect';
  inspectMode?: boolean;
  now?: Date;
}): void {
  const now = input.now ?? new Date();
  const timeZone = getDeviceTimeZone();
  const inspectMode = input.inspectMode === true;

  let currentItem: { itemId: string; knowledgeId: string } | null = null;
  let activeSession: { sessionId: string } | null = null;
  let pendingItems: { itemId: string; knowledgeId: string }[] = [];

  if (!inspectMode) {
    activeSession = findActiveReviewSession();
    if (!input.sessionId || activeSession?.sessionId !== input.sessionId) {
      throw new Error('no active review session');
    }

    pendingItems = listPendingQueueItemsForSession(activeSession.sessionId);
    currentItem = pendingItems[0] ?? null;
    if (currentItem?.knowledgeId !== input.knowledgeId) {
      throw new Error('review target does not match current queue item');
    }
  }

  const previous = getLearningStateByKnowledgeId(input.knowledgeId);
  if (!previous?.inReviewPool) {
    throw new Error('knowledge item is not in review pool');
  }

  const nextPoolState = applyBoxReview({
    previous: {
      inReviewPool: previous.inReviewPool,
      boxLevel: previous.boxLevel,
      dueAt: previous.dueAt,
      consecutiveLevel3Passes: previous.consecutiveLevel3Passes,
    },
    outcome: input.outcome,
    now,
    timeZone,
  });

  const updatedAt = now.toISOString();
  const nextClientVersion = previous.clientVersion + 1;
  const learningRow: LearningStateRow = {
    ...previous,
    dueAt: new Date(nextPoolState.dueAt).toISOString(),
    boxLevel: nextPoolState.boxLevel,
    consecutiveLevel3Passes: nextPoolState.consecutiveLevel3Passes ?? 0,
    clientVersion: nextClientVersion,
    updatedAt,
  };
  const payload = buildSyncOutboxPayload({ row: learningRow, outcome: input.outcome });
  const localDate = formatLocalReviewDate(now, timeZone);

  const db = openUserDatabase();
  db.execSync('BEGIN IMMEDIATE');
  try {
    upsertReviewPoolState(learningRow, db);
    if (!inspectMode && currentItem && activeSession) {
      markQueueItemDone(currentItem.itemId, db);
    }
    incrementReviewCompletedCount(localDate, updatedAt, db);
    insertSyncOutboxItem(
      {
        eventId: createRecordId('sync'),
        knowledgeId: input.knowledgeId,
        clientVersion: nextClientVersion,
        payload,
        createdAt: updatedAt,
      },
      db,
    );
    if (!inspectMode && activeSession) {
      touchSessionUpdatedAt(activeSession.sessionId, updatedAt, db);

      if (pendingItems.length === 1) {
        updateSessionStatus({
          sessionId: activeSession.sessionId,
          status: 'completed',
          updatedAt,
          db,
        });
      }
    }

    db.execSync('COMMIT');
  } catch (error) {
    db.execSync('ROLLBACK');
    throw error;
  }

  void uploadPendingSyncOutbox();
  markReviewPoolChanged();

  if (input.displayLabel && previous.firstAddedFromPackId) {
    writeReviewOutcomeActivityEvent({
      catalogPackId: previous.firstAddedFromPackId,
      knowledgeId: input.knowledgeId,
      displayLabel: input.displayLabel,
      outcome: input.outcome,
      boxLevelAfter: learningRow.boxLevel,
      ...(input.activitySource ? { source: input.activitySource } : {}),
      now,
    });
  }
}
