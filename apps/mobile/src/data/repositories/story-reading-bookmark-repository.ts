import type { SQLiteDatabase } from 'expo-sqlite';
import { openUserDatabase } from '../user-db/open-user-database';

export interface StoryReadingBookmarkRow {
  packId: string;
  knowledgeId: string;
  positionMs: number;
  updatedAt: string;
}

export function getStoryReadingBookmark(
  packId: string,
  db: SQLiteDatabase = openUserDatabase(),
): StoryReadingBookmarkRow | null {
  return db.getFirstSync<StoryReadingBookmarkRow>(
    `SELECT packId, knowledgeId, positionMs, updatedAt
     FROM story_reading_bookmarks
     WHERE packId = ?`,
    [packId],
  );
}

export function upsertStoryReadingBookmark(
  input: StoryReadingBookmarkRow,
  db: SQLiteDatabase = openUserDatabase(),
): void {
  db.runSync(
    `INSERT INTO story_reading_bookmarks (packId, knowledgeId, positionMs, updatedAt)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(packId) DO UPDATE SET
       knowledgeId = excluded.knowledgeId,
       positionMs = excluded.positionMs,
       updatedAt = excluded.updatedAt`,
    [input.packId, input.knowledgeId, input.positionMs, input.updatedAt],
  );
}
