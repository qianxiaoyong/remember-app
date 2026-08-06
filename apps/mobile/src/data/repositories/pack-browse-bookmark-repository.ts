import type { SQLiteDatabase } from 'expo-sqlite';
import { openUserDatabase } from '../user-db/open-user-database';

export interface PackBrowseBookmarkRow {
  packId: string;
  knowledgeId: string;
  sortOrder: number;
  updatedAt: string;
}

export function getPackBrowseBookmark(
  packId: string,
  db: SQLiteDatabase = openUserDatabase(),
): PackBrowseBookmarkRow | null {
  return db.getFirstSync<PackBrowseBookmarkRow>(
    `SELECT packId, knowledgeId, sortOrder, updatedAt
     FROM pack_browse_bookmarks
     WHERE packId = ?`,
    [packId],
  );
}

export function upsertPackBrowseBookmark(
  input: PackBrowseBookmarkRow,
  db: SQLiteDatabase = openUserDatabase(),
): void {
  db.runSync(
    `INSERT INTO pack_browse_bookmarks (packId, knowledgeId, sortOrder, updatedAt)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(packId) DO UPDATE SET
       knowledgeId = excluded.knowledgeId,
       sortOrder = excluded.sortOrder,
       updatedAt = excluded.updatedAt`,
    [input.packId, input.knowledgeId, input.sortOrder, input.updatedAt],
  );
}
