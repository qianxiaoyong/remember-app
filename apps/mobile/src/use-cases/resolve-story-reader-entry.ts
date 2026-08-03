import { CARD_TYPE_STORY_READING } from '@remember/contracts';
import { listPackCardDetails } from '../data/pack/pack-card-details';
import { getInstalledPack } from '../data/repositories/installed-pack-repository';
import { getStoryReadingBookmark } from '../data/repositories/story-reading-bookmark-repository';

export interface StoryReaderEntry {
  knowledgeId: string;
  positionMs: number;
}

export function resolveStoryReaderEntry(
  packId: string,
  explicitKnowledgeId?: string | null,
): StoryReaderEntry {
  const installedPack = getInstalledPack(packId);
  if (!installedPack) {
    throw new Error(`pack not installed: ${packId}`);
  }

  const storyCards = listPackCardDetails(installedPack.sqlitePath).filter(
    (card) => card.cardType === CARD_TYPE_STORY_READING,
  );
  if (storyCards.length === 0) {
    throw new Error(`pack has no story cards: ${packId}`);
  }

  const firstLesson = storyCards[0];
  if (firstLesson === undefined) {
    throw new Error(`pack has no story cards: ${packId}`);
  }

  if (explicitKnowledgeId) {
    const exists = storyCards.some((card) => card.knowledgeId === explicitKnowledgeId);
    if (!exists) {
      throw new Error(`story lesson not found: ${explicitKnowledgeId}`);
    }
    return { knowledgeId: explicitKnowledgeId, positionMs: 0 };
  }

  const bookmark = getStoryReadingBookmark(packId);
  if (bookmark) {
    const exists = storyCards.some((card) => card.knowledgeId === bookmark.knowledgeId);
    if (exists) {
      return {
        knowledgeId: bookmark.knowledgeId,
        positionMs: bookmark.positionMs,
      };
    }
  }

  return { knowledgeId: firstLesson.knowledgeId, positionMs: 0 };
}

export function listStoryLessonSummaries(packId: string): {
  knowledgeId: string;
  sortOrder: number;
  code: string;
  titleZh: string;
}[] {
  const installedPack = getInstalledPack(packId);
  if (!installedPack) {
    return [];
  }

  return listPackCardDetails(installedPack.sqlitePath)
    .filter((card) => card.cardType === CARD_TYPE_STORY_READING)
    .map((card) => ({
      knowledgeId: card.knowledgeId,
      sortOrder: card.sortOrder,
      code: card.content.lesson.code,
      titleZh: card.content.lesson.titleZh,
    }));
}
