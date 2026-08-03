import type { StoryReadingContent, StoryTier } from '@remember/contracts';

export function syncWordRunTiersFromSidebar(content: StoryReadingContent): StoryReadingContent {
  const tierByVocabId = new Map(content.sidebar.map((entry) => [entry.vocabId, entry.tier]));

  const paragraphs = content.story.paragraphs.map((paragraph) => ({
    ...paragraph,
    runs: paragraph.runs.map((run) => {
      if (run.kind !== 'word') {
        return run;
      }
      const tier = tierByVocabId.get(run.vocabId);
      if (tier === undefined || tier === run.tier) {
        return run;
      }
      return { ...run, tier };
    }),
  }));

  return {
    ...content,
    story: { paragraphs },
  };
}

export function applySidebarTierToParagraphs(input: {
  paragraphs: StoryReadingContent['story']['paragraphs'];
  vocabId: string;
  tier: StoryTier;
}): StoryReadingContent['story']['paragraphs'] {
  return input.paragraphs.map((paragraph) => ({
    ...paragraph,
    runs: paragraph.runs.map((run) => {
      if (run.kind === 'word' && run.vocabId === input.vocabId && run.tier !== input.tier) {
        return { ...run, tier: input.tier };
      }
      return run;
    }),
  }));
}
