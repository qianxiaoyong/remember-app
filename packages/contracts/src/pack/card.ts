import { z } from 'zod';
import { CARD_TYPE_VOCABULARY } from './constants.js';
import { vocabularyContentSchema } from './vocabulary-content.js';

export const packCardRowSchema = z
  .object({
    knowledgeId: z.string().min(1),
    cardType: z.literal(CARD_TYPE_VOCABULARY),
    sortOrder: z.number().int().nonnegative(),
    content: vocabularyContentSchema,
  })
  .strict();

export type PackCardRow = z.infer<typeof packCardRowSchema>;

export function parseCardContentJson(contentJson: string): z.infer<typeof vocabularyContentSchema> {
  const parsed: unknown = JSON.parse(contentJson);
  return vocabularyContentSchema.parse(parsed);
}
