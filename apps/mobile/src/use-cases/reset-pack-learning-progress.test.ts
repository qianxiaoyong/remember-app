import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../data/user-db/open-user-database', () => ({
  openUserDatabase: vi.fn(() => ({
    execSync: vi.fn(),
  })),
}));

vi.mock('../data/repositories/installed-pack-repository', () => ({
  getInstalledPack: vi.fn(),
}));

vi.mock('../data/repositories/pack-card-repository', () => ({
  listPackCards: vi.fn(),
}));

vi.mock('../data/repositories/pack-browse-bookmark-repository', () => ({
  deletePackBrowseBookmark: vi.fn(),
}));

vi.mock('../data/repositories/story-reading-bookmark-repository', () => ({
  deleteStoryReadingBookmark: vi.fn(),
}));

vi.mock('../data/repositories/learning-state-repository', () => ({
  getLearningStateByKnowledgeId: vi.fn(),
  upsertReviewPoolState: vi.fn(),
}));

vi.mock('../data/repositories/sync-outbox-repository', () => ({
  insertSyncOutboxItem: vi.fn(),
}));

vi.mock('../data/sync/build-sync-outbox-payload', () => ({
  buildSyncOutboxPayload: vi.fn(() => '{"inReviewPool":false}'),
}));

vi.mock('../data/create-record-id', () => ({
  createRecordId: vi.fn(() => 'sync-reset'),
}));

vi.mock('./resolve-pack-library-presentation', () => ({
  resolvePackLibraryPresentation: vi.fn(() => 'study'),
}));

import { deletePackBrowseBookmark } from '../data/repositories/pack-browse-bookmark-repository';
import { getInstalledPack } from '../data/repositories/installed-pack-repository';
import { getLearningStateByKnowledgeId } from '../data/repositories/learning-state-repository';
import { listPackCards } from '../data/repositories/pack-card-repository';
import { insertSyncOutboxItem } from '../data/repositories/sync-outbox-repository';
import { upsertReviewPoolState } from '../data/repositories/learning-state-repository';
import { resetPackLearningProgress } from './reset-pack-learning-progress';
import type { InstalledPackRow } from '../data/repositories/installed-pack-repository';

const installedPackFixture: InstalledPackRow = {
  packId: 'remember-test-pack',
  displayName: '记得测试包',
  packVersion: '1.0.0',
  sqlitePath: '/tmp/pack.sqlite',
  assetsDir: 'file:///packs/remember-test-pack/assets/',
  installStatus: 'installed',
  installedAt: '2026-08-06T00:00:00.000Z',
  lastOpenedAt: null,
};

const knowledgeIdA = 'remember-test-pack:en:word:hello';
const knowledgeIdB = 'remember-test-pack:en:word:world';

describe('resetPackLearningProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getInstalledPack).mockReturnValue(installedPackFixture);
    vi.mocked(listPackCards).mockReturnValue([
      { knowledgeId: knowledgeIdA, sortOrder: 1, headword: 'hello' },
      { knowledgeId: knowledgeIdB, sortOrder: 2, headword: 'world' },
    ]);
  });

  it('仅重置浏览进度时删除书签', () => {
    resetPackLearningProgress({
      packId: 'remember-test-pack',
      resetBrowse: true,
      resetReview: false,
    });

    expect(deletePackBrowseBookmark).toHaveBeenCalledWith('remember-test-pack', expect.anything());
    expect(upsertReviewPoolState).not.toHaveBeenCalled();
    expect(insertSyncOutboxItem).not.toHaveBeenCalled();
  });

  it('重置复习进度时将本包在池词条移出并写 outbox', () => {
    vi.mocked(getLearningStateByKnowledgeId).mockImplementation((knowledgeId) => {
      if (knowledgeId === knowledgeIdA) {
        return {
          knowledgeId: knowledgeIdA,
          packId: 'remember-test-pack',
          easiness: 2.5,
          intervalDays: 0,
          repetitions: 0,
          dueAt: '2026-08-07T00:00:00.000Z',
          clientVersion: 2,
          updatedAt: '2026-08-06T00:00:00.000Z',
          inReviewPool: true,
          boxLevel: 1,
          firstAddedFromPackId: 'remember-test-pack',
          lastSeenInPackId: 'remember-test-pack',
          consecutiveLevel3Passes: 0,
        };
      }
      return null;
    });

    const result = resetPackLearningProgress({
      packId: 'remember-test-pack',
      resetBrowse: false,
      resetReview: true,
    });

    expect(result.removedFromReviewPoolCount).toBe(1);
    expect(upsertReviewPoolState).toHaveBeenCalledOnce();
    expect(insertSyncOutboxItem).toHaveBeenCalledOnce();
    expect(deletePackBrowseBookmark).not.toHaveBeenCalled();
  });

  it('未选择任何项时抛错', () => {
    expect(() =>
      resetPackLearningProgress({
        packId: 'remember-test-pack',
        resetBrowse: false,
        resetReview: false,
      }),
    ).toThrow('至少选择一项重置内容');
  });
});
