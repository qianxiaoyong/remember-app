import type { BoxLevel } from '@remember/domain';
import type { SQLiteDatabase } from 'expo-sqlite';

export function mapSm2ToInReviewPool(repetitions: number, intervalDays: number): boolean {
  return !(repetitions === 0 && intervalDays === 0);
}

export function mapSm2IntervalToBoxLevel(intervalDays: number): BoxLevel {
  if (intervalDays <= 1) {
    return 0;
  }
  if (intervalDays <= 3) {
    return 1;
  }
  if (intervalDays <= 7) {
    return 2;
  }
  return 3;
}

interface Sm2LearningStateRow {
  knowledgeId: string;
  packId: string;
  repetitions: number;
  intervalDays: number;
}

export function runSm2ToReviewPoolMigration(db: SQLiteDatabase): void {
  const rows = db.getAllSync<Sm2LearningStateRow>(
    `SELECT knowledgeId, packId, repetitions, intervalDays FROM learning_states`,
  );

  for (const row of rows) {
    db.runSync(
      `UPDATE learning_states
       SET inReviewPool = ?,
           boxLevel = ?,
           firstAddedFromPackId = ?,
           consecutiveLevel3Passes = 0
       WHERE knowledgeId = ?`,
      [
        mapSm2ToInReviewPool(row.repetitions, row.intervalDays) ? 1 : 0,
        mapSm2IntervalToBoxLevel(row.intervalDays),
        row.packId,
        row.knowledgeId,
      ],
    );
  }
}
