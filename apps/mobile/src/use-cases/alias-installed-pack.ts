import type { InstalledPackRow } from '../data/repositories/installed-pack-repository';
import { resolvePackDisplayName } from '../catalog/resolve-pack-display-name';
import { upsertInstalledPack } from '../data/repositories/installed-pack-repository';
import { openUserDatabase } from '../data/user-db/open-user-database';

export function aliasInstalledPack(
  catalogPackId: string,
  baseRow: InstalledPackRow,
): InstalledPackRow {
  const aliasRow: InstalledPackRow = {
    packId: catalogPackId,
    displayName: resolvePackDisplayName(catalogPackId),
    packVersion: baseRow.packVersion,
    sqlitePath: baseRow.sqlitePath,
    assetsDir: baseRow.assetsDir,
    installStatus: 'installed',
    installedAt: new Date().toISOString(),
    lastOpenedAt: null,
  };

  const userDb = openUserDatabase();
  userDb.execSync('BEGIN IMMEDIATE');
  try {
    upsertInstalledPack(aliasRow, userDb);
    userDb.execSync('COMMIT');
  } catch (error) {
    userDb.execSync('ROLLBACK');
    throw error;
  }

  return aliasRow;
}
