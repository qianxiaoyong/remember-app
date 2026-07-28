import { Asset } from 'expo-asset';
import testPackModule from '../../assets/packs/remember-test-pack.zip';
import { installPackFromZipBytes } from '../data/pack/install-pack-from-zip';
import type { InstalledPackRow } from '../data/repositories/installed-pack-repository';

export async function installBundledTestPack(): Promise<InstalledPackRow> {
  const asset = Asset.fromModule(testPackModule);
  await asset.downloadAsync();
  if (!asset.localUri) {
    throw new Error('failed to load bundled test pack');
  }

  const response = await fetch(asset.localUri);
  const buffer = await response.arrayBuffer();
  return installPackFromZipBytes(new Uint8Array(buffer));
}
