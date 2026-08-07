import {
  listPendingQueueItemsForSession,
  markQueueItemDone,
  touchSessionUpdatedAt,
  updateSessionStatus,
} from '../data/repositories/study-session-repository';
import { openUserDatabase } from '../data/user-db/open-user-database';
import { findActiveReviewSession } from './find-active-review-session';

/** 跳过无法加载卡面的队列项；不修改复习池 due / inReviewPool。 */
export function skipUnloadedReviewQueueItem(input: {
  sessionId: string;
  knowledgeId: string;
  now?: Date;
}): void {
  const now = input.now ?? new Date();
  const activeSession = findActiveReviewSession();
  if (activeSession?.sessionId !== input.sessionId) {
    throw new Error('no active review session');
  }

  const pendingItems = listPendingQueueItemsForSession(activeSession.sessionId);
  const currentItem = pendingItems[0];
  if (currentItem?.knowledgeId !== input.knowledgeId) {
    throw new Error('review target does not match current queue item');
  }

  const updatedAt = now.toISOString();
  const db = openUserDatabase();
  db.execSync('BEGIN IMMEDIATE');
  try {
    markQueueItemDone(currentItem.itemId, db);
    touchSessionUpdatedAt(activeSession.sessionId, updatedAt, db);

    if (pendingItems.length === 1) {
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
}
