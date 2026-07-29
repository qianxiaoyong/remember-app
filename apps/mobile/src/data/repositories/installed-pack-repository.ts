import type { SQLiteDatabase } from 'expo-sqlite';
import { openUserDatabase } from '../user-db/open-user-database';

export type InstallStatus = 'installing' | 'installed' | 'failed';

export interface InstalledPackRow {
  packId: string;
  displayName: string;
  packVersion: string;
  sqlitePath: string;
  assetsDir: string;
  installStatus: InstallStatus;
  installedAt: string;
  lastOpenedAt: string | null;
}

interface InstalledPackDbRow {
  packId: string;
  displayName: string;
  packVersion: string;
  sqlitePath: string;
  assetsDir: string;
  installStatus: InstallStatus;
  installedAt: string;
  lastOpenedAt: string | null;
}

function mapRow(row: InstalledPackDbRow): InstalledPackRow {
  return {
    packId: row.packId,
    displayName: row.displayName,
    packVersion: row.packVersion,
    sqlitePath: row.sqlitePath,
    assetsDir: row.assetsDir,
    installStatus: row.installStatus,
    installedAt: row.installedAt,
    lastOpenedAt: row.lastOpenedAt,
  };
}

export function listInstalledPacks(db: SQLiteDatabase = openUserDatabase()): InstalledPackRow[] {
  const rows = db.getAllSync<InstalledPackDbRow>(
    `SELECT packId, displayName, packVersion, sqlitePath, assetsDir,
            installStatus, installedAt, lastOpenedAt
     FROM installed_packs
     WHERE installStatus = 'installed'
     ORDER BY installedAt DESC`,
  );
  return rows.map(mapRow);
}

export function getInstalledPack(
  packId: string,
  db: SQLiteDatabase = openUserDatabase(),
): InstalledPackRow | null {
  const row = db.getFirstSync<InstalledPackDbRow>(
    `SELECT packId, displayName, packVersion, sqlitePath, assetsDir,
            installStatus, installedAt, lastOpenedAt
     FROM installed_packs
     WHERE packId = ?`,
    [packId],
  );
  return row ? mapRow(row) : null;
}

export function upsertInstalledPack(
  pack: InstalledPackRow,
  db: SQLiteDatabase = openUserDatabase(),
): InstalledPackRow {
  db.runSync(
    `INSERT INTO installed_packs (
       packId, displayName, packVersion, sqlitePath, assetsDir,
       installStatus, installedAt, lastOpenedAt
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(packId) DO UPDATE SET
       displayName = excluded.displayName,
       packVersion = excluded.packVersion,
       sqlitePath = excluded.sqlitePath,
       assetsDir = excluded.assetsDir,
       installStatus = excluded.installStatus,
       installedAt = excluded.installedAt,
       lastOpenedAt = excluded.lastOpenedAt`,
    [
      pack.packId,
      pack.displayName,
      pack.packVersion,
      pack.sqlitePath,
      pack.assetsDir,
      pack.installStatus,
      pack.installedAt,
      pack.lastOpenedAt,
    ],
  );
  return pack;
}

export function deleteInstalledPackRecord(
  packId: string,
  db: SQLiteDatabase = openUserDatabase(),
): void {
  db.runSync('DELETE FROM installed_packs WHERE packId = ?', [packId]);
}

export function countInstalledPacksWithSqlitePath(
  sqlitePath: string,
  db: SQLiteDatabase = openUserDatabase(),
): number {
  const row = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) AS count
     FROM installed_packs
     WHERE installStatus = 'installed' AND sqlitePath = ?`,
    [sqlitePath],
  );
  return row?.count ?? 0;
}
