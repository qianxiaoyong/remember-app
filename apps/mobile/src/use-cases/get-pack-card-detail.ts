import { getInstalledPack } from '../data/repositories/installed-pack-repository';
import { getPackCardDetail, type PackCardDetail } from '../data/pack/pack-card-details';

export function getPackCardDetailUseCase(
  packId: string,
  knowledgeId: string,
): PackCardDetail | null {
  const installedPack = getInstalledPack(packId);
  if (!installedPack) {
    throw new Error(`pack not installed: ${packId}`);
  }
  return getPackCardDetail(installedPack.sqlitePath, knowledgeId);
}
