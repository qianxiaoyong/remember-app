import { PackVerificationError } from './errors.js';
import { CARD_TYPE_VOCABULARY, SUPPORTED_CARD_TYPES } from './constants.js';
import { parseCardContentJson } from './card.js';
import type { VocabularyContent } from './vocabulary-content.js';

export type CardType = typeof CARD_TYPE_VOCABULARY;

export type ParsedPackCardContent = {
  cardType: typeof CARD_TYPE_VOCABULARY;
  content: VocabularyContent;
};

export function parsePackCardContent(cardType: string, contentJson: string): ParsedPackCardContent {
  if (cardType !== CARD_TYPE_VOCABULARY) {
    throw new PackVerificationError(
      'PACK_UNSUPPORTED_CARD_TYPE',
      `unsupported cardType: ${cardType}`,
    );
  }
  return { cardType: CARD_TYPE_VOCABULARY, content: parseCardContentJson(contentJson) };
}

export function isSupportedCardType(cardType: string): cardType is typeof CARD_TYPE_VOCABULARY {
  return (SUPPORTED_CARD_TYPES as readonly string[]).includes(cardType);
}
