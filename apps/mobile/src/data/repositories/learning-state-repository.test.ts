import { describe, expect, it, vi } from 'vitest';

vi.mock('../user-db/open-user-database', () => ({
  openUserDatabase: vi.fn(),
}));

import { countDueReviewPoolItems, listDueReviewPoolItems } from './learning-state-repository';

describe('learning-state-repository review pool queries', () => {
  it('listDueReviewPoolItems 仅返回到期且在池内的词条', () => {
    const db = {
      getAllSync: vi.fn(() => [
        {
          knowledgeId: 'pack:en:word:due',
          packId: 'pack',
          easiness: 2.5,
          intervalDays: 0,
          repetitions: 0,
          dueAt: '2026-08-06T07:00:00.000Z',
          clientVersion: 1,
          updatedAt: '2026-08-06T07:00:00.000Z',
          inReviewPool: 1,
          boxLevel: 0,
          firstAddedFromPackId: 'pack',
          lastSeenInPackId: null,
          consecutiveLevel3Passes: 0,
        },
        {
          knowledgeId: 'pack:en:word:future',
          packId: 'pack',
          easiness: 2.5,
          intervalDays: 0,
          repetitions: 0,
          dueAt: '2026-08-08T00:00:00.000Z',
          clientVersion: 1,
          updatedAt: '2026-08-06T07:00:00.000Z',
          inReviewPool: 1,
          boxLevel: 1,
          firstAddedFromPackId: 'pack',
          lastSeenInPackId: null,
          consecutiveLevel3Passes: 0,
        },
      ]),
    };

    const now = new Date('2026-08-06T15:00:00+08:00');
    const dueItems = listDueReviewPoolItems(now, 'Asia/Shanghai', db as never);

    expect(dueItems.map((item) => item.knowledgeId)).toEqual(['pack:en:word:due']);
    expect(countDueReviewPoolItems(now, 'Asia/Shanghai', db as never)).toBe(1);
  });
});
