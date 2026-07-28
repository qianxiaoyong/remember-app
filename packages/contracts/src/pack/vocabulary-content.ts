import { z } from 'zod';

export const vocabularyPhoneticSchema = z
  .object({
    ipa: z.string().min(1),
    dialect: z.enum(['us', 'uk']).optional(),
  })
  .strict();

export const vocabularyPromptSchema = z
  .object({
    headword: z.string().min(1),
    primaryAudio: z.string().min(1),
    phonetic: vocabularyPhoneticSchema.optional(),
    primaryImage: z.string().min(1).optional(),
  })
  .strict();

export const vocabularyDefinitionSchema = z
  .object({
    text: z.string().min(1),
    pos: z.string().min(1).optional(),
  })
  .strict();

export const vocabularyExampleSchema = z
  .object({
    en: z.string().min(1),
    zh: z.string().min(1),
    audio: z.string().min(1).optional(),
  })
  .strict();

export const vocabularyMnemonicSchema = z
  .object({
    kind: z.literal('association'),
    text: z.string().min(1),
  })
  .strict();

export const vocabularyRevealSchema = z
  .object({
    definitions: z.array(vocabularyDefinitionSchema).min(1),
    examples: z.array(vocabularyExampleSchema).min(1).max(5),
    mnemonic: vocabularyMnemonicSchema.optional(),
    inflectionNote: z.string().min(1).optional(),
  })
  .strict();

export const vocabularyContentSchema = z
  .object({
    prompt: vocabularyPromptSchema,
    reveal: vocabularyRevealSchema,
  })
  .strict();

export type VocabularyContent = z.infer<typeof vocabularyContentSchema>;
