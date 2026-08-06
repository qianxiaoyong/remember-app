import { resolvePackDisplayName } from '../catalog/resolve-pack-display-name';
import { getInstalledPack } from '../data/repositories/installed-pack-repository';
import { countDueReviewItems } from './count-due-review-items';
import { countInReviewPoolForPack, countPackCards } from './count-in-review-pool-for-pack';

export interface PackBrowseCompleteSummary {
  packDisplayName: string;
  totalCards: number;
  inReviewPoolCount: number;
  dueReviewCount: number;
}

export function getPackBrowseCompleteSummary(
  packId: string,
  now: Date = new Date(),
): PackBrowseCompleteSummary {
  const installed = getInstalledPack(packId);
  const packDisplayName =
    installed && installed.displayName !== packId
      ? installed.displayName
      : resolvePackDisplayName(packId);

  return {
    packDisplayName,
    totalCards: countPackCards(packId),
    inReviewPoolCount: countInReviewPoolForPack(packId),
    dueReviewCount: countDueReviewItems(now),
  };
}
