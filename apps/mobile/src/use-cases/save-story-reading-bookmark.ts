import { upsertStoryReadingBookmark } from '../data/repositories/story-reading-bookmark-repository';

export function saveStoryReadingBookmark(input: {
  packId: string;
  knowledgeId: string;
  positionMs: number;
  now?: Date;
}): void {
  upsertStoryReadingBookmark({
    packId: input.packId,
    knowledgeId: input.knowledgeId,
    positionMs: input.positionMs,
    updatedAt: (input.now ?? new Date()).toISOString(),
  });
}
