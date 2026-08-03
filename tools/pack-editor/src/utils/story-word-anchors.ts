import type { StoryWordRun } from '@remember/contracts';

export class StoryRunsSyncError extends Error {
  readonly lostWords: StoryWordRun[];

  constructor(lostWords: StoryWordRun[]) {
    const surfaces = lostWords.map((word) => word.surface).join(', ');
    super(`word anchor lost after text edit: ${surfaces}`);
    this.name = 'StoryRunsSyncError';
    this.lostWords = lostWords;
  }
}

export function findLostWordAnchors(wordRuns: StoryWordRun[], plain: string): StoryWordRun[] {
  let cursor = 0;
  const lost: StoryWordRun[] = [];
  for (const word of wordRuns) {
    const idx = plain.indexOf(word.surface, cursor);
    if (idx === -1) {
      lost.push(word);
      continue;
    }
    cursor = idx + word.surface.length;
  }
  return lost;
}
