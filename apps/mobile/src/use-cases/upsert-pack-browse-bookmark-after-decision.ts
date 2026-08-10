import type { PackCardSummary } from '../data/repositories/pack-card-repository';
import { upsertPackBrowseBookmark } from '../data/repositories/pack-browse-bookmark-repository';

type BrowseCardRef = Pick<PackCardSummary, 'knowledgeId' | 'sortOrder'>;

/** 学习决策（加入复习 / 暂不）后，书签应落在下一词；最后一词则仍落在当前词。 */
export function resolvePackBrowseBookmarkTarget(
  browseCards: readonly BrowseCardRef[],
  currentIndex: number,
): BrowseCardRef | null {
  const currentCard = browseCards[currentIndex];
  if (!currentCard) {
    return null;
  }

  const nextCard = browseCards[currentIndex + 1];
  return nextCard ?? currentCard;
}

export function upsertPackBrowseBookmarkAfterDecision(input: {
  packId: string;
  browseCards: readonly BrowseCardRef[];
  currentIndex: number;
  now?: Date;
}): void {
  const target = resolvePackBrowseBookmarkTarget(input.browseCards, input.currentIndex);
  if (!target) {
    return;
  }

  upsertPackBrowseBookmark({
    packId: input.packId,
    knowledgeId: target.knowledgeId,
    sortOrder: target.sortOrder,
    updatedAt: (input.now ?? new Date()).toISOString(),
  });
}
