import type { SQLiteDatabase } from 'expo-sqlite';
import { openUserDatabase } from '../user-db/open-user-database';

export interface ReviewDailyStatsRow {
  localDate: string;
  joinedPoolCount: number;
  reviewCompletedCount: number;
  updatedAt: string;
}

export function getReviewDailyStats(
  localDate: string,
  db: SQLiteDatabase = openUserDatabase(),
): ReviewDailyStatsRow {
  const row = db.getFirstSync<ReviewDailyStatsRow>(
    `SELECT localDate, joinedPoolCount, reviewCompletedCount, updatedAt
     FROM review_daily_stats
     WHERE localDate = ?`,
    [localDate],
  );

  if (row) {
    return row;
  }

  return {
    localDate,
    joinedPoolCount: 0,
    reviewCompletedCount: 0,
    updatedAt: new Date(0).toISOString(),
  };
}

function upsertReviewDailyStatsCounter(input: {
  localDate: string;
  column: 'joinedPoolCount' | 'reviewCompletedCount';
  updatedAt: string;
  db: SQLiteDatabase;
}): void {
  input.db.runSync(
    `INSERT INTO review_daily_stats (localDate, joinedPoolCount, reviewCompletedCount, updatedAt)
     VALUES (?, 0, 0, ?)
     ON CONFLICT(localDate) DO NOTHING`,
    [input.localDate, input.updatedAt],
  );
  input.db.runSync(
    `UPDATE review_daily_stats
     SET ${input.column} = ${input.column} + 1,
         updatedAt = ?
     WHERE localDate = ?`,
    [input.updatedAt, input.localDate],
  );
}

export function incrementJoinedPoolCount(
  localDate: string,
  updatedAt: string,
  db: SQLiteDatabase = openUserDatabase(),
): void {
  upsertReviewDailyStatsCounter({ localDate, column: 'joinedPoolCount', updatedAt, db });
}

export function incrementReviewCompletedCount(
  localDate: string,
  updatedAt: string,
  db: SQLiteDatabase = openUserDatabase(),
): void {
  upsertReviewDailyStatsCounter({ localDate, column: 'reviewCompletedCount', updatedAt, db });
}
