import { uninstallPack } from '../data/pack/install-pack-from-zip';

export async function uninstallInstalledPack(packId: string): Promise<void> {
  await uninstallPack(packId);
}
