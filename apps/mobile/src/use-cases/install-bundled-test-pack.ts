import { Asset } from 'expo-asset';
import testPackModule from '../../assets/packs/remember-test-pack.zip';
import { findCatalogItem } from '../catalog/catalog-seed';
import { installPackFromZipBytes } from '../data/pack/install-pack-from-zip';
import {
  getInstalledPack,
  type InstalledPackRow,
} from '../data/repositories/installed-pack-repository';
import { aliasInstalledPack } from './alias-installed-pack';

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

  const aliasRow = aliasInstalledPack(catalogPackId, baseRow);
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
