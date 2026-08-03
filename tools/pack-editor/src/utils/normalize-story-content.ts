import { storyReadingContentSchema, type StoryReadingContent } from '@remember/contracts';
import { recomputeSegmentTimeline } from './recompute-segment-timeline.js';
import { runsToPlainText, syncRunsToPlainText } from './story-runs-markup.js';

export function normalizeStoryContent(
  values: StoryReadingContent,
  options?: { primaryAudioDurationMs?: number },
): StoryReadingContent {
  const lesson = {
    ...values.lesson,
    code: values.lesson.code.trim(),
    titleEn: values.lesson.titleEn.trim(),
    titleZh: values.lesson.titleZh.trim(),
    coverImage: values.lesson.coverImage.trim(),
    primaryAudio: values.lesson.primaryAudio.trim(),
  };

  const durationMs = options?.primaryAudioDurationMs ?? 0;
  const timelineParagraphs = recomputeSegmentTimeline(values.story.paragraphs, durationMs);

  const paragraphs = timelineParagraphs.map((paragraph) => {
    const plain = runsToPlainText(paragraph.runs);
    const syncedRuns = syncRunsToPlainText(paragraph.runs, plain, values.sidebar);
    const runs = syncedRuns
      .map((run) => {
        if (run.kind === 'text') {
          if (run.text.length === 0) {
            return null;
          }
          return { kind: 'text' as const, text: run.text };
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
