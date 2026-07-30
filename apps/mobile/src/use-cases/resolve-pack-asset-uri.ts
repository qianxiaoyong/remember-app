import { findCatalogItem } from '../catalog/catalog-seed';
import {
  getInstalledPack,
  type InstalledPackRow,
} from '../data/repositories/installed-pack-repository';

const BASE_BUNDLED_PACK_ID = 'remember-test-pack';

function resolveInstalledPackForAssets(packId: string): InstalledPackRow | null {
  const direct = getInstalledPack(packId);
  if (direct?.installStatus === 'installed') {
    return direct;
  }

  const catalogItem = findCatalogItem(packId);
  if (!catalogItem?.isBundledTestPack || packId === BASE_BUNDLED_PACK_ID) {
    return null;
  }

  const base = getInstalledPack(BASE_BUNDLED_PACK_ID);
  return base?.installStatus === 'installed' ? base : null;
}

export function resolvePackAssetUri(packId: string, relativePath: string): string | null {
  const installed = resolveInstalledPackForAssets(packId);
  if (!installed) {
    return null;
  }

  const relative = relativePath.startsWith('assets/')
    ? relativePath.slice('assets/'.length)
    : relativePath;
  return `${installed.assetsDir}${relative}`;
}
