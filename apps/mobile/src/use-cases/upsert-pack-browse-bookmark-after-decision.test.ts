import { describe, expect, it, vi } from 'vitest';

vi.mock('../data/repositories/pack-browse-bookmark-repository', () => ({
  upsertPackBrowseBookmark: vi.fn(),
}));

import { upsertPackBrowseBookmark } from '../data/repositories/pack-browse-bookmark-repository';
import {
  resolvePackBrowseBookmarkTarget,
  upsertPackBrowseBookmarkAfterDecision,
} from './upsert-pack-browse-bookmark-after-decision';

const cards = [
  { knowledgeId: 'word-a', sortOrder: 1 },
  { knowledgeId: 'word-b', sortOrder: 2 },
  { knowledgeId: 'word-c', sortOrder: 3 },
];

describe('resolvePackBrowseBookmarkTarget', () => {
  it('writes next card when current is not the last', () => {
    expect(resolvePackBrowseBookmarkTarget(cards, 0)).toEqual(cards[1]);
    expect(resolvePackBrowseBookmarkTarget(cards, 1)).toEqual(cards[2]);
  });

  it('writes current card when current is the last', () => {
    expect(resolvePackBrowseBookmarkTarget(cards, 2)).toEqual(cards[2]);
  });

  it('returns null for invalid index', () => {
    expect(resolvePackBrowseBookmarkTarget(cards, 3)).toBeNull();
  });
});

describe('upsertPackBrowseBookmarkAfterDecision', () => {
  it('persists next card after a decision on a non-last word', () => {
    upsertPackBrowseBookmarkAfterDecision({
      packId: 'remember-test-pack',
      browseCards: cards,
      currentIndex: 1,
      now: new Date('2026-08-10T08:00:00.000Z'),
    });

    expect(upsertPackBrowseBookmark).toHaveBeenCalledWith({
      packId: 'remember-test-pack',
      knowledgeId: 'word-c',
      sortOrder: 3,
      updatedAt: '2026-08-10T08:00:00.000Z',
    });
  });

  it('persists current card after a decision on the last word', () => {
    vi.mocked(upsertPackBrowseBookmark).mockClear();

    upsertPackBrowseBookmarkAfterDecision({
      packId: 'remember-test-pack',
      browseCards: cards,
      currentIndex: 2,
      now: new Date('2026-08-10T08:00:00.000Z'),
    });

    expect(upsertPackBrowseBookmark).toHaveBeenCalledWith({
      packId: 'remember-test-pack',
      knowledgeId: 'word-c',
      sortOrder: 3,
      updatedAt: '2026-08-10T08:00:00.000Z',
    });
  });

  it('does nothing for invalid index', () => {
    vi.mocked(upsertPackBrowseBookmark).mockClear();

    upsertPackBrowseBookmarkAfterDecision({
      packId: 'remember-test-pack',
      browseCards: cards,
      currentIndex: 99,
    });

    expect(upsertPackBrowseBookmark).not.toHaveBeenCalled();
  });
});
