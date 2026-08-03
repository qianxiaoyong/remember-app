import type { PackSourceCard } from '@remember/pack-builder/pack-source';
import { isStorySourceCard } from '../utils/is-story-source-card.js';

export interface CardRow {
  sortOrder: number;
  headword: string;
  cardType: 'vocabulary' | 'story';
  lessonCode?: string;
  titleZh?: string;
}

export function mapSourceCardsToRows(cards: PackSourceCard[]): CardRow[] {
  return [...cards]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((card) => {
      if (isStorySourceCard(card)) {
        return {
          sortOrder: card.sortOrder,
          headword: `${card.content.lesson.code} ${card.content.lesson.titleEn}`,
          cardType: 'story' as const,
          lessonCode: card.content.lesson.code,
          titleZh: card.content.lesson.titleZh,
        };
      }
      return {
        sortOrder: card.sortOrder,
        headword: card.content.prompt.headword,
        cardType: 'vocabulary' as const,
      };
    });
}

export function buildDeleteDescription(card: CardRow): string {
  if (card.cardType === 'story') {
    return `确定删除一课 #${String(card.sortOrder)} ${card.lessonCode ?? ''} ${card.titleZh ?? card.headword}？此操作不可撤销。`;
  }
  return `确定删除 #${String(card.sortOrder)}「${card.headword}」？此操作不可撤销。`;
}
