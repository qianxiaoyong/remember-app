import { listInstalledPacks } from '../data/repositories/installed-pack-repository';
import type { InstalledPackRow } from '../data/repositories/installed-pack-repository';

export function listInstalledPacksUseCase(): InstalledPackRow[] {
  return listInstalledPacks();
}
