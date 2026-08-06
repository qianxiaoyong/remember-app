import { describe, expect, it, vi } from 'vitest';

vi.mock('../data/repositories/installed-pack-repository', () => ({
  getInstalledPack: vi.fn(() => ({
    packId: 'remember-test-pack',
    displayName: 'Test Pack',
    packVersion: '1.0.0',
    sqlitePath: '/tmp/pack.sqlite',
    assetsDir: '/tmp/assets',
    installStatus: 'installed',
    installedAt: '2026-08-01T00:00:00.000Z',
    lastOpenedAt: null,
  })),
}));

vi.mock('../data/repositories/pack-card-repository', () => ({
  listPackCards: vi.fn(() => [
    { knowledgeId: 'word-a', sortOrder: 1, headword: 'alpha' },
    { knowledgeId: 'word-b', sortOrder: 2, headword: 'beta' },
    { knowledgeId: 'word-c', sortOrder: 3, headword: 'gamma' },
  ]),
}));

vi.mock('../data/repositories/pack-browse-bookmark-repository', () => ({
  getPackBrowseBookmark: vi.fn(() => ({
    packId: 'remember-test-pack',
    knowledgeId: 'word-b',
    sortOrder: 2,
    updatedAt: '2026-08-06T00:00:00.000Z',
  })),
}));

vi.mock('../data/repositories/user-preferences-repository', () => ({
  getPackOpenPosition: vi.fn(() => 'bookmark'),
}));

import { getPackOpenPosition } from '../data/repositories/user-preferences-repository';
import { getPackBrowseBookmark } from '../data/repositories/pack-browse-bookmark-repository';
import { resumePackBrowse } from './resume-pack-browse';

describe('resumePackBrowse', () => {
  it('packOpenPosition=bookmark 时从书签词开始', () => {
    const state = resumePackBrowse({ packId: 'remember-test-pack' });
    expect(state.initialKnowledgeId).toBe('word-b');
    expect(state.initialIndex).toBe(1);
    expect(state.cards).toHaveLength(3);
  });

  it('packOpenPosition=start 时从列表顶开始', () => {
    vi.mocked(getPackOpenPosition).mockReturnValue('start');
    vi.mocked(getPackBrowseBookmark).mockReturnValue({
      packId: 'remember-test-pack',
      knowledgeId: 'word-b',
      sortOrder: 2,
      updatedAt: '2026-08-06T00:00:00.000Z',
    });

    const state = resumePackBrowse({ packId: 'remember-test-pack' });
    expect(state.initialKnowledgeId).toBe('word-a');
    expect(state.initialIndex).toBe(0);
  });
});
