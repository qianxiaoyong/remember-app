import { Asset } from 'expo-asset';
import rememberTestPackModule from '../../assets/packs/remember-test-pack.zip';
import storyTestPackModule from '../../assets/packs/story-test-pack.zip';
import { findCatalogItem } from '../catalog/catalog-seed';
import { installPackFromZipBytes } from '../data/pack/install-pack-from-zip';
import {
  getInstalledPack,
  type InstalledPackRow,
} from '../data/repositories/installed-pack-repository';
import { aliasInstalledPack } from './alias-installed-pack';

const BASE_BUNDLED_PACK_ID = 'remember-test-pack';
const STORY_BUNDLED_PACK_ID = 'story-test-pack';

const primaryBundledPackModules: Record<string, number> = {
  [BASE_BUNDLED_PACK_ID]: rememberTestPackModule,
  [STORY_BUNDLED_PACK_ID]: storyTestPackModule,
};

export async function installBundledTestPack(
  catalogPackId: string = BASE_BUNDLED_PACK_ID,
): Promise<InstalledPackRow> {
  if (catalogPackId in primaryBundledPackModules) {
    return ensurePrimaryBundledPackInstalled(catalogPackId);
  }

  const baseRow = await ensurePrimaryBundledPackInstalled(BASE_BUNDLED_PACK_ID);

  const catalogItem = findCatalogItem(catalogPackId);
  if (!catalogItem?.isBundledTestPack) {
    throw new Error('not a bundled test pack catalog item');
  }

  return aliasInstalledPack(catalogPackId, baseRow);
}

async function ensurePrimaryBundledPackInstalled(packId: string): Promise<InstalledPackRow> {
  const existing = getInstalledPack(packId);
  if (existing?.installStatus === 'installed') {
    return existing;
  }

  const moduleId = primaryBundledPackModules[packId];
  if (moduleId === undefined) {
    throw new Error(`unknown primary bundled pack: ${packId}`);
  }

  const asset = Asset.fromModule(moduleId);
  await asset.downloadAsync();
  if (!asset.localUri) {
    throw new Error(`failed to load bundled pack: ${packId}`);
  }

  const response = await fetch(asset.localUri);
  const buffer = await response.arrayBuffer();
  return installPackFromZipBytes(new Uint8Array(buffer));
}
