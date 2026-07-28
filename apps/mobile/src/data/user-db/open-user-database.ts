import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';
import { runUserDbMigrations } from './run-user-db-migrations';

const USER_DB_NAME = 'user.sqlite';

let userDatabase: SQLiteDatabase | null = null;

export function openUserDatabase(): SQLiteDatabase {
  if (!userDatabase) {
    userDatabase = openDatabaseSync(USER_DB_NAME);
    runUserDbMigrations(userDatabase);
  }
  return userDatabase;
}

export function closeUserDatabaseForTests(): void {
  if (userDatabase) {
    userDatabase.closeSync();
    userDatabase = null;
  }
}
