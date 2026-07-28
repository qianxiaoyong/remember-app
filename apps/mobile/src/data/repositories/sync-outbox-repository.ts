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
