import type { QueueItemType } from '@remember/domain';
import type { SQLiteDatabase } from 'expo-sqlite';
import { openUserDatabase } from '../user-db/open-user-database';

export type SessionStatus = 'active' | 'completed';
export type QueueItemStatus = 'pending' | 'done';

export interface StudySessionRow {
  sessionId: string;
  packId: string;
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StudyQueueItemRow {
  itemId: string;
  sessionId: string;
  knowledgeId: string;
  itemType: QueueItemType;
  sortOrder: number;
  status: QueueItemStatus;
}

export function findActiveSessionWithPendingItems(
  db: SQLiteDatabase = openUserDatabase(),
): StudySessionRow | null {
  return (
    db.getFirstSync<StudySessionRow>(
      `SELECT s.sessionId, s.packId, s.status, s.createdAt, s.updatedAt
       FROM study_sessions s
       WHERE s.status = 'active'
         AND EXISTS (
           SELECT 1 FROM study_queue_items q
           WHERE q.sessionId = s.sessionId AND q.status = 'pending'
         )
       ORDER BY s.updatedAt DESC
       LIMIT 1`,
    ) ?? null
  );
}

export function findActiveSessionForPack(
  packId: string,
  db: SQLiteDatabase = openUserDatabase(),
): StudySessionRow | null {
  return (
    db.getFirstSync<StudySessionRow>(
      `SELECT sessionId, packId, status, createdAt, updatedAt
       FROM study_sessions
       WHERE packId = ? AND status = 'active'
       ORDER BY updatedAt DESC
       LIMIT 1`,
      [packId],
    ) ?? null
  );
}

export function listQueueItemsForSession(
  sessionId: string,
  db: SQLiteDatabase = openUserDatabase(),
): StudyQueueItemRow[] {
  return db.getAllSync<StudyQueueItemRow>(
    `SELECT itemId, sessionId, knowledgeId, itemType, sortOrder, status
     FROM study_queue_items
     WHERE sessionId = ?
     ORDER BY sortOrder ASC`,
    [sessionId],
  );
}

export function listPendingQueueItemsForSession(
  sessionId: string,
  db: SQLiteDatabase = openUserDatabase(),
): StudyQueueItemRow[] {
  return db.getAllSync<StudyQueueItemRow>(
    `SELECT itemId, sessionId, knowledgeId, itemType, sortOrder, status
     FROM study_queue_items
     WHERE sessionId = ? AND status = 'pending'
     ORDER BY sortOrder ASC`,
    [sessionId],
  );
}

export function insertStudySession(
  session: StudySessionRow,
  db: SQLiteDatabase = openUserDatabase(),
): void {
  db.runSync(
    `INSERT INTO study_sessions (sessionId, packId, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?)`,
    [session.sessionId, session.packId, session.status, session.createdAt, session.updatedAt],
  );
}

export function insertQueueItems(
  items: readonly StudyQueueItemRow[],
  db: SQLiteDatabase = openUserDatabase(),
): void {
  for (const item of items) {
    db.runSync(
      `INSERT INTO study_queue_items (itemId, sessionId, knowledgeId, itemType, sortOrder, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [item.itemId, item.sessionId, item.knowledgeId, item.itemType, item.sortOrder, item.status],
    );
  }
}

export function updateSessionStatus(input: {
  sessionId: string;
  status: SessionStatus;
  updatedAt: string;
  db?: SQLiteDatabase;
}): void {
  const db = input.db ?? openUserDatabase();
  db.runSync('UPDATE study_sessions SET status = ?, updatedAt = ? WHERE sessionId = ?', [
    input.status,
    input.updatedAt,
    input.sessionId,
  ]);
}

export function markQueueItemDone(itemId: string, db: SQLiteDatabase = openUserDatabase()): void {
  db.runSync('UPDATE study_queue_items SET status = ? WHERE itemId = ?', ['done', itemId]);
}

export function hasPendingQueueItemForKnowledge(
  sessionId: string,
  knowledgeId: string,
  db: SQLiteDatabase = openUserDatabase(),
): boolean {
  const row = db.getFirstSync<{ itemId: string }>(
    `SELECT itemId FROM study_queue_items
     WHERE sessionId = ? AND knowledgeId = ? AND status = 'pending'`,
    [sessionId, knowledgeId],
  );
  return row !== null;
}

export function appendQueueItem(
  item: StudyQueueItemRow,
  db: SQLiteDatabase = openUserDatabase(),
): void {
  db.runSync(
    `INSERT INTO study_queue_items (itemId, sessionId, knowledgeId, itemType, sortOrder, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [item.itemId, item.sessionId, item.knowledgeId, item.itemType, item.sortOrder, item.status],
  );
}

export function getMaxQueueSortOrder(
  sessionId: string,
  db: SQLiteDatabase = openUserDatabase(),
): number {
  return (
    db.getFirstSync<{ maxOrder: number }>(
      'SELECT COALESCE(MAX(sortOrder), 0) AS maxOrder FROM study_queue_items WHERE sessionId = ?',
      [sessionId],
    )?.maxOrder ?? 0
  );
}

export function touchSessionUpdatedAt(
  sessionId: string,
  updatedAt: string,
  db: SQLiteDatabase = openUserDatabase(),
): void {
  db.runSync('UPDATE study_sessions SET updatedAt = ? WHERE sessionId = ?', [updatedAt, sessionId]);
}
