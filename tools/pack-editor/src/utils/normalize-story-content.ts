import { storyReadingContentSchema, type StoryReadingContent } from '@remember/contracts';

export function normalizeStoryContent(values: StoryReadingContent): StoryReadingContent {
  const lesson = {
    ...values.lesson,
    code: values.lesson.code.trim(),
    titleEn: values.lesson.titleEn.trim(),
    titleZh: values.lesson.titleZh.trim(),
    coverImage: values.lesson.coverImage.trim(),
    primaryAudio: values.lesson.primaryAudio.trim(),
  };

  const paragraphs = values.story.paragraphs.map((paragraph) => {
    const runs = paragraph.runs
      .map((run) => {
        if (run.kind === 'text') {
          const text = run.text.trim();
          if (!text) {
            return null;
          }
          return { kind: 'text' as const, text };
        }
        return {
          kind: 'word' as const,
          surface: run.surface.trim(),
          glossZh: run.glossZh.trim(),
          tier: run.tier,
          vocabId: run.vocabId.trim(),
        };
      })
      .filter((run): run is NonNullable<typeof run> => run !== null);

    const next: StoryReadingContent['story']['paragraphs'][number] = { runs };
    if (paragraph.audioStartMs !== undefined && paragraph.audioEndMs !== undefined) {
      next.audioStartMs = paragraph.audioStartMs;
      next.audioEndMs = paragraph.audioEndMs;
    }
    const translation = paragraph.translationZh?.trim();
    if (translation) {
      next.translationZh = translation;
    }
    return next;
  });

  const sidebar = values.sidebar.map((entry) => ({
    vocabId: entry.vocabId.trim(),
    headword: entry.headword.trim(),
    ipa: entry.ipa.trim(),
    pos: entry.pos.trim(),
    definitionZh: entry.definitionZh.trim(),
    tier: entry.tier,
  }));

  return storyReadingContentSchema.parse({
    lesson,
    story: { paragraphs },
    sidebar,
  });
}
