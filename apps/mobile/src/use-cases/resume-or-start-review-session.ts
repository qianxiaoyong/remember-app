import { buildReviewSessionPlan, formatLocalReviewDate } from '@remember/domain';
import { createRecordId } from '../data/create-record-id';
import { listDueReviewPoolItems } from '../data/repositories/learning-state-repository';
import { getReviewDailyStats } from '../data/repositories/review-daily-stats-repository';
import {
  insertQueueItems,
  insertStudySession,
  listPendingQueueItemsForSession,
  listQueueItemsForSession,
  type StudyQueueItemRow,
  updateSessionStatus,
} from '../data/repositories/study-session-repository';
import { openUserDatabase } from '../data/user-db/open-user-database';
import { getDailyReviewLimit } from '../data/repositories/user-preferences-repository';
import { getDeviceTimeZone } from '../lib/get-device-time-zone';
import { buildActiveStudySession, type ActiveStudySession } from './study-session-types';
import { findActiveReviewSession } from './find-active-review-session';
import { resolveReviewCardContext } from './resolve-review-card-context';
import { REVIEW_POOL_SESSION_PACK_ID } from './review-session-constants';

export function resumeOrStartReviewSession(
  now: Date = new Date(),
  options?: { forceRebuild?: boolean },
): ActiveStudySession {
  const timeZone = getDeviceTimeZone();
  const activeSession = findActiveReviewSession();
  if (activeSession) {
    const pendingItems = listPendingQueueItemsForSession(activeSession.sessionId);
    const firstPending = pendingItems[0];
    const canRestorePending =
      !options?.forceRebuild &&
      pendingItems.length > 0 &&
      firstPending !== undefined &&
      resolveReviewCardContext(firstPending.knowledgeId) !== null;

    if (canRestorePending) {
      const allItems = listQueueItemsForSession(activeSession.sessionId);
      return buildActiveStudySession(
        activeSession.sessionId,
        REVIEW_POOL_SESSION_PACK_ID,
        allItems,
      );
    }

    updateSessionStatus({
      sessionId: activeSession.sessionId,
      status: 'completed',
      updatedAt: now.toISOString(),
    });
  }

  const dueItems = listDueReviewPoolItems(now, timeZone);
  const localDate = formatLocalReviewDate(now, timeZone);
  const stats = getReviewDailyStats(localDate);
  const plan = buildReviewSessionPlan({
    dueItems: dueItems.map((item) => ({
      knowledgeId: item.knowledgeId,
      dueAt: item.dueAt,
    })),
    dailyReviewLimit: getDailyReviewLimit(),
    todayReviewCompletedCount: stats.reviewCompletedCount,
    now,
    timeZone,
  });

  const loadableKnowledgeIds = plan.sessionKnowledgeIds.filter(
    (knowledgeId) => resolveReviewCardContext(knowledgeId) !== null,
  );

  if (loadableKnowledgeIds.length === 0) {
    return buildActiveStudySession('empty', REVIEW_POOL_SESSION_PACK_ID, []);
  }

  const sessionId = createRecordId('session');
  const createdAt = now.toISOString();
  const queueItems: StudyQueueItemRow[] = loadableKnowledgeIds.map((knowledgeId, index) => ({
    itemId: createRecordId('queue'),
    sessionId,
    knowledgeId,
    itemType: 'review',
    sortOrder: index + 1,
    status: 'pending' as const,
  }));

  const db = openUserDatabase();
  db.execSync('BEGIN IMMEDIATE');
  try {
    insertStudySession(
      {
        sessionId,
        packId: REVIEW_POOL_SESSION_PACK_ID,
        status: 'active',
        createdAt,
        updatedAt: createdAt,
      },
      db,
    );
    insertQueueItems(queueItems, db);
    db.execSync('COMMIT');
  } catch (error) {
    db.execSync('ROLLBACK');
    throw error;
  }

  return buildActiveStudySession(sessionId, REVIEW_POOL_SESSION_PACK_ID, queueItems);
}
