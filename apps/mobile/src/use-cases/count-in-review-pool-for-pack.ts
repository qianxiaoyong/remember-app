import { listLearningStatesForPackContent } from '../data/repositories/learning-state-for-pack-content';
import { getInstalledPack } from '../data/repositories/installed-pack-repository';
import { listPackCards } from '../data/repositories/pack-card-repository';

export function countInReviewPoolForPack(packId: string): number {
  const installed = getInstalledPack(packId);
  if (!installed) {
    return 0;
  }
  const states = listLearningStatesForPackContent(installed.sqlitePath);
  return states.filter((state) => state.inReviewPool).length;
}

export function countPackCards(packId: string): number {
  const installed = getInstalledPack(packId);
  if (!installed) {
    return 0;
  }
  return listPackCards(installed.sqlitePath).length;
}
