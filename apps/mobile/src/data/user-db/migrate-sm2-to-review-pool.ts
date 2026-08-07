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

export function runSm2ToReviewPoolMigration(db: SQLiteDatabase): void {
  db.execSync(`
    UPDATE learning_states
    SET inReviewPool = CASE
          WHEN repetitions = 0 AND intervalDays = 0 THEN 0
          ELSE 1
        END,
        boxLevel = CASE
          WHEN intervalDays <= 1 THEN 0
          WHEN intervalDays <= 3 THEN 1
          WHEN intervalDays <= 7 THEN 2
          ELSE 3
        END,
        firstAddedFromPackId = packId,
        consecutiveLevel3Passes = 0
  `);
}
