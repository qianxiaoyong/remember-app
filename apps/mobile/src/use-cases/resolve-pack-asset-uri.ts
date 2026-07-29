import { getInstalledPack } from '../data/repositories/installed-pack-repository';

export function resolvePackAssetUri(packId: string, relativePath: string): string | null {
  const installed = getInstalledPack(packId);
  if (!installed || installed.installStatus !== 'installed') {
    return null;
  }

  const relative = relativePath.startsWith('assets/')
    ? relativePath.slice('assets/'.length)
    : relativePath;
  return `${installed.assetsDir}${relative}`;
}
