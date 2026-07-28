import { z } from 'zod';
import { vocabularyDefinitionSchema } from './vocabulary-content.js';

export const lexiconEntrySchema = z
  .object({
    surfaceForm: z.string().min(1),
    displayForm: z.string().min(1),
    definitions: z.array(vocabularyDefinitionSchema).min(1),
    ipa: z.string().min(1).optional(),
    formNote: z.string().min(1).optional(),
    audioUrl: z.url().refine((value) => value.startsWith('https://')).optional(),
  })
  .strict();

export type LexiconEntry = z.infer<typeof lexiconEntrySchema>;

export function parseLexiconDefinitionsJson(
  definitionsJson: string,
): z.infer<typeof vocabularyDefinitionSchema>[] {
  const parsed: unknown = JSON.parse(definitionsJson);
  return z.array(vocabularyDefinitionSchema).min(1).parse(parsed);
}
