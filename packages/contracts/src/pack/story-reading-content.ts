import { z } from 'zod';

export const storyTierSchema = z.enum(['high', 'mid', 'low']);

export const storyTextRunSchema = z
  .object({
    kind: z.literal('text'),
    text: z.string().min(1),
  })
  .strict();

export const storyWordRunSchema = z
  .object({
    kind: z.literal('word'),
    surface: z.string().min(1),
    glossZh: z.string().min(1),
    tier: storyTierSchema,
    vocabId: z.string().min(1),
  })
  .strict();

export const storyRunSchema = z.discriminatedUnion('kind', [
  storyTextRunSchema,
  storyWordRunSchema,
]);

export const storyParagraphSchema = z
  .object({
    runs: z.array(storyRunSchema).min(1),
  })
  .strict();

export const storyLessonSchema = z
  .object({
    code: z.string().min(1),
    titleEn: z.string().min(1),
    titleZh: z.string().min(1),
    coverImage: z.string().min(1),
    primaryAudio: z.string().min(1),
  })
  .strict();

export const storySidebarEntrySchema = z
  .object({
    vocabId: z.string().min(1),
    headword: z.string().min(1),
    ipa: z.string().min(1),
    pos: z.string().min(1),
    definitionZh: z.string().min(1),
    tier: storyTierSchema,
  })
  .strict();

export const storyReadingContentSchema = z
  .object({
    lesson: storyLessonSchema,
    story: z
      .object({
        paragraphs: z.array(storyParagraphSchema).min(1),
      })
      .strict(),
    sidebar: z.array(storySidebarEntrySchema),
  })
  .strict();

export type StoryTier = z.infer<typeof storyTierSchema>;
export type StoryTextRun = z.infer<typeof storyTextRunSchema>;
export type StoryWordRun = z.infer<typeof storyWordRunSchema>;
export type StoryRun = z.infer<typeof storyRunSchema>;
export type StoryParagraph = z.infer<typeof storyParagraphSchema>;
export type StoryLesson = z.infer<typeof storyLessonSchema>;
export type StorySidebarEntry = z.infer<typeof storySidebarEntrySchema>;
export type StoryReadingContent = z.infer<typeof storyReadingContentSchema>;

export function parseStoryReadingContentJson(contentJson: string): StoryReadingContent {
  const parsed: unknown = JSON.parse(contentJson);
  return storyReadingContentSchema.parse(parsed);
}
