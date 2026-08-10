import { createInitialReviewPoolState } from '@remember/domain';
import { createRecordId } from '../data/create-record-id';
import {
  getLearningStateByKnowledgeId,
  upsertReviewPoolState,
} from '../data/repositories/learning-state-repository';
import { insertSyncOutboxItem } from '../data/repositories/sync-outbox-repository';
import { buildSyncOutboxPayload } from '../data/sync/build-sync-outbox-payload';
import { openUserDatabase } from '../data/user-db/open-user-database';
import { getDeviceTimeZone } from '../lib/get-device-time-zone';
import { markReviewPoolChanged } from '../shell/review-pool-changed-signal';
import { buildReviewPoolLearningRow } from './join-review-pool';
import { writeJoinReviewActivityEvent } from './write-activity-event-from-review';

export function updateReviewPoolFromPack(input: {
  knowledgeId: string;
  catalogPackId: string;
  displayLabel?: string;
  sortOrder?: number;
  activitySource?: 'browse' | 'review_tab' | 'calendar_inspect';
  now?: Date;
}): void {
  const now = input.now ?? new Date();
  const timeZone = getDeviceTimeZone();
  const previous = getLearningStateByKnowledgeId(input.knowledgeId);
  const poolState = createInitialReviewPoolState({ now, timeZone });
  const learningRow = buildReviewPoolLearningRow({
    knowledgeId: input.knowledgeId,
    catalogPackId: input.catalogPackId,
    poolState,
    previous,
    now,
  });
  const payload = buildSyncOutboxPayload({ row: learningRow });

  const db = openUserDatabase();
  db.execSync('BEGIN IMMEDIATE');
  try {
    upsertReviewPoolState(learningRow, db);
    insertSyncOutboxItem(
      {
        eventId: createRecordId('sync'),
        knowledgeId: input.knowledgeId,
        clientVersion: learningRow.clientVersion,
        payload,
        createdAt: learningRow.updatedAt,
      },
      db,
    );
    db.execSync('COMMIT');
  } catch (error) {
    db.execSync('ROLLBACK');
    throw error;
  }

  markReviewPoolChanged();

  if (input.displayLabel) {
    writeJoinReviewActivityEvent({
      catalogPackId: input.catalogPackId,
      knowledgeId: input.knowledgeId,
      displayLabel: input.displayLabel,
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      created: false,
      ...(input.activitySource ? { source: input.activitySource } : {}),
      now,
    });
  }
}
