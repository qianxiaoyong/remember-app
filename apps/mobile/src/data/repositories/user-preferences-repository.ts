import type { SQLiteDatabase } from 'expo-sqlite';
import { openUserDatabase } from '../user-db/open-user-database';

export const PREFERENCE_DAILY_REVIEW_LIMIT = 'dailyReviewLimit';
export const PREFERENCE_PACK_OPEN_POSITION = 'packOpenPosition';
export const PREFERENCE_RECALL_AUTO_PLAY = 'recallAutoPlay';

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

export function setUserPreference(input: {
  key: string;
  value: string;
  updatedAt: string;
  db?: SQLiteDatabase;
}): void {
  const db = input.db ?? openUserDatabase();
  db.runSync(
    `INSERT INTO user_preferences (key, value, updatedAt)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET
       value = excluded.value,
       updatedAt = excluded.updatedAt`,
    [input.key, input.value, input.updatedAt],
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

export const RECALL_AUTO_PLAY_COUNTS = [1, 2, 3, 5] as const;
export type RecallAutoPlayCount = (typeof RECALL_AUTO_PLAY_COUNTS)[number];

const DEFAULT_RECALL_AUTO_PLAY_COUNT = 2;

function parseRecallAutoPlayCount(raw: string): number {
  if (raw === 'true') {
    return DEFAULT_RECALL_AUTO_PLAY_COUNT;
  }
  if (raw === 'false') {
    return 0;
  }
  const parsed = Number.parseInt(raw, 10);
  if (parsed === 0) {
    return 0;
  }
  if (RECALL_AUTO_PLAY_COUNTS.includes(parsed as RecallAutoPlayCount)) {
    return parsed;
  }
  return DEFAULT_RECALL_AUTO_PLAY_COUNT;
}

/** 0 表示关闭；开启时为 1、2、3 或 5，缺省 2。 */
export function getRecallAutoPlayCount(db: SQLiteDatabase = openUserDatabase()): number {
  const raw = getUserPreference(
    PREFERENCE_RECALL_AUTO_PLAY,
    String(DEFAULT_RECALL_AUTO_PLAY_COUNT),
    db,
  );
  return parseRecallAutoPlayCount(raw);
}

export function isRecallAutoPlayEnabled(db: SQLiteDatabase = openUserDatabase()): boolean {
  return getRecallAutoPlayCount(db) > 0;
}
