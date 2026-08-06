import { createRecordId } from '../data/create-record-id';
import { deletePackBrowseBookmark } from '../data/repositories/pack-browse-bookmark-repository';
import { getInstalledPack } from '../data/repositories/installed-pack-repository';
import { getLearningStateByKnowledgeId, upsertReviewPoolState } from '../data/repositories/learning-state-repository';
import { listPackCards } from '../data/repositories/pack-card-repository';
import { deleteStoryReadingBookmark } from '../data/repositories/story-reading-bookmark-repository';
import { insertSyncOutboxItem } from '../data/repositories/sync-outbox-repository';
import { buildSyncOutboxPayload } from '../data/sync/build-sync-outbox-payload';
import { openUserDatabase } from '../data/user-db/open-user-database';
import { resolvePackLibraryPresentation } from './resolve-pack-library-presentation';

export interface ResetPackLearningProgressInput {
  packId: string;
  resetBrowse: boolean;
  resetReview: boolean;
  now?: Date;
}

export interface ResetPackLearningProgressResult {
  removedFromReviewPoolCount: number;
}

export function resetPackLearningProgress(
  input: ResetPackLearningProgressInput,
): ResetPackLearningProgressResult {
  if (!input.resetBrowse && !input.resetReview) {
    throw new Error('至少选择一项重置内容');
  }

  const installed = getInstalledPack(input.packId);
  if (!installed) {
    throw new Error('学习包未安装');
  }

  const now = input.now ?? new Date();
  const updatedAt = now.toISOString();
  const isReader = resolvePackLibraryPresentation(input.packId) === 'reader';
  const cards = listPackCards(installed.sqlitePath);
  const rowsToSync: NonNullable<ReturnType<typeof getLearningStateByKnowledgeId>>[] = [];

  if (input.resetReview) {
    for (const card of cards) {
      const previous = getLearningStateByKnowledgeId(card.knowledgeId);
      if (!previous?.inReviewPool) {
        continue;
      }
      rowsToSync.push({
        ...previous,
        inReviewPool: false,
        clientVersion: previous.clientVersion + 1,
        updatedAt,
      });
    }
  }

  const db = openUserDatabase();
  db.execSync('BEGIN IMMEDIATE');
  try {
    if (input.resetBrowse) {
      if (isReader) {
        deleteStoryReadingBookmark(input.packId, db);
      } else {
        deletePackBrowseBookmark(input.packId, db);
      }
    }

    for (const row of rowsToSync) {
      if (!row) {
        continue;
      }
      upsertReviewPoolState(row, db);
      insertSyncOutboxItem(
        {
          eventId: createRecordId('sync'),
          knowledgeId: row.knowledgeId,
          clientVersion: row.clientVersion,
          payload: buildSyncOutboxPayload({ row }),
          createdAt: updatedAt,
        },
        db,
      );
    }

    db.execSync('COMMIT');
  } catch (error) {
    db.execSync('ROLLBACK');
    throw error;
  }

  return {
    removedFromReviewPoolCount: rowsToSync.length,
  };
}
