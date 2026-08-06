import { describe, expect, it } from 'vitest';
import {
  mapSm2IntervalToBoxLevel,
  mapSm2ToInReviewPool,
  runSm2ToReviewPoolMigration,
} from './migrate-sm2-to-review-pool';

describe('mapSm2ToInReviewPool', () => {
  it('未学习过的词不在复习池', () => {
    expect(mapSm2ToInReviewPool(0, 0)).toBe(false);
  });

  it('有 repetitions 或 intervalDays 则在复习池', () => {
    expect(mapSm2ToInReviewPool(1, 0)).toBe(true);
    expect(mapSm2ToInReviewPool(0, 1)).toBe(true);
  });
});

describe('mapSm2IntervalToBoxLevel', () => {
  it('intervalDays <= 1 映射为 boxLevel 0', () => {
    expect(mapSm2IntervalToBoxLevel(0)).toBe(0);
    expect(mapSm2IntervalToBoxLevel(1)).toBe(0);
  });

  it('intervalDays <= 3 映射为 boxLevel 1', () => {
    expect(mapSm2IntervalToBoxLevel(2)).toBe(1);
    expect(mapSm2IntervalToBoxLevel(3)).toBe(1);
  });

  it('intervalDays <= 7 映射为 boxLevel 2', () => {
    expect(mapSm2IntervalToBoxLevel(4)).toBe(2);
    expect(mapSm2IntervalToBoxLevel(7)).toBe(2);
  });

  it('intervalDays >= 8 映射为 boxLevel 3', () => {
    expect(mapSm2IntervalToBoxLevel(8)).toBe(3);
    expect(mapSm2IntervalToBoxLevel(30)).toBe(3);
  });
});

describe('runSm2ToReviewPoolMigration', () => {
  it('按 SM-2 字段更新复习池列', () => {
    const updates: Record<string, unknown>[] = [];
    const db = {
      getAllSync: () => [
        {
          knowledgeId: 'remember-test-pack:en:word:hello',
          packId: 'remember-test-pack',
          repetitions: 2,
          intervalDays: 6,
        },
        {
          knowledgeId: 'remember-test-pack:en:word:world',
          packId: 'remember-test-pack',
          repetitions: 0,
          intervalDays: 0,
        },
      ],
      runSync: (_sql: string, params?: readonly unknown[]) => {
        updates.push({
          inReviewPool: params?.[0],
          boxLevel: params?.[1],
          firstAddedFromPackId: params?.[2],
          knowledgeId: params?.[3],
        });
      },
    };

    runSm2ToReviewPoolMigration(db as never);

    expect(updates).toEqual([
      {
        inReviewPool: 1,
        boxLevel: 2,
        firstAddedFromPackId: 'remember-test-pack',
        knowledgeId: 'remember-test-pack:en:word:hello',
      },
      {
        inReviewPool: 0,
        boxLevel: 0,
        firstAddedFromPackId: 'remember-test-pack',
        knowledgeId: 'remember-test-pack:en:word:world',
      },
    ]);
  });
});
