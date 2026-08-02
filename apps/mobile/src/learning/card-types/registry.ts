import { CARD_TYPE_STORY_READING, CARD_TYPE_VOCABULARY } from '@remember/contracts';
import type { CardTypeDefinition } from './types';
import { StoryReadingCardRenderer } from './story-reading/parse-content';
import { VocabularyCardRenderer } from './vocabulary/parse-content';

export const cardTypeRegistry: Record<string, CardTypeDefinition> = {
  [CARD_TYPE_VOCABULARY]: { reviewMode: 'sm2', Renderer: VocabularyCardRenderer },
  [CARD_TYPE_STORY_READING]: {
    reviewMode: 'lesson_complete',
    Renderer: StoryReadingCardRenderer,
  },
};

export function resolveCardTypeDefinition(cardType: string): CardTypeDefinition | null {
  return cardTypeRegistry[cardType] ?? null;
}
