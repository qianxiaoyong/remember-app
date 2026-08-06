import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../data/repositories/installed-pack-repository', () => ({
  getInstalledPack: vi.fn(),
}));

vi.mock('../data/repositories/pack-browse-bookmark-repository', () => ({
  deletePackBrowseBookmark: vi.fn(),
}));

vi.mock('../data/repositories/story-reading-bookmark-repository', () => ({
  deleteStoryReadingBookmark: vi.fn(),
}));

vi.mock('../data/user-db/open-user-database', () => ({
  openUserDatabase: vi.fn(() => ({})),
}));

vi.mock('./resolve-pack-library-presentation', () => ({
  resolvePackLibraryPresentation: vi.fn(() => 'study'),
}));

import { deletePackBrowseBookmark } from '../data/repositories/pack-browse-bookmark-repository';
import { getInstalledPack } from '../data/repositories/installed-pack-repository';
import { deleteStoryReadingBookmark } from '../data/repositories/story-reading-bookmark-repository';
import { resolvePackLibraryPresentation } from './resolve-pack-library-presentation';
import { resetPackBrowseProgress } from './reset-pack-browse-progress';

describe('resetPackBrowseProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getInstalledPack).mockReturnValue({
      packId: 'remember-test-pack',
      displayName: '记得测试包',
      packVersion: '1.0.0',
      sqlitePath: '/tmp/pack.sqlite',
      assetsDir: 'file:///packs/remember-test-pack/assets/',
      installStatus: 'installed',
      installedAt: '2026-08-06T00:00:00.000Z',
      lastOpenedAt: null,
    });
  });

  it('study 包删除浏览书签', () => {
    resetPackBrowseProgress({ packId: 'remember-test-pack' });
    expect(deletePackBrowseBookmark).toHaveBeenCalledWith('remember-test-pack', expect.anything());
    expect(deleteStoryReadingBookmark).not.toHaveBeenCalled();
  });

  it('reader 包删除阅读书签', () => {
    vi.mocked(resolvePackLibraryPresentation).mockReturnValue('reader');
    resetPackBrowseProgress({ packId: 'story-test-pack' });
    expect(deleteStoryReadingBookmark).toHaveBeenCalledWith('story-test-pack', expect.anything());
    expect(deletePackBrowseBookmark).not.toHaveBeenCalled();
  });

  it('未安装时抛错', () => {
    vi.mocked(getInstalledPack).mockReturnValue(null);
    expect(() => {
      resetPackBrowseProgress({ packId: 'missing' });
    }).toThrow('学习包未安装');
  });
});
