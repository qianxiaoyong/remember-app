import { Asset } from 'expo-asset';
import testPackModule from '../../assets/packs/remember-test-pack.zip';
import { findCatalogItem } from '../catalog/catalog-seed';
import { resolvePackDisplayName } from '../catalog/resolve-pack-display-name';
import { installPackFromZipBytes } from '../data/pack/install-pack-from-zip';
import {
  getInstalledPack,
  type InstalledPackRow,
  upsertInstalledPack,
} from '../data/repositories/installed-pack-repository';
import { openUserDatabase } from '../data/user-db/open-user-database';

const BASE_BUNDLED_PACK_ID = 'remember-test-pack';

export async function installBundledTestPack(
  catalogPackId: string = BASE_BUNDLED_PACK_ID,
): Promise<InstalledPackRow> {
  const baseRow = await ensureBaseBundledTestPackInstalled();

  if (catalogPackId === BASE_BUNDLED_PACK_ID) {
    return baseRow;
  }

  const catalogItem = findCatalogItem(catalogPackId);
  if (!catalogItem?.isBundledTestPack) {
    throw new Error('not a bundled test pack catalog item');
  }

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

async function ensureBaseBundledTestPackInstalled(): Promise<InstalledPackRow> {
  const existing = getInstalledPack(BASE_BUNDLED_PACK_ID);
  if (existing?.installStatus === 'installed') {
    return existing;
  }

  const asset = Asset.fromModule(testPackModule);
  await asset.downloadAsync();
  if (!asset.localUri) {
    throw new Error('failed to load bundled test pack');
  }

  const response = await fetch(asset.localUri);
  const buffer = await response.arrayBuffer();
  return installPackFromZipBytes(new Uint8Array(buffer));
}
