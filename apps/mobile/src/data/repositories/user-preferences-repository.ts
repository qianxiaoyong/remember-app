import type { SQLiteDatabase } from 'expo-sqlite';
import { openUserDatabase } from '../user-db/open-user-database';

export const PREFERENCE_DAILY_REVIEW_LIMIT = 'dailyReviewLimit';
export const PREFERENCE_PACK_OPEN_POSITION = 'packOpenPosition';

export type PackOpenPosition = 'bookmark' | 'start';

export function getUserPreference(
  key: string,
  defaultValue: string,
  db: SQLiteDatabase = openUserDatabase(),
): string {
  const row = db.getFirstSync<{ value: string }>(
    `SELECT value FROM user_preferences WHERE key = ?`,
    [key],
  );
  return row?.value ?? defaultValue;
}

export function setUserPreference(
  key: string,
  value: string,
  updatedAt: string,
  db: SQLiteDatabase = openUserDatabase(),
): void {
  db.runSync(
    `INSERT INTO user_preferences (key, value, updatedAt)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET
       value = excluded.value,
       updatedAt = excluded.updatedAt`,
    [key, value, updatedAt],
  );
}

export function getDailyReviewLimit(db: SQLiteDatabase = openUserDatabase()): number {
  const raw = getUserPreference(PREFERENCE_DAILY_REVIEW_LIMIT, '20', db);
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 20;
  }
  return Math.min(parsed, 999);
}

export function getPackOpenPosition(db: SQLiteDatabase = openUserDatabase()): PackOpenPosition {
  const raw = getUserPreference(PREFERENCE_PACK_OPEN_POSITION, 'bookmark', db);
  return raw === 'start' ? 'start' : 'bookmark';
}
