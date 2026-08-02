import { CARD_TYPE_VOCABULARY } from '@remember/contracts';
import type { CardTypeDefinition } from './types';
import { VocabularyCardRenderer } from './vocabulary/parse-content';

export const cardTypeRegistry: Record<string, CardTypeDefinition> = {
  [CARD_TYPE_VOCABULARY]: { reviewMode: 'sm2', Renderer: VocabularyCardRenderer },
};

export function resolveCardTypeDefinition(cardType: string): CardTypeDefinition | null {
  return cardTypeRegistry[cardType] ?? null;
}
