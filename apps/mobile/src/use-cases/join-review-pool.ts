import {
  createInitialReviewPoolState,
  formatLocalReviewDate,
  type ReviewPoolState,
} from '@remember/domain';
import { createRecordId } from '../data/create-record-id';
import {
  getLearningStateByKnowledgeId,
  upsertReviewPoolState,
  type LearningStateRow,
} from '../data/repositories/learning-state-repository';
import { incrementJoinedPoolCount } from '../data/repositories/review-daily-stats-repository';
import { insertSyncOutboxItem } from '../data/repositories/sync-outbox-repository';
import { buildSyncOutboxPayload } from '../data/sync/build-sync-outbox-payload';
import { openUserDatabase } from '../data/user-db/open-user-database';
import { getDeviceTimeZone } from '../lib/get-device-time-zone';
import { markReviewPoolChanged } from '../shell/review-pool-changed-signal';
import { resolveContentPackId } from './resolve-content-pack-id';
import { writeJoinReviewActivityEvent } from './write-activity-event-from-review';

export type JoinReviewPoolResult = { status: 'created' } | { status: 'already_in_pool' };

export function buildReviewPoolLearningRow(input: {
  knowledgeId: string;
  catalogPackId: string;
  poolState: ReviewPoolState;
  previous: LearningStateRow | null;
  now: Date;
}): LearningStateRow {
  const updatedAt = input.now.toISOString();
  const contentPackId = resolveContentPackId(input.catalogPackId);

  return {
    knowledgeId: input.knowledgeId,
    packId: contentPackId,
    easiness: input.previous?.easiness ?? 2.5,
    intervalDays: input.previous?.intervalDays ?? 0,
    repetitions: input.previous?.repetitions ?? 0,
    dueAt: new Date(input.poolState.dueAt).toISOString(),
    clientVersion: (input.previous?.clientVersion ?? 0) + 1,
    updatedAt,
    inReviewPool: true,
    boxLevel: input.poolState.boxLevel,
    firstAddedFromPackId: contentPackId,
    lastSeenInPackId: contentPackId,
    consecutiveLevel3Passes: input.poolState.consecutiveLevel3Passes ?? 0,
  };
}

export function joinReviewPool(input: {
  knowledgeId: string;
  catalogPackId: string;
  displayLabel?: string;
  sortOrder?: number;
  activitySource?: 'browse' | 'review_tab' | 'calendar_inspect';
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
  const localDate = formatLocalReviewDate(now, timeZone);
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

  markReviewPoolChanged();

  if (input.displayLabel) {
    writeJoinReviewActivityEvent({
      catalogPackId: input.catalogPackId,
      knowledgeId: input.knowledgeId,
      displayLabel: input.displayLabel,
      sortOrder: input.sortOrder,
      created: true,
      source: input.activitySource,
      now,
    });
  }

  return { status: 'created' };
}
