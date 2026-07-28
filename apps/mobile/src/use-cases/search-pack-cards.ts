import { getInstalledPack } from '../data/repositories/installed-pack-repository';
import { searchPackCardsByHeadword, type PackCardDetail } from '../data/pack/pack-card-details';

export function searchPackCardsUseCase(packId: string, query: string): PackCardDetail[] {
  const installedPack = getInstalledPack(packId);
  if (!installedPack) {
    throw new Error(`pack not installed: ${packId}`);
  }
  return searchPackCardsByHeadword(installedPack.sqlitePath, query);
}
