import { z } from 'zod';
import { CARD_TYPE_STORY_READING, CARD_TYPE_VOCABULARY } from './constants.js';
import { vocabularyContentSchema } from './vocabulary-content.js';
import { storyReadingContentSchema } from './story-reading-content.js';

export const vocabularyPackCardRowSchema = z
  .object({
    knowledgeId: z.string().min(1),
    cardType: z.literal(CARD_TYPE_VOCABULARY),
    sortOrder: z.number().int().nonnegative(),
    content: vocabularyContentSchema,
  })
  .strict();

export const storyPackCardRowSchema = z
  .object({
    knowledgeId: z.string().min(1),
    cardType: z.literal(CARD_TYPE_STORY_READING),
    sortOrder: z.number().int().nonnegative(),
    content: storyReadingContentSchema,
  })
  .strict();

export const packCardRowSchema = z.discriminatedUnion('cardType', [
  vocabularyPackCardRowSchema,
  storyPackCardRowSchema,
]);

export type PackCardRow = z.infer<typeof packCardRowSchema>;

/** @deprecated 使用 parsePackCardContent；保留 vocabulary 别名 */
export function parseCardContentJson(contentJson: string): z.infer<typeof vocabularyContentSchema> {
  const parsed: unknown = JSON.parse(contentJson);
  return vocabularyContentSchema.parse(parsed);
}
