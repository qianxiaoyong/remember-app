import * as ed from '@noble/ed25519';
import { sha256 } from '@noble/hashes/sha2.js';
import { sha512 } from '@noble/hashes/sha2.js';
import { verifyPackArchive } from '@remember/contracts';
import {
  cacheDirectory,
  deleteAsync,
  documentDirectory,
  EncodingType,
  makeDirectoryAsync,
  writeAsStringAsync,
} from 'expo-file-system/legacy';
import { backupDatabaseAsync, openDatabaseSync } from 'expo-sqlite';
import {
  countInstalledPacksWithSqlitePath,
  deleteInstalledPackRecord,
  getInstalledPack,
  type InstalledPackRow,
  upsertInstalledPack,
} from '../repositories/installed-pack-repository';
import { openUserDatabase } from '../user-db/open-user-database';
import { createExpoSqliteReader } from './create-expo-sqlite-reader';
import { getPackInstallPaths } from './pack-storage-paths';
import { resolvePackDisplayName } from '../../catalog/resolve-pack-display-name';
import { bytesToBase64, bytesToHex, readZipEntries } from './read-zip-entries';

ed.hashes.sha512 = sha512;
ed.hashes.sha512Async = (message: Uint8Array) => Promise.resolve(sha512(message));

export async function installPackFromZipBytes(zipBytes: Uint8Array): Promise<InstalledPackRow> {
  const filesByPath = readZipEntries(zipBytes);
  const manifestBytes = filesByPath.get('packManifest.json');
  const sqliteBytes = filesByPath.get('pack.sqlite');
  if (!manifestBytes || !sqliteBytes) {
    throw new Error('pack archive missing required root files');
  }

  const manifest = JSON.parse(new TextDecoder().decode(manifestBytes)) as {
    packId: string;
    packVersion: string;
  };

  const stagingDir = `${cacheDirectory ?? ''}pack-install-${String(Date.now())}/`;
  const stagingSqlitePath = `${stagingDir}pack.sqlite`;
  await makeDirectoryAsync(stagingDir, { intermediates: true });
  await writeAsStringAsync(stagingSqlitePath, bytesToBase64(sqliteBytes), {
    encoding: EncodingType.Base64,
  });

  const verifyDb = openDatabaseSync(stagingSqlitePath);
  verifyDb.execSync('PRAGMA query_only = ON');

  try {
    await verifyPackArchive({
      filesByPath,
      totalArchiveBytes: zipBytes.byteLength,
      sha256Hex: (bytes) => bytesToHex(sha256(bytes)),
      ed25519: ed,
      sqliteReader: createExpoSqliteReader(verifyDb),
    });
  } finally {
    verifyDb.closeSync();
  }

  const paths = getPackInstallPaths(manifest.packId);
  await makeDirectoryAsync(paths.packDir, { intermediates: true });
  await makeDirectoryAsync(paths.assetsDir, { intermediates: true });

  for (const [relativePath, bytes] of filesByPath.entries()) {
    if (!relativePath.startsWith('assets/')) {
      continue;
    }
    const assetPath = `${paths.packDir}${relativePath}`;
    const lastSlash = assetPath.lastIndexOf('/');
    if (lastSlash > 0) {
      await makeDirectoryAsync(assetPath.slice(0, lastSlash + 1), { intermediates: true });
    }
    await writeAsStringAsync(assetPath, bytesToBase64(bytes), {
      encoding: EncodingType.Base64,
    });
  }

  const sourceDb = openDatabaseSync(stagingSqlitePath);
  const destDb = openDatabaseSync(paths.sqlitePath);
  try {
    await backupDatabaseAsync({ sourceDatabase: sourceDb, destDatabase: destDb });
  } finally {
    sourceDb.closeSync();
    destDb.closeSync();
  }

  const readOnlyCheck = openDatabaseSync(paths.sqlitePath);
  readOnlyCheck.execSync('PRAGMA query_only = ON');
  readOnlyCheck.closeSync();

  const installedAt = new Date().toISOString();
  const row: InstalledPackRow = {
    packId: manifest.packId,
    displayName: resolvePackDisplayName(manifest.packId),
    packVersion: manifest.packVersion,
    sqlitePath: paths.sqlitePath,
    assetsDir: paths.assetsDir,
    installStatus: 'installed',
    installedAt,
    lastOpenedAt: null,
  };

  const userDb = openUserDatabase();
  userDb.execSync('BEGIN IMMEDIATE');
  try {
    upsertInstalledPack(row, userDb);
    userDb.execSync('COMMIT');
  } catch (error) {
    userDb.execSync('ROLLBACK');
    throw error;
  }

  await deleteAsync(stagingDir, { idempotent: true });
  return row;
}

export async function uninstallPack(packId: string): Promise<void> {
  const existing = getInstalledPack(packId);
  if (!existing) {
    return;
  }

  const userDb = openUserDatabase();
  userDb.execSync('BEGIN IMMEDIATE');
  try {
    deleteInstalledPackRecord(packId, userDb);
    userDb.execSync('COMMIT');
  } catch (error) {
    userDb.execSync('ROLLBACK');
    throw error;
  }

  const remainingReferences = countInstalledPacksWithSqlitePath(existing.sqlitePath, userDb);
  if (remainingReferences > 0) {
    return;
  }

  const lastSlash = existing.sqlitePath.lastIndexOf('/');
  if (lastSlash <= 0) {
    return;
  }

  const packDir = `${existing.sqlitePath.slice(0, lastSlash + 1)}`;
  await deleteAsync(packDir, { idempotent: true });
}

export function assertDocumentDirectoryAvailable(): void {
  if (!documentDirectory) {
    throw new Error('documentDirectory is unavailable');
  }
}
