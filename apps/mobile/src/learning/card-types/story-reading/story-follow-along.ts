import type { StoryReadingContent } from '@remember/contracts';

type StoryParagraph = StoryReadingContent['story']['paragraphs'][number];

export function hasParagraphTimeline(paragraphs: StoryParagraph[]): boolean {
  return paragraphs.some(
    (paragraph) => paragraph.audioStartMs !== undefined && paragraph.audioEndMs !== undefined,
  );
}

export function findActiveParagraphIndex(
  paragraphs: StoryParagraph[],
  positionMs: number,
): number | null {
  if (!hasParagraphTimeline(paragraphs)) {
    return null;
  }

  for (let index = 0; index < paragraphs.length; index += 1) {
    const paragraph = paragraphs[index];
    if (paragraph === undefined) {
      continue;
    }
    const startMs = paragraph.audioStartMs;
    const endMs = paragraph.audioEndMs;
    if (startMs === undefined || endMs === undefined) {
      continue;
    }
    if (positionMs >= startMs && positionMs < endMs) {
      return index;
    }
  }

  const lastParagraph = paragraphs[paragraphs.length - 1];
  if (lastParagraph?.audioEndMs !== undefined && positionMs >= lastParagraph.audioEndMs) {
    return paragraphs.length - 1;
  }

  return null;
}

export function getLastParagraphEndMs(paragraphs: StoryParagraph[]): number | null {
  const lastParagraph = paragraphs[paragraphs.length - 1];
  return lastParagraph?.audioEndMs ?? null;
}
