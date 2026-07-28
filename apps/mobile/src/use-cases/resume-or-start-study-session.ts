import {
  buildStudyQueuePlan,
  DEFAULT_REVIEW_SCHEDULER_CONFIG,
  type QueuePlanItem,
} from '@remember/domain';
import { createRecordId } from '../data/create-record-id';
import { getInstalledPack } from '../data/repositories/installed-pack-repository';
import {
  buildLearningStateMap,
  listLearningStatesForPack,
} from '../data/repositories/learning-state-repository';
import { listPackCards } from '../data/repositories/pack-card-repository';
import {
  findActiveSessionForPack,
  insertQueueItems,
  insertStudySession,
  listPendingQueueItemsForSession,
  listQueueItemsForSession,
  type StudyQueueItemRow,
  updateSessionStatus,
} from '../data/repositories/study-session-repository';
import { openUserDatabase } from '../data/user-db/open-user-database';
import { buildActiveStudySession, type ActiveStudySession } from './study-session-types';

export function resumeOrStartStudySession(
  packId: string,
  now: Date = new Date(),
): ActiveStudySession {
  const installedPack = getInstalledPack(packId);
  if (!installedPack) {
    throw new Error(`pack not installed: ${packId}`);
  }

  const activeSession = findActiveSessionForPack(packId);
  if (activeSession) {
    const pendingItems = listPendingQueueItemsForSession(activeSession.sessionId);
    if (pendingItems.length > 0) {
      const allItems = listQueueItemsForSession(activeSession.sessionId);
      return buildActiveStudySession(activeSession.sessionId, packId, allItems);
    }

    updateSessionStatus({
      sessionId: activeSession.sessionId,
      status: 'completed',
      updatedAt: now.toISOString(),
    });
  }

  const cards = listPackCards(installedPack.sqlitePath);
  const learningStates = listLearningStatesForPack(packId);
  const queuePlan = buildStudyQueuePlan({
    cardKnowledgeIds: cards.map((card) => card.knowledgeId),
    learningStatesById: buildLearningStateMap(learningStates),
    now,
    dailyNewCardQuota: DEFAULT_REVIEW_SCHEDULER_CONFIG.dailyNewCardQuota,
  });

  if (queuePlan.length === 0) {
    return buildActiveStudySession('empty', packId, []);
  }

  const sessionId = createRecordId('session');
  const createdAt = now.toISOString();
  const queueItems = createQueueItems(sessionId, queuePlan);

  const db = openUserDatabase();
  db.execSync('BEGIN IMMEDIATE');
  try {
    insertStudySession(
      {
        sessionId,
        packId,
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

  return buildActiveStudySession(sessionId, packId, queueItems);
}

function createQueueItems(sessionId: string, plan: readonly QueuePlanItem[]): StudyQueueItemRow[] {
  return plan.map((item, index) => ({
    itemId: createRecordId('queue'),
    sessionId,
    knowledgeId: item.knowledgeId,
    itemType: item.itemType,
    sortOrder: index + 1,
    status: 'pending' as const,
  }));
}
