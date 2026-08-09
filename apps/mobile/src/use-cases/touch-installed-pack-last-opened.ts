import { touchInstalledPackLastOpened } from '../data/repositories/touch-installed-pack-last-opened';

export function touchInstalledPackLastOpenedUseCase(packId: string): void {
  touchInstalledPackLastOpened(packId);
}
