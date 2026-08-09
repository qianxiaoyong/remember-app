import type { SQLiteDatabase } from 'expo-sqlite';
import { openUserDatabase } from '../user-db/open-user-database';

export function touchInstalledPackLastOpened(
  packId: string,
  openedAt: string = new Date().toISOString(),
  db: SQLiteDatabase = openUserDatabase(),
): void {
  db.runSync('UPDATE installed_packs SET lastOpenedAt = ? WHERE packId = ?', [openedAt, packId]);
}
