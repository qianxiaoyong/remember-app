import { PackVerificationError } from './errors.js';
import {
  CARD_TYPE_STORY_READING,
  CARD_TYPE_VOCABULARY,
  SUPPORTED_CARD_TYPES,
} from './constants.js';
import { parseCardContentJson } from './card.js';
import { parseStoryReadingContentJson } from './story-reading-content.js';
import type { VocabularyContent } from './vocabulary-content.js';
import type { StoryReadingContent } from './story-reading-content.js';

export type CardType = typeof CARD_TYPE_VOCABULARY | typeof CARD_TYPE_STORY_READING;

export type ParsedPackCardContent =
  | {
      cardType: typeof CARD_TYPE_VOCABULARY;
      content: VocabularyContent;
    }
  | {
      cardType: typeof CARD_TYPE_STORY_READING;
      content: StoryReadingContent;
    };

export function parsePackCardContent(cardType: string, contentJson: string): ParsedPackCardContent {
  if (cardType === CARD_TYPE_VOCABULARY) {
    // parseCardContentJson 为 vocabulary 稳定别名
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- ADR 0012 保留别名
    return { cardType: CARD_TYPE_VOCABULARY, content: parseCardContentJson(contentJson) };
  }
  if (cardType === CARD_TYPE_STORY_READING) {
    return {
      cardType: CARD_TYPE_STORY_READING,
      content: parseStoryReadingContentJson(contentJson),
    };
  }
  throw new PackVerificationError(
    'PACK_UNSUPPORTED_CARD_TYPE',
    `unsupported cardType: ${cardType}`,
  );
}

export function isSupportedCardType(cardType: string): cardType is CardType {
  return (SUPPORTED_CARD_TYPES as readonly string[]).includes(cardType);
}
