import { CARD_TYPE_VOCABULARY } from '@remember/contracts';
import type { CardTypeDefinition } from './types.js';
import { VocabularyCardRenderer } from './vocabulary/parse-content.js';

export const cardTypeRegistry: Record<string, CardTypeDefinition> = {
  [CARD_TYPE_VOCABULARY]: { reviewMode: 'sm2', Renderer: VocabularyCardRenderer },
};

export function resolveCardTypeDefinition(cardType: string): CardTypeDefinition | null {
  return cardTypeRegistry[cardType] ?? null;
}
