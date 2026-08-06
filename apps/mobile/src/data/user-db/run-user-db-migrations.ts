import type { SQLiteDatabase } from 'expo-sqlite';
import { runSm2ToReviewPoolMigration } from './migrate-sm2-to-review-pool';
import { MIGRATIONS, USER_DB_VERSION } from './user-db-schema';

export function runUserDbMigrations(db: SQLiteDatabase): void {
  const currentVersion =
    db.getFirstSync<{ user_version: number }>('PRAGMA user_version')?.user_version ?? 0;

  if (currentVersion > USER_DB_VERSION) {
    throw new Error(
      `user.sqlite version ${String(currentVersion)} is newer than app supports (${String(USER_DB_VERSION)})`,
    );
  }

  for (let version = currentVersion + 1; version <= USER_DB_VERSION; version += 1) {
    const statements = MIGRATIONS[version];
    if (!statements) {
      throw new Error(`missing user.sqlite migration for version ${String(version)}`);
    }

    db.execSync('BEGIN IMMEDIATE');
    try {
      for (const sql of statements) {
        db.execSync(sql);
      }
      if (version === 4) {
        runSm2ToReviewPoolMigration(db);
      }
      db.execSync(`PRAGMA user_version = ${String(version)}`);
      db.execSync('COMMIT');
    } catch (error) {
      db.execSync('ROLLBACK');
      throw error;
    }
  }
}
