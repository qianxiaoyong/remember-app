import { isLegacyBundledTestPackId } from '../lib/bundled-test-pack-ids';
import { listInstalledPacks } from '../data/repositories/installed-pack-repository';
import { uninstallInstalledPack } from './uninstall-installed-pack';

/** 一次性清理本机残留的内置测试包安装记录与文件。 */
export async function purgeLegacyBundledTestPacks(): Promise<void> {
  const installed = listInstalledPacks();
  for (const pack of installed) {
    if (!isLegacyBundledTestPackId(pack.packId)) {
      continue;
    }
    await uninstallInstalledPack(pack.packId);
  }
}
