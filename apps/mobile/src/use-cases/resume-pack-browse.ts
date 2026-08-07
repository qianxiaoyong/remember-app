import { getInstalledPack } from '../data/repositories/installed-pack-repository';
import { listPackCards, type PackCardSummary } from '../data/repositories/pack-card-repository';
import { getPackBrowseBookmark } from '../data/repositories/pack-browse-bookmark-repository';
import { getPackOpenPosition } from '../data/repositories/user-preferences-repository';

export interface PackBrowseState {
  cards: PackCardSummary[];
  initialKnowledgeId: string;
  initialIndex: number;
}

export function resumePackBrowse(input: { packId: string; now?: Date }): PackBrowseState {
  const installedPack = getInstalledPack(input.packId);
  if (!installedPack) {
    throw new Error(`pack not installed: ${input.packId}`);
  }

  const cards = listPackCards(installedPack.sqlitePath);
  if (cards.length === 0) {
    throw new Error(`pack has no cards: ${input.packId}`);
  }

  const openPosition = getPackOpenPosition();
  const bookmark = getPackBrowseBookmark(input.packId);
  let initialKnowledgeId = cards[0]?.knowledgeId ?? '';

  if (openPosition === 'bookmark' && bookmark) {
    const bookmarkIndex = cards.findIndex((card) => card.knowledgeId === bookmark.knowledgeId);
    if (bookmarkIndex >= 0) {
      initialKnowledgeId = bookmark.knowledgeId;
    }
  }

  const initialIndex = Math.max(
    cards.findIndex((card) => card.knowledgeId === initialKnowledgeId),
    0,
  );

  return {
    cards,
    initialKnowledgeId,
    initialIndex,
  };
}
