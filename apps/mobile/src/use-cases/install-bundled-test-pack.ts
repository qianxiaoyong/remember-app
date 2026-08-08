import { Asset } from 'expo-asset';
import rememberTestPackModule from '../../assets/packs/remember-test-pack.zip';
import storyTestPackModule from '../../assets/packs/story-test-pack.zip';
import { findCatalogItem } from '../catalog/catalog-seed';
import { installPackFromZipBytes } from '../data/pack/install-pack-from-zip';
import { readZipEntries } from '../data/pack/read-zip-entries';
import {
  getInstalledPack,
  type InstalledPackRow,
} from '../data/repositories/installed-pack-repository';
import { aliasInstalledPack } from './alias-installed-pack';

const BASE_BUNDLED_PACK_ID = 'remember-test-pack';
const STORY_BUNDLED_PACK_ID = 'story-test-pack';

const primaryBundledPackModules: Record<string, number> = {
  [BASE_BUNDLED_PACK_ID]: rememberTestPackModule,
};

const bundledPackModules: Record<string, number> = {
  ...primaryBundledPackModules,
  [STORY_BUNDLED_PACK_ID]: storyTestPackModule,
};

export async function installBundledTestPack(
  catalogPackId: string = BASE_BUNDLED_PACK_ID,
): Promise<InstalledPackRow> {
  if (catalogPackId in bundledPackModules) {
    return ensureBundledPackInstalled(catalogPackId);
  }

  const baseRow = await ensureBundledPackInstalled(BASE_BUNDLED_PACK_ID);

  const catalogItem = findCatalogItem(catalogPackId);
  if (!catalogItem?.isBundledTestPack) {
    throw new Error('not a bundled test pack catalog item');
  }

  return aliasInstalledPack(catalogPackId, baseRow);
}

/** APK 内置包版本高于已安装包时静默重装（不依赖服务器下载）。 */
export async function upgradePrimaryBundledPacksIfNeeded(): Promise<void> {
  for (const packId of Object.keys(primaryBundledPackModules)) {
    await ensureBundledPackInstalled(packId);
  }
}

async function ensureBundledPackInstalled(packId: string): Promise<InstalledPackRow> {
  const moduleId = bundledPackModules[packId];
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
  const zipBytes = new Uint8Array(buffer);
  const bundledVersion = readBundledPackVersion(zipBytes);

  const existing = getInstalledPack(packId);
  if (
    existing?.installStatus === 'installed' &&
    !isPackVersionOlder(existing.packVersion, bundledVersion)
  ) {
    return existing;
  }

  return installPackFromZipBytes(zipBytes);
}

function readBundledPackVersion(zipBytes: Uint8Array): string {
  const manifestBytes = readZipEntries(zipBytes).get('packManifest.json');
  if (!manifestBytes) {
    throw new Error('bundled pack missing packManifest.json');
  }
  const manifest = JSON.parse(new TextDecoder().decode(manifestBytes)) as { packVersion?: string };
  if (!manifest.packVersion) {
    throw new Error('bundled pack manifest missing packVersion');
  }
  return manifest.packVersion;
}

import { isPackVersionOlder } from '@remember/domain';
