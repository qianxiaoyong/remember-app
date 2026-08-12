import { createInitialReviewPoolState, formatLocalReviewDate } from '@remember/domain';
import { createRecordId } from '../data/create-record-id';
import {
  getLearningStateByKnowledgeId,
  upsertReviewPoolState,
} from '../data/repositories/learning-state-repository';
import { incrementJoinedPoolCount } from '../data/repositories/review-daily-stats-repository';
import { insertSyncOutboxItem } from '../data/repositories/sync-outbox-repository';
import { buildSyncOutboxPayload } from '../data/sync/build-sync-outbox-payload';
import { openUserDatabase } from '../data/user-db/open-user-database';
import { getDeviceTimeZone } from '../lib/get-device-time-zone';
import { markReviewPoolChanged } from '../shell/review-pool-changed-signal';
import { buildReviewPoolLearningRow } from './build-review-pool-learning-row';
import { countsAsReviewableDueBadgeItem } from './counts-as-reviewable-due-badge-item';
import { writeJoinReviewActivityEvent } from './write-activity-event-from-review';

export type JoinReviewPoolResult = { status: 'created' } | { status: 'already_in_pool' };

export { buildReviewPoolLearningRow } from './build-review-pool-learning-row';

export function joinReviewPool(input: {
  knowledgeId: string;
  catalogPackId: string;
  displayLabel?: string;
  sortOrder?: number;
  activitySource?: 'browse' | 'review_tab' | 'calendar_inspect';
  /** 家长检查：统计与事件挂在被查看的日历日 */
  activityLocalDate?: string;
  now?: Date;
}): JoinReviewPoolResult {
  const now = input.now ?? new Date();
  const timeZone = getDeviceTimeZone();
  const previous = getLearningStateByKnowledgeId(input.knowledgeId);

  if (previous?.inReviewPool) {
    return { status: 'already_in_pool' };
  }

  const poolState = createInitialReviewPoolState({ now, timeZone });
  const learningRow = buildReviewPoolLearningRow({
    knowledgeId: input.knowledgeId,
    catalogPackId: input.catalogPackId,
    poolState,
    previous,
    now,
  });
  const updatedAt = learningRow.updatedAt;
  const localDate = input.activityLocalDate ?? formatLocalReviewDate(now, timeZone);
  const payload = buildSyncOutboxPayload({ row: learningRow });

  const db = openUserDatabase();
  db.execSync('BEGIN IMMEDIATE');
  try {
    upsertReviewPoolState(learningRow, db);
    incrementJoinedPoolCount(localDate, updatedAt, db);
    insertSyncOutboxItem(
      {
        eventId: createRecordId('sync'),
        knowledgeId: input.knowledgeId,
        clientVersion: learningRow.clientVersion,
        payload,
        createdAt: updatedAt,
      },
      db,
    );
    db.execSync('COMMIT');
  } catch (error) {
    db.execSync('ROLLBACK');
    throw error;
  }

  markReviewPoolChanged(
    countsAsReviewableDueBadgeItem({
      knowledgeId: input.knowledgeId,
      dueAt: learningRow.dueAt,
      now,
      timeZone,
    })
      ? 'join_due'
      : 'refresh',
  );

  if (input.displayLabel) {
    writeJoinReviewActivityEvent({
      catalogPackId: input.catalogPackId,
      knowledgeId: input.knowledgeId,
      displayLabel: input.displayLabel,
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      created: true,
      ...(input.activitySource ? { source: input.activitySource } : {}),
      ...(input.activityLocalDate ? { activityLocalDate: input.activityLocalDate } : {}),
      now,
    });
  }

  return { status: 'created' };
}
