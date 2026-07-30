import type { SQLiteDatabase } from 'expo-sqlite';
import { openUserDatabase } from '../user-db/open-user-database';

export interface SyncOutboxRow {
  eventId: string;
  knowledgeId: string;
  clientVersion: number;
  payload: string;
  createdAt: string;
}

export function insertSyncOutboxItem(
  item: SyncOutboxRow,
  db: SQLiteDatabase = openUserDatabase(),
): void {
  db.runSync(
    `INSERT INTO sync_outbox (eventId, knowledgeId, clientVersion, payload, createdAt)
     VALUES (?, ?, ?, ?, ?)`,
    [item.eventId, item.knowledgeId, item.clientVersion, item.payload, item.createdAt],
  );
}

export function listSyncOutboxItems(
  limit = 100,
  db: SQLiteDatabase = openUserDatabase(),
): SyncOutboxRow[] {
  return db.getAllSync<SyncOutboxRow>(
    `SELECT eventId, knowledgeId, clientVersion, payload, createdAt
     FROM sync_outbox
     ORDER BY createdAt ASC
     LIMIT ?`,
    [limit],
  );
}

export function countSyncOutboxItems(db: SQLiteDatabase = openUserDatabase()): number {
  const row = db.getFirstSync<{ count: number }>('SELECT COUNT(*) AS count FROM sync_outbox');
  return row?.count ?? 0;
}

export function deleteSyncOutboxItems(
  eventIds: readonly string[],
  db: SQLiteDatabase = openUserDatabase(),
): void {
  for (const eventId of eventIds) {
    db.runSync('DELETE FROM sync_outbox WHERE eventId = ?', [eventId]);
  }
}
